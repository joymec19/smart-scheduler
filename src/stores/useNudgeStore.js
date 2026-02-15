import { create } from 'zustand'

const useNudgeStore = create((set) => ({
  nudges: [],
  loading: false,

  fetchNudges: async () => {
    set({ loading: true })
    // TODO: fetch from Supabase
    set({ loading: false })
  },

  actOnNudge: async (id) => {
    // TODO: update status in Supabase
    set((state) => ({
      nudges: state.nudges.map((n) =>
        n.id === id ? { ...n, status: 'acted' } : n
      ),
    }))
  },

  dismissNudge: async (id) => {
    // TODO: update status in Supabase
    set((state) => ({
      nudges: state.nudges.map((n) =>
        n.id === id ? { ...n, status: 'dismissed' } : n
      ),
    }))
  },
}))

export default useNudgeStore
