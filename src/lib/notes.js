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

  if (error) {
    // 42703 = undefined_column — source_task_id column not yet migrated in this DB.
    // Retry without it so note creation never fails because of the missing column.
    if (error.code === '42703' && data.source_task_id !== undefined) {
      const { source_task_id: _stripped, ...rest } = data
      const { data: note2, error: error2 } = await supabase
        .from('mental_notes')
        .insert(rest)
        .select()
        .single()
      if (error2) throw error2
      return note2
    }
    throw error
  }
  return note
}

export async function deleteNote(id) {
  const { error } = await supabase
    .from('mental_notes')
    .delete()
    .eq('id', id)

  if (error) throw error
}
