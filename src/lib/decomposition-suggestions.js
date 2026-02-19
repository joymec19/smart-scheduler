// ============================================================================
// decomposition-suggestions.js — Pattern-based suggestions for decomposition
// All logic is heuristic. No AI/LLM calls.
// ============================================================================

import { supabase as defaultClient } from './supabase'

/**
 * Detect if a user repeatedly defers a specific step type and suggest a split.
 *
 * @param {string} userId
 * @param {string} taskCategory
 * @param {object} supabaseClient
 * @returns {{ hasSuggestion: boolean, suggestionText: string, suggestedSplit: Array }}
 */
export async function getPatternSuggestion(userId, taskCategory, supabaseClient) {
  const client = supabaseClient || defaultClient
  const empty = { hasSuggestion: false, suggestionText: '', suggestedSplit: [] }

  // 1. Activity logs for missed/rescheduled subtasks in this category.
  const { data: activityLogs } = await client
    .from('task_activity_logs')
    .select('task_id, event_type')
    .eq('user_id', userId)
    .in('event_type', ['task_missed', 'task_rescheduled'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (!activityLogs?.length) return empty

  const deferredTaskIds = [...new Set(activityLogs.map((l) => l.task_id))]

  // 2. Fetch the subtasks behind those deferrals, filtered to the current category.
  const { data: subtasks } = await client
    .from('tasks')
    .select('id, title, estimated_minutes')
    .in('id', deferredTaskIds)
    .eq('is_subtask', true)
    .eq('category', taskCategory)

  if (!subtasks?.length) return empty

  // 3. Count deferrals per step title (using leading keyword as the grouping key).
  const deferralMap = {}
  for (const subtask of subtasks) {
    const deferCount = activityLogs.filter((l) => l.task_id === subtask.id).length
    if (deferCount === 0) continue

    // Group by first meaningful word of the step title.
    const keyword = subtask.title.split(/\s+/)[0].toLowerCase()
    if (!deferralMap[keyword]) {
      deferralMap[keyword] = { count: 0, title: subtask.title, estimatedMinutes: subtask.estimated_minutes }
    }
    deferralMap[keyword].count += deferCount
    // Keep the highest estimated_minutes as representative for this step type.
    if (subtask.estimated_minutes > deferralMap[keyword].estimatedMinutes) {
      deferralMap[keyword].estimatedMinutes = subtask.estimated_minutes
    }
  }

  // 4. Find the most-deferred pattern with 3+ deferrals.
  const topPattern = Object.values(deferralMap)
    .filter((p) => p.count >= 3)
    .sort((a, b) => b.count - a.count)[0]

  if (!topPattern) return empty

  // 5. Build a concrete split suggestion (collect-links + read-articles style).
  const collectMinutes = Math.min(10, Math.round(topPattern.estimatedMinutes * 0.25))
  const readMinutes = topPattern.estimatedMinutes - collectMinutes

  const suggestionText =
    `You tend to delay "${topPattern.title}" tasks. ` +
    `Want me to split it into "collect links" (${collectMinutes} min) ` +
    `and "read 2 articles" (${readMinutes} min)?`

  const suggestedSplit = [
    { title: 'Collect links', estimatedMinutes: collectMinutes, isBlocking: true  },
    { title: 'Read 2 articles', estimatedMinutes: readMinutes,  isBlocking: false },
  ]

  return { hasSuggestion: true, suggestionText, suggestedSplit }
}

/**
 * Return the ordered subtask chain for a parent task, annotated with
 * which upstream blocking tasks must complete before each step can start.
 *
 * @param {string} parentTaskId
 * @param {object} supabaseClient
 * @returns {Array<{ id, title, subtask_order, is_blocking, status, estimated_minutes, blockedBy, canStart }>}
 */
export async function getDependencyChain(parentTaskId, supabaseClient) {
  const client = supabaseClient || defaultClient

  const { data: subtasks, error } = await client
    .from('tasks')
    .select('id, title, subtask_order, is_blocking, status, estimated_minutes')
    .eq('parent_task_id', parentTaskId)
    .eq('is_subtask', true)
    .order('subtask_order', { ascending: true })

  if (error) throw error
  if (!subtasks?.length) return []

  // Build chain: each task is blocked by any preceding task that is both
  // is_blocking=true and not yet completed.
  return subtasks.map((task, idx) => {
    const blockedBy = subtasks
      .slice(0, idx)
      .filter((t) => t.is_blocking && t.status !== 'completed')
      .map((t) => t.id)

    return {
      ...task,
      blockedBy,
      canStart: blockedBy.length === 0,
    }
  })
}
