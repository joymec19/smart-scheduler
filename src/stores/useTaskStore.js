import { create } from 'zustand'

const useTaskStore = create((set) => ({
  tasks: [],
  loading: false,

  fetchTasks: async () => {
    set({ loading: true })
    // TODO: fetch from Supabase
    set({ loading: false })
  },

  addTask: async (task) => {
    // TODO: insert into Supabase
    set((state) => ({ tasks: [...state.tasks, task] }))
  },

  updateTask: async (id, updates) => {
    // TODO: update in Supabase
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    }))
  },

  deleteTask: async (id) => {
    // TODO: delete from Supabase
    set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }))
  },
}))

export default useTaskStore
