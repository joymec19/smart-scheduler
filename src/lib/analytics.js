import { supabase } from './supabase'

export function getDateRange(range) {
  const now = new Date()
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  if (range === 'this_week') {
    const start = new Date(now)
    const day = start.getDay() || 7           // Sun=7
    start.setDate(start.getDate() - (day - 1)) // rewind to Monday
    start.setHours(0, 0, 0, 0)
    return { start: start.toISOString(), end: end.toISOString() }
  }

  if (range === 'last_week') {
    const start = new Date(now)
    const day = start.getDay() || 7
    start.setDate(start.getDate() - (day - 1) - 7)
    start.setHours(0, 0, 0, 0)
    const lend = new Date(start)
    lend.setDate(lend.getDate() + 6)
    lend.setHours(23, 59, 59, 999)
    return { start: start.toISOString(), end: lend.toISOString() }
  }

  // this_month
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  return { start: start.toISOString(), end: end.toISOString() }
}

export async function completionRate(userId, dateRange) {
  const { start, end } = getDateRange(dateRange)
  const { data, error } = await supabase
    .from('tasks')
    .select('status')
    .eq('user_id', userId)
    .gte('due_at', start)
    .lte('due_at', end)

  if (error) throw error
  if (!data || data.length === 0) return { rate: 0, total: 0, completed: 0 }

  const completed = data.filter((t) => t.status === 'completed').length
  return {
    rate: Math.round((completed / data.length) * 100),
    total: data.length,
    completed,
  }
}

export async function missedByCategory(userId, dateRange) {
  const { start, end } = getDateRange(dateRange)
  const { data, error } = await supabase
    .from('tasks')
    .select('category')
    .eq('user_id', userId)
    .eq('status', 'missed')
    .gte('due_at', start)
    .lte('due_at', end)

  if (error) throw error
  const counts = {}
  ;(data || []).forEach((t) => {
    counts[t.category] = (counts[t.category] || 0) + 1
  })
  return counts
}

export async function timeAccuracy(userId, dateRange) {
  const { start, end } = getDateRange(dateRange)
  const { data, error } = await supabase
    .from('tasks')
    .select('estimated_minutes, actual_minutes')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .not('estimated_minutes', 'is', null)
    .not('actual_minutes', 'is', null)
    .gte('due_at', start)
    .lte('due_at', end)

  if (error) throw error
  if (!data || data.length === 0) return null

  const totalEst = data.reduce((s, t) => s + t.estimated_minutes, 0)
  const totalAct = data.reduce((s, t) => s + t.actual_minutes, 0)
  if (totalEst === 0) return null
  return Math.round((totalAct / totalEst) * 100)
}

export async function notesCreatedByCategory(userId, dateRange) {
  const { start, end } = getDateRange(dateRange)
  const { data, error } = await supabase
    .from('mental_notes')
    .select('category')
    .eq('user_id', userId)
    .gte('created_at', start)
    .lte('created_at', end)

  if (error) throw error
  const counts = {}
  ;(data || []).forEach((n) => {
    counts[n.category] = (counts[n.category] || 0) + 1
  })
  return counts
}

export async function generateInsights(userId) {
  const [rate, missed, accuracy, notesCats] = await Promise.all([
    completionRate(userId, 'this_week'),
    missedByCategory(userId, 'this_week'),
    timeAccuracy(userId, 'this_week'),
    notesCreatedByCategory(userId, 'this_week'),
  ])

  const insights = []

  // Completion rate
  if (rate.total > 0) {
    if (rate.rate >= 80) {
      insights.push({
        id: 'comp_high',
        icon: '🏆',
        text: `${rate.rate}% completion rate this week — outstanding! Keep the streak alive.`,
        route: '/tasks',
      })
    } else if (rate.rate < 50 && rate.total >= 3) {
      insights.push({
        id: 'comp_low',
        icon: '⚡',
        text: `${rate.rate}% tasks done this week. Try breaking them into 15-min chunks to build momentum.`,
        route: '/tasks',
      })
    }
  }

  // Worst missed category
  const missedEntries = Object.entries(missed).sort(([, a], [, b]) => b - a)
  if (missedEntries.length > 0) {
    const [cat, count] = missedEntries[0]
    insights.push({
      id: 'missed_cat',
      icon: '📋',
      text: `You missed ${count} ${cat} task${count > 1 ? 's' : ''} this week. Try scheduling them before noon.`,
      route: '/tasks',
    })
  }

  // Time accuracy
  if (accuracy !== null) {
    if (accuracy > 130) {
      insights.push({
        id: 'time_over',
        icon: '⏱',
        text: `Tasks are taking ${accuracy}% of estimated time. Add a 30% buffer when planning next week.`,
        route: '/tasks',
      })
    } else if (accuracy < 70) {
      insights.push({
        id: 'time_under',
        icon: '🚀',
        text: `You finish tasks in just ${accuracy}% of your estimates — you're faster than you think!`,
        route: '/tasks',
      })
    }
  }

  // Notes habit
  const totalNotes = Object.values(notesCats).reduce((s, v) => s + v, 0)
  if (totalNotes >= 3) {
    const [topCat] = Object.entries(notesCats).sort(([, a], [, b]) => b - a)[0]
    insights.push({
      id: 'notes_habit',
      icon: '📝',
      text: `You captured ${totalNotes} notes this week — mostly ${topCat}. Review them to spot recurring themes.`,
      route: '/notes',
    })
  }

  return insights.slice(0, 3)
}
