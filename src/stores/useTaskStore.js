import { create } from 'zustand'
import * as tasksApi from '../lib/tasks'
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
