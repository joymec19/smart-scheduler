import { create } from 'zustand'
import * as tasksApi from '../lib/tasks'
import { supabase } from '../lib/supabase'
import { saveSubtasks } from '../lib/decomposition-engine'
import toast from 'react-hot-toast'

const useTaskStore = create((set, get) => ({
  tasks: [],
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

  // Computed helpers
  getByStatus: (status) => get().tasks.filter((t) => t.status === status),
  getCounts: () => {
    const tasks = get().tasks
    return {
      pending: tasks.filter((t) => t.status === 'pending').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      missed: tasks.filter((t) => t.status === 'missed').length,
    }
  },
}))

export default useTaskStore
