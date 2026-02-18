import { supabase } from './supabase'

export async function fetchNotes(userId, filters = {}) {
  let query = supabase
    .from('mental_notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.tag) {
    query = query.contains('tags', [filters.tag])
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createNote(data) {
  const { data: note, error } = await supabase
    .from('mental_notes')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return note
}

export async function deleteNote(id) {
  const { error } = await supabase
    .from('mental_notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
