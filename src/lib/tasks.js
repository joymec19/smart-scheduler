import { supabase } from './supabase'

export async function fetchTasks(userId, filters = {}) {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('due_at', { ascending: true })

  if (filters.status) {
    query = query.eq('status', filters.status)
  }
  if (filters.category) {
    query = query.eq('category', filters.category)
  }
  if (filters.priority) {
    query = query.eq('priority', filters.priority)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createTask(data) {
  const { data: task, error } = await supabase
    .from('tasks')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  return task
}

export async function updateTask(id, updates) {
  const { data: task, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return task
}

export async function deleteTask(id) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function markComplete(id, actualMinutes) {
  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      actual_minutes: actualMinutes,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return task
}

export async function markMissed(id) {
  // First fetch current task to get reschedule_count
  const { data: current, error: fetchError } = await supabase
    .from('tasks')
    .select('reschedule_count')
    .eq('id', id)
    .single()

  if (fetchError) throw fetchError

  const newCount = (current.reschedule_count || 0) + 1

  const { data: task, error } = await supabase
    .from('tasks')
    .update({
      status: 'missed',
      reschedule_count: newCount,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return task
}
