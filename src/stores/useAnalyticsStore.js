import { create } from 'zustand'

const useAnalyticsStore = create((set) => ({
  stats: {},
  loading: false,

  fetchStats: async () => {
    set({ loading: true })
    // TODO: compute from Supabase data
    set({ loading: false })
  },
}))

export default useAnalyticsStore
