import { create } from 'zustand'
import * as tasksApi from '../lib/tasks'
import { supabase } from '../lib/supabase'
import { saveSubtasks } from '../lib/decomposition-engine'
import { getStoredTokens, syncTaskToGoogleCalendar } from '../lib/google-calendar'
import { createRecurringRule } from '../lib/recurring'
import { trackRecurringTaskGenerated } from '../lib/analytics-tracking'
import toast from 'react-hot-toast'

const useTaskStore = create((set, get) => ({
  tasks: [],
  recurringRules: [],
  loading: false,
  error: null,

  fetchTasks: async (userId, filters) => {
    set({ loading: true, error: null })
    try {
      const tasks = await tasksApi.fetchTasks(userId, filters)
      set({ tasks, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      toast.error('Failed to load tasks')
    }
  },

  addTask: async (data) => {
    try {
      const task = await tasksApi.createTask(data)
      set((state) => ({ tasks: [task, ...state.tasks] }))
      toast.success('Task created')
      return task
    } catch (err) {
      toast.error('Failed to create task')
      throw err
    }
  },

  updateTask: async (id, updates) => {
    try {
      const task = await tasksApi.updateTask(id, updates)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
      }))
      toast.success('Task updated')
      return task
    } catch (err) {
      toast.error('Failed to update task')
      throw err
    }
  },

  deleteTask: async (id) => {
    try {
      await tasksApi.deleteTask(id)
      set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
      toast.success('Task deleted')
    } catch (err) {
      toast.error('Failed to delete task')
      throw err
    }
  },

  markComplete: async (id, actualMinutes) => {
    try {
      const task = await tasksApi.markComplete(id, actualMinutes)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
      }))
      toast.success('Task completed!')
    } catch (err) {
      toast.error('Failed to complete task')
      throw err
    }
  },

  markMissed: async (id) => {
    try {
      const task = await tasksApi.markMissed(id)
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === id ? task : t)),
      }))
      toast('Task marked as missed', { icon: '⏭' })
    } catch (err) {
      toast.error('Failed to mark task as missed')
      throw err
    }
  },

  fetchSubtasks: async (parentTaskId) => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('parent_task_id', parentTaskId)
      .order('subtask_order', { ascending: true })
    if (error) throw error
    return data || []
  },

  decomposeTask: async (parentTaskId, subtasks, templateId, clarifyingAnswers) => {
    try {
      const result = await saveSubtasks(parentTaskId, subtasks, templateId, clarifyingAnswers)
      set((state) => ({ tasks: [...state.tasks, ...(result.subtasks || [])] }))
      toast.success('Task broken down into subtasks!')
      return result
    } catch (err) {
      toast.error('Failed to decompose task')
      throw err
    }
  },

  updateSubtaskOrder: async (_parentTaskId, reorderedSubtasks) => {
    try {
      await Promise.all(
        reorderedSubtasks.map((subtask, idx) =>
          supabase
            .from('tasks')
            .update({ subtask_order: idx + 1 })
            .eq('id', subtask.id)
        )
      )
      set((state) => ({
        tasks: state.tasks.map((t) => {
          const idx = reorderedSubtasks.findIndex((s) => s.id === t.id)
          return idx !== -1 ? { ...t, subtask_order: idx + 1 } : t
        }),
      }))
    } catch (err) {
      toast.error('Failed to reorder subtasks')
      throw err
    }
  },

  deleteSubtask: async (subtaskId, parentTaskId) => {
    try {
      await supabase.from('tasks').delete().eq('id', subtaskId)
      const remaining = get()
        .tasks.filter((t) => t.parent_task_id === parentTaskId && t.id !== subtaskId)
        .sort((a, b) => (a.subtask_order || 0) - (b.subtask_order || 0))
      await Promise.all(
        remaining.map((subtask, idx) =>
          supabase.from('tasks').update({ subtask_order: idx + 1 }).eq('id', subtask.id)
        )
      )
      set((state) => ({
        tasks: state.tasks
          .filter((t) => t.id !== subtaskId)
          .map((t) => {
            const idx = remaining.findIndex((s) => s.id === t.id)
            return idx !== -1 ? { ...t, subtask_order: idx + 1 } : t
          }),
      }))
      toast.success('Subtask deleted')
    } catch (err) {
      toast.error('Failed to delete subtask')
      throw err
    }
  },

  updateTaskTime: async (taskId, newDueAt) => {
    const prev = get().tasks.find((t) => t.id === taskId)
    if (!prev) return

    // Optimistic update
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, due_at: newDueAt } : t
      ),
    }))

    try {
      const { data: task, error } = await supabase
        .from('tasks')
        .update({ due_at: newDueAt })
        .eq('id', taskId)
        .select()
        .single()
      if (error) throw error
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? task : t)),
      }))
      // Sync to Google Calendar (fire-and-forget)
      getStoredTokens(task.user_id)
        .then((tokens) => { if (tokens) syncTaskToGoogleCalendar(task, tokens) })
        .catch(() => {})
      const formatted = new Intl.DateTimeFormat(undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      }).format(new Date(newDueAt))
      toast.success(`Task rescheduled to ${formatted}`)
    } catch (err) {
      // Revert on error
      set((state) => ({
        tasks: state.tasks.map((t) => (t.id === taskId ? prev : t)),
      }))
      toast.error('Failed to reschedule task')
    }
  },

  getParentProgress: (parentTaskId) => {
    const subtasks = get().tasks.filter(
      (t) => t.parent_task_id === parentTaskId && t.is_subtask
    )
    const total = subtasks.length
    const completed = subtasks.filter((t) => t.status === 'completed').length
    const nextBlocking =
      subtasks
        .filter((t) => t.status !== 'completed' && t.is_blocking)
        .sort((a, b) => (a.subtask_order || 0) - (b.subtask_order || 0))[0] || null
    return { total, completed, nextBlocking }
  },

  // ── Recurring rules ───────────────────────────────────────────────────────

  fetchRecurringRules: async (userId) => {
    const { data, error } = await supabase
      .from('recurring_rules')
      .select('*')
      .eq('user_id', userId)
      .eq('active', true)
      .order('created_at', { ascending: false })
    if (error) return
    set({ recurringRules: data || [] })
  },

  addRecurringRule: async (ruleData) => {
    try {
      await createRecurringRule(ruleData)
      trackRecurringTaskGenerated({ pattern: ruleData.pattern_key || 'unknown' })
      // Refresh tasks + rules to reflect the newly spawned task
      await Promise.all([
        get().fetchTasks(ruleData.user_id),
        get().fetchRecurringRules(ruleData.user_id),
      ])
      toast.success('Recurring task created!')
    } catch (err) {
      toast.error('Failed to create recurring task')
      throw err
    }
  },

  pauseRule: async (ruleId) => {
    const { error } = await supabase
      .from('recurring_rules')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', ruleId)
    if (error) { toast.error('Failed to pause rule'); return }
    set((state) => ({ recurringRules: state.recurringRules.filter((r) => r.id !== ruleId) }))
    toast.success('Recurring task paused')
  },

  deleteRule: async (ruleId) => {
    const { error } = await supabase
      .from('recurring_rules')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', ruleId)
    if (error) { toast.error('Failed to delete rule'); return }
    set((state) => ({ recurringRules: state.recurringRules.filter((r) => r.id !== ruleId) }))
    toast.success('Recurring rule deleted')
  },

  // Computed helpers
  getByStatus: (status) => get().tasks.filter((t) => t.status === status && !t.is_subtask),
  getCounts: () => {
    const parentTasks = get().tasks.filter((t) => !t.is_subtask)
    return {
      pending: parentTasks.filter((t) => t.status === 'pending').length,
      completed: parentTasks.filter((t) => t.status === 'completed').length,
      missed: parentTasks.filter((t) => t.status === 'missed').length,
    }
  },
}))

export default useTaskStore
