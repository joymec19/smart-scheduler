// ============================================================================
// decomposition-engine.js — Rule-based task decomposition logic
// All logic is heuristic/template-driven. No AI/LLM calls.
// ============================================================================

import { supabase as defaultClient } from './supabase'
import { TEMPLATES } from './decomposition-templates'

// ---------- Private helpers --------------------------------------------------

function inferSubType(category, clarifyingAnswer) {
  if (!clarifyingAnswer) return null
  const answer = clarifyingAnswer.toLowerCase()
  if (category === 'learning') {
    if (/article|blog|essay|write|paper|guide/.test(answer)) return 'long_form_article'
  }
  return null
}

function getBaseSteps(template, subType) {
  if (subType && template.subTypes?.[subType]) {
    return template.subTypes[subType].defaultSteps.map((s) => ({ ...s }))
  }
  return template.defaultSteps.map((s) => ({ ...s }))
}

// HIGH priority: compress to 15-30 min, front-load blocking steps.
// MEDIUM priority: clamp to 20-45 min, inject a checkpoint at midpoint.
// LOW priority: clamp to 15-25 min for focused, exploratory work.
function applyPriorityAdjustment(steps, priority) {
  if (priority === 'high') {
    return steps.map((step, i) => ({
      ...step,
      estimatedMinutes: Math.min(30, Math.max(15, Math.round(step.estimatedMinutes * 0.7))),
      isBlocking: i < Math.ceil(steps.length / 2) ? true : step.isBlocking,
    }))
  }

  if (priority === 'medium') {
    const clamped = steps.map((step) => ({
      ...step,
      estimatedMinutes: Math.min(45, Math.max(20, step.estimatedMinutes)),
    }))
    const midpoint = Math.floor(clamped.length / 2)
    clamped.splice(midpoint, 0, {
      title: 'Checkpoint — review progress',
      estimatedMinutes: 10,
      isBlocking: false,
    })
    return clamped
  }

  if (priority === 'low') {
    return steps.map((step) => ({
      ...step,
      estimatedMinutes: Math.min(25, Math.max(15, Math.round(step.estimatedMinutes * 0.6))),
    }))
  }

  return steps
}

// Scale all step durations proportionally so they sum to targetMinutes.
function scaleToTargetMinutes(steps, targetMinutes) {
  const total = steps.reduce((sum, s) => sum + s.estimatedMinutes, 0)
  if (total === 0) return steps
  const scale = targetMinutes / total
  return steps.map((step) => ({
    ...step,
    estimatedMinutes: Math.max(5, Math.round(step.estimatedMinutes * scale)),
  }))
}

// Split any step whose duration exceeds 1.5× the preferred chunk size.
function applyChunkSize(steps, chunkMinutes) {
  const result = []
  for (const step of steps) {
    if (step.estimatedMinutes > chunkMinutes * 1.5) {
      const parts = Math.ceil(step.estimatedMinutes / chunkMinutes)
      const partMinutes = Math.round(step.estimatedMinutes / parts)
      for (let i = 0; i < parts; i++) {
        result.push({
          ...step,
          title: `${step.title} (${i + 1}/${parts})`,
          estimatedMinutes: partMinutes,
          isBlocking: i === 0 ? step.isBlocking : false,
        })
      }
    } else {
      result.push(step)
    }
  }
  return result
}

// Merge consecutive non-blocking steps whose combined duration stays ≤ 45 min.
function mergeAdjacentSteps(steps) {
  if (steps.length <= 2) return steps
  const result = []
  let i = 0
  while (i < steps.length) {
    const curr = steps[i]
    const next = steps[i + 1]
    if (
      next &&
      !curr.isBlocking &&
      !next.isBlocking &&
      curr.estimatedMinutes + next.estimatedMinutes <= 45
    ) {
      result.push({
        title: `${curr.title} + ${next.title}`,
        estimatedMinutes: curr.estimatedMinutes + next.estimatedMinutes,
        isBlocking: false,
      })
      i += 2
    } else {
      result.push(curr)
      i += 1
    }
  }
  return result
}

