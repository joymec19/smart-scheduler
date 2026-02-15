import { create } from 'zustand'

const useNoteStore = create((set) => ({
  notes: [],
  loading: false,

  fetchNotes: async () => {
    set({ loading: true })
    // TODO: fetch from Supabase
    set({ loading: false })
  },

  addNote: async (note) => {
    // TODO: insert into Supabase
    set((state) => ({ notes: [...state.notes, note] }))
  },

  deleteNote: async (id) => {
    // TODO: delete from Supabase
    set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
  },
}))

export default useNoteStore
