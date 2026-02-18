import { supabase } from './supabase'

export async function generateNudges(userId) {
  const now = new Date()
  const startOfDay = new Date(now)
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = new Date(now)
  endOfDay.setHours(23, 59, 59, 999)

  // Check existing active nudges for today (max 5)
  const { data: existing } = await supabase
    .from('nudges')
    .select('*')
    .eq('user_id', userId)
    .gte('triggered_at', startOfDay.toISOString())
    .lte('triggered_at', endOfDay.toISOString())
    .neq('status', 'dismissed')

  if (existing && existing.length >= 5) return existing

  const slotsLeft = 5 - (existing?.length || 0)

  // Fetch tasks needed for rule evaluation
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const [{ data: weekTasks }, { data: todayTasks }] = await Promise.all([
    supabase
      .from('tasks')
      .select('id, category, status')
      .eq('user_id', userId)
      .gte('due_at', weekAgo.toISOString()),
    supabase
      .from('tasks')
      .select('id, category, status, title')
      .eq('user_id', userId)
      .gte('due_at', startOfDay.toISOString())
      .lte('due_at', endOfDay.toISOString()),
  ])

  const newNudges = []

  // Rule 1 (pattern): missed 2+ tasks in same category this week
  if (newNudges.length < slotsLeft && weekTasks) {
    const missedByCategory = {}
    weekTasks
      .filter((t) => t.status === 'missed')
      .forEach((t) => {
        missedByCategory[t.category] = (missedByCategory[t.category] || 0) + 1
      })
    const [worstCat, worstCount] =
      Object.entries(missedByCategory).sort(([, a], [, b]) => b - a)[0] || []

    if (worstCat && worstCount >= 2) {
      newNudges.push({
        user_id: userId,
        type: 'pattern',
        title: 'Schedule Earlier',
        message: `You've missed ${worstCount} ${worstCat} tasks this week. Try scheduling them earlier in the day.`,
        impact_score: 0.8,
        status: 'pending',
      })
    }
  }

  // Rule 2 (momentum): completed 3+ tasks today
  if (newNudges.length < slotsLeft && todayTasks) {
    const completedCount = todayTasks.filter((t) => t.status === 'completed').length
    if (completedCount >= 3) {
      newNudges.push({
        user_id: userId,
        type: 'momentum',
        title: "You're on Fire!",
        message: `Amazing! ${completedCount} tasks done today. Keep the streak going — one more!`,
        impact_score: 0.9,
        status: 'pending',
      })
    }
  }

  // Rule 3 (content): has pending Learning tasks today
  if (newNudges.length < slotsLeft && todayTasks) {
    const hasLearning = todayTasks.some(
      (t) => t.category === 'learning' && t.status === 'pending'
    )
    if (hasLearning) {
      newNudges.push({
        user_id: userId,
        type: 'content_capture',
        title: 'Capture Your Insights',
        message: "You have a learning task today. Open Mental Notes to capture what you discover!",
        impact_score: 0.6,
        status: 'pending',
      })
    }
  }

  if (newNudges.length === 0) return existing || []

  const { data: saved, error } = await supabase
    .from('nudges')
    .insert(newNudges)
    .select()

  if (error) throw error
  return [...(existing || []), ...(saved || [])]
}

export async function updateNudgeStatus(id, status) {
  const { data, error } = await supabase
    .from('nudges')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function snoozeNudge(id) {
  const snoozedUntil = new Date(Date.now() + 60 * 60 * 1000).toISOString()
  const { data, error } = await supabase
    .from('nudges')
    .update({ triggered_at: snoozedUntil })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}