// Split every step longer than 45 min into two halves.
function splitLargeSteps(steps) {
  const result = []
  for (const step of steps) {
    if (step.estimatedMinutes > 45) {
      const half = Math.round(step.estimatedMinutes / 2)
      result.push(
        { ...step, title: `${step.title} — part 1`, estimatedMinutes: half },
        { ...step, title: `${step.title} — part 2`, estimatedMinutes: step.estimatedMinutes - half, isBlocking: false }
      )
    } else {
      result.push(step)
    }
  }
  return result
}

// ---------- Public API -------------------------------------------------------

/**
 * Generate an ordered subtask list for a task.
 *
 * @param {object} task            - Full task row (user_id, category, priority, estimated_minutes)
 * @param {string} clarifyingAnswer - User's answer to the clarifying question
 * @param {object} userPreferences  - { preferred_chunk_minutes?, granularity_preference? }
 * @returns {Array<{ title, estimatedMinutes, order, isBlocking, category }>}
 */
export async function generateSubtasks(task, clarifyingAnswer, userPreferences = {}) {
  const { category, priority, estimated_minutes, user_id } = task
  const template = TEMPLATES[category] || TEMPLATES.work
  const subType = inferSubType(category, clarifyingAnswer)

  let steps = getBaseSteps(template, subType)

  // Prefer a user-customised template over the system default.
  if (user_id) {
    try {
      let q = defaultClient
        .from('decomposition_templates')
        .select('steps')
        .eq('user_id', user_id)
        .eq('category', category)
        .eq('is_system', false)
        .order('usage_count', { ascending: false })
        .limit(1)

      q = subType ? q.eq('sub_type', subType) : q.is('sub_type', null)

      const { data: userTpl } = await q.maybeSingle()
      if (userTpl?.steps?.length) {
        steps = userTpl.steps.map((s) => ({
          title: s.title,
          estimatedMinutes: s.estimated_minutes,
          isBlocking: s.is_blocking ?? false,
        }))
      }
    } catch (_) {
      // fall through — use static defaults
    }
  }

  steps = applyPriorityAdjustment(steps, priority)

  if (estimated_minutes) {
    steps = scaleToTargetMinutes(steps, estimated_minutes)
  }

  const { preferred_chunk_minutes, granularity_preference } = userPreferences

  if (preferred_chunk_minutes) {
    steps = applyChunkSize(steps, preferred_chunk_minutes)
  }

  if (granularity_preference === 'fewer_steps') {
    steps = mergeAdjacentSteps(steps)
  } else if (granularity_preference === 'more_detail') {
    steps = splitLargeSteps(steps)
  }

  return steps.map((step, idx) => ({
    title: step.title,
    estimatedMinutes: Math.max(5, Math.round(step.estimatedMinutes)),
    order: idx + 1,
    isBlocking: Boolean(step.isBlocking),
    category,
  }))
}

/**
 * Adjust subtask estimates based on the user's historical patterns.
 *
 * @param {string} userId
 * @param {Array}  subtasks
 * @param {object} supabaseClient
 * @returns {Array} adjusted subtasks
 */
export async function adjustForUserPatterns(userId, subtasks, supabaseClient) {
  const client = supabaseClient || defaultClient

  // 1. Last 10 decomposition logs — inspect user_edits for deletion patterns.
  const { data: logs } = await client
    .from('decomposition_logs')
    .select('user_edits')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10)

  // 2. Activity logs for subtask completion/deferral — used for estimate calibration.
  const { data: activityLogs } = await client
    .from('task_activity_logs')
    .select('event_type, payload')
    .eq('user_id', userId)
    .in('event_type', ['task_completed', 'task_missed', 'task_rescheduled'])
    .order('created_at', { ascending: false })
    .limit(100)

  // 3. Count deleted step-title keywords across all logs.
  const deletionCounts = {}
  for (const log of logs || []) {
    for (const edit of log.user_edits || []) {
      if (edit.action === 'deleted' && edit.step_title) {
        const key = edit.step_title.toLowerCase()
        deletionCounts[key] = (deletionCounts[key] || 0) + 1
      }
    }
  }

  // 4. Compute a moving-average estimate ratio from completed subtasks.
  let estimateRatio = 1
  const completions = (activityLogs || []).filter((e) => e.event_type === 'task_completed')
  if (completions.length >= 3) {
    const ratios = completions
      .map(({ payload }) => {
        const { actual_minutes: actual, estimated_minutes: est } = payload || {}
        return actual && est && est > 0 ? actual / est : null
      })
      .filter(Boolean)
    if (ratios.length > 0) {
      const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length
      estimateRatio = Math.min(2, Math.max(0.5, avg)) // clamp to 0.5×–2×
    }
  }

  // 5. Apply adjustments.
  return subtasks.map((subtask) => {
    const titleKey = subtask.title.toLowerCase()

    // If the user has deleted a step matching this title 3+ times, halve its duration
    // so that the smaller chunk is less intimidating.
    const isDeferredPattern = Object.entries(deletionCounts).some(
      ([key, count]) => count >= 3 && titleKey.startsWith(key.split(' ')[0])
    )
    if (isDeferredPattern && subtask.estimatedMinutes > 20) {
      return {
        ...subtask,
        estimatedMinutes: Math.max(5, Math.round(subtask.estimatedMinutes * 0.5)),
        splitSuggestion: true,
      }
    }

    // Otherwise calibrate to the user's actual pace.
    if (estimateRatio !== 1) {
      return {
        ...subtask,
        estimatedMinutes: Math.max(5, Math.round(subtask.estimatedMinutes * estimateRatio)),
      }
    }

    return subtask
  })
}

