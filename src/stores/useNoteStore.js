import { create } from 'zustand'
import * as notesApi from '../lib/notes'
import toast from 'react-hot-toast'

const useNoteStore = create((set, get) => ({
  notes: [],
  loading: false,
  error: null,

  fetchNotes: async (userId, filters) => {
    set({ loading: true, error: null })
    try {
      const notes = await notesApi.fetchNotes(userId, filters)
      set({ notes, loading: false })
    } catch (err) {
      set({ error: err.message, loading: false })
      toast.error('Failed to load notes')
    }
  },

  addNote: async (data) => {
    try {
      const note = await notesApi.createNote(data)
      set((state) => ({ notes: [note, ...state.notes] }))
      toast.success('Note saved!')
      return note
    } catch (err) {
      toast.error('Failed to save note')
      throw err
    }
  },

  deleteNote: async (id) => {
    try {
      await notesApi.deleteNote(id)
      set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
      toast.success('Note deleted')
    } catch (err) {
      toast.error('Failed to delete note')
      throw err
    }
  },

  // Returns all unique tags used across notes (for suggestions)
  getRecentTags: () => {
    const all = get().notes.flatMap((n) => n.tags || [])
    return [...new Set(all)].slice(0, 20)
  },
}))

export default useNoteStore
