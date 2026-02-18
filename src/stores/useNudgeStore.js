import { create } from 'zustand'
import * as nudgesApi from '../lib/nudges'
import toast from 'react-hot-toast'

const useNudgeStore = create((set, get) => ({
  nudges: [],
  loading: false,

  fetchNudges: async (userId) => {
    set({ loading: true })
    try {
      const nudges = await nudgesApi.generateNudges(userId)
      set({ nudges, loading: false })
    } catch (err) {
      set({ loading: false })
      toast.error('Failed to load nudges')
    }
  },

  actOnNudge: async (id) => {
    try {
      const updated = await nudgesApi.updateNudgeStatus(id, 'acted')
      set((state) => ({
        nudges: state.nudges.map((n) => (n.id === id ? updated : n)),
      }))
    } catch {
      toast.error('Failed to update nudge')
    }
  },

  dismissNudge: async (id) => {
    try {
      const updated = await nudgesApi.updateNudgeStatus(id, 'dismissed')
      set((state) => ({
        nudges: state.nudges.map((n) => (n.id === id ? updated : n)),
      }))
    } catch {
      toast.error('Failed to dismiss nudge')
    }
  },

  snoozeNudge: async (id) => {
    try {
      const updated = await nudgesApi.snoozeNudge(id)
      set((state) => ({
        nudges: state.nudges.map((n) => (n.id === id ? updated : n)),
      }))
      toast('Nudge snoozed for 1 hour', { icon: '⏰' })
    } catch {
      toast.error('Failed to snooze nudge')
    }
  },

  // Only nudges not dismissed and triggered_at <= now
  getActiveNudges: () => {
    const now = Date.now()
    return get().nudges.filter(
      (n) =>
        n.status !== 'dismissed' &&
        n.status !== 'acted' &&
        new Date(n.triggered_at).getTime() <= now
    )
  },
}))

export default useNudgeStore