/**
 * Persist subtasks, log the decomposition, and increment template usage.
 *
 * @param {string} parentTaskId
 * @param {Array}  subtasks          - Output of generateSubtasks (+ adjustForUserPatterns)
 * @param {string|null} templateId
 * @param {object} clarifyingAnswers - { question, answer }
 * @param {object} supabaseClient
 * @returns {{ subtasks: Array, logId: string }}
 */
export async function saveSubtasks(
  parentTaskId,
  subtasks,
  templateId,
  clarifyingAnswers,
  supabaseClient
) {
  const client = supabaseClient || defaultClient

  // Fetch parent for inherited fields (user_id, category, priority, estimated_minutes).
  const { data: parent, error: parentErr } = await client
    .from('tasks')
    .select('user_id, category, priority, estimated_minutes')
    .eq('id', parentTaskId)
    .single()

  if (parentErr) throw parentErr

  const decompositionSource = templateId ? 'template' : 'user_custom'

  // 1. Insert subtask rows.
  const rows = subtasks.map((sub) => ({
    user_id: parent.user_id,
    title: sub.title,
    category: parent.category,
    priority: parent.priority,
    status: 'pending',
    estimated_minutes: sub.estimatedMinutes,
    parent_task_id: parentTaskId,
    is_subtask: true,
    subtask_order: sub.order,
    is_blocking: sub.isBlocking,
    decomposition_source: decompositionSource,
  }))

  const { data: created, error: insertErr } = await client
    .from('tasks')
    .insert(rows)
    .select()

  if (insertErr) throw insertErr

  // 2. Record a task_activity_log event on the parent task.
  // Note: 'decomposed' is not yet an enum value in task_status — we track via activity log.
  await client.from('task_activity_logs').insert({
    user_id: parent.user_id,
    task_id: parentTaskId,
    event_type: 'task_decomposed',
    payload: {
      subtasks_generated: subtasks.length,
      template_id: templateId || null,
    },
  })

  // 3. Log to decomposition_logs.
  const { data: logEntry, error: logErr } = await client
    .from('decomposition_logs')
    .insert({
      user_id: parent.user_id,
      parent_task_id: parentTaskId,
      template_id: templateId || null,
      original_estimated_minutes: parent.estimated_minutes,
      subtasks_generated: subtasks.length,
      user_edits: [],
      clarifying_answers: clarifyingAnswers || {},
    })
    .select()
    .single()

  if (logErr) throw logErr

  // 4. Increment template usage_count (best-effort).
  if (templateId) {
    const { data: tpl } = await client
      .from('decomposition_templates')
      .select('usage_count')
      .eq('id', templateId)
      .maybeSingle()

    if (tpl) {
      await client
        .from('decomposition_templates')
        .update({ usage_count: (tpl.usage_count || 0) + 1 })
        .eq('id', templateId)
    }
  }

  return { subtasks: created, logId: logEntry.id }
}

