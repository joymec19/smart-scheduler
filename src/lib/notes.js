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
    // 42703 = undefined_column — strip unknown columns and retry once so note
    // creation never fails because of a missing migration (source_task_id,
    // auto_generated, parent_task_id, insight_type).
    if (error.code === '42703') {
      const { source_task_id: _s, auto_generated: _a, parent_task_id: _p, insight_type: _i, ...rest } = data
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
