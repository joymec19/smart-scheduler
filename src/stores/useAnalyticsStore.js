import { create } from 'zustand'
import toast from 'react-hot-toast'
import * as analyticsApi from '../lib/analytics'

const useAnalyticsStore = create((set) => ({
  stats: null,      // { completionRate, timeAccuracy, missedByCategory, notesByCategory, notesTotal, insights }
  prevRate: null,   // last week's rate for trend arrow
  loading: false,

  fetchStats: async (userId, range = 'this_week') => {
    set({ loading: true })
    try {
      const [rate, missed, accuracy, notesCats, insights] = await Promise.all([
        analyticsApi.completionRate(userId, range),
        analyticsApi.missedByCategory(userId, range),
        analyticsApi.timeAccuracy(userId, range),
        analyticsApi.notesCreatedByCategory(userId, range),
        range === 'this_week'
          ? analyticsApi.generateInsights(userId)
          : Promise.resolve([]),
      ])

      let prevRate = null
      if (range === 'this_week') {
        const prev = await analyticsApi.completionRate(userId, 'last_week')
        prevRate = prev.rate
      }

      set({
        stats: {
          completionRate: rate,
          timeAccuracy: accuracy,
          missedByCategory: missed,
          notesByCategory: notesCats,
          notesTotal: Object.values(notesCats).reduce((s, v) => s + v, 0),
          insights,
        },
        prevRate,
        loading: false,
      })
    } catch {
      set({ loading: false })
      toast.error('Failed to load analytics')
    }
  },
}))

export default useAnalyticsStore