/**
 * Record user edits to a decomposition and learn from repeated patterns.
 *
 * @param {string} decompositionLogId
 * @param {Array}  userEdits  - [{ action: 'deleted'|'renamed'|'merged'|'reordered', ... }]
 * @param {object} supabaseClient
 * @returns {{ success: boolean, hasStrongPattern: boolean }}
 */
export async function learnFromEdits(decompositionLogId, userEdits, supabaseClient) {
  const client = supabaseClient || defaultClient

  // 1. Persist edits on the log entry.
  const { data: log, error: updateErr } = await client
    .from('decomposition_logs')
    .update({ user_edits: userEdits })
    .eq('id', decompositionLogId)
    .select('user_id, template_id')
    .single()

  if (updateErr) throw updateErr

  // 2. Scan recent logs for repeated edit patterns.
  const { data: recentLogs } = await client
    .from('decomposition_logs')
    .select('user_edits, template_id')
    .eq('user_id', log.user_id)
    .not('user_edits', 'eq', '[]')
    .order('created_at', { ascending: false })
    .limit(10)

  const patternCounts = {}
  for (const entry of recentLogs || []) {
    for (const edit of entry.user_edits || []) {
      const key = `${edit.action}::${edit.step_title || edit.from || ''}`
      patternCounts[key] = (patternCounts[key] || 0) + 1
    }
  }

  const hasStrongPattern = Object.values(patternCounts).some((c) => c >= 3)

  // 3. If a strong pattern exists, create or update a user-specific template variant.
  if (hasStrongPattern && log.template_id) {
    const { data: baseTpl } = await client
      .from('decomposition_templates')
      .select('*')
      .eq('id', log.template_id)
      .maybeSingle()

    if (baseTpl) {
      let customSteps = [...(baseTpl.steps || [])]

      for (const edit of userEdits) {
        if (edit.action === 'deleted') {
          customSteps = customSteps.filter((s) => s.title !== edit.step_title)
        } else if (edit.action === 'renamed') {
          customSteps = customSteps.map((s) =>
            s.title === edit.from ? { ...s, title: edit.to } : s
          )
        } else if (edit.action === 'merged') {
          const idx = customSteps.findIndex((s) => s.title === edit.steps?.[0])
          if (idx !== -1 && edit.steps?.length > 1) {
            const merged = customSteps.filter((s) => edit.steps.includes(s.title))
            const totalMin = merged.reduce((sum, s) => sum + (s.estimated_minutes || 0), 0)
            customSteps = customSteps.filter((s) => !edit.steps.includes(s.title))
            customSteps.splice(idx, 0, { title: edit.into, estimated_minutes: totalMin, is_blocking: false })
          }
        } else if (edit.action === 'reordered') {
          const idx = customSteps.findIndex((s) => s.title === edit.step_title)
          if (idx !== -1) {
            const [moved] = customSteps.splice(idx, 1)
            customSteps.splice((edit.to_order || 1) - 1, 0, moved)
          }
        }
      }

      // Re-assign order field to keep steps consistent.
      customSteps = customSteps.map((s, i) => ({ ...s, order: i + 1 }))

      const { data: existing } = await client
        .from('decomposition_templates')
        .select('id')
        .eq('user_id', log.user_id)
        .eq('category', baseTpl.category)
        .eq('is_system', false)
        .is('sub_type', baseTpl.sub_type ?? null)
        .maybeSingle()

      if (existing) {
        await client
          .from('decomposition_templates')
          .update({ steps: customSteps, updated_at: new Date().toISOString() })
          .eq('id', existing.id)
      } else {
        await client.from('decomposition_templates').insert({
          user_id: log.user_id,
          category: baseTpl.category,
          sub_type: baseTpl.sub_type ?? null,
          priority: baseTpl.priority,
          steps: customSteps,
          is_system: false,
          usage_count: 0,
        })
      }
    }
  }

  // 4. Update chunk-size preference if user is consistently merging steps.
  const mergeEdits = userEdits.filter((e) => e.action === 'merged')
  if (mergeEdits.length > 0) {
    await client
      .from('user_decomposition_preferences')
      .upsert(
        { user_id: log.user_id, granularity_preference: 'fewer_steps', updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
  }

  return { success: true, hasStrongPattern }
}
