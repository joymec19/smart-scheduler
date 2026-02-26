import { RRule } from 'rrule'
import { supabase } from './supabase'

const WEEKDAY_MAP = [RRule.SU, RRule.MO, RRule.TU, RRule.WE, RRule.TH, RRule.FR, RRule.SA]
const WEEKDAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export const RECURRENCE_PATTERNS = {
  DAILY: {
    label: 'Every day',
    rrule: { freq: RRule.DAILY, interval: 1 },
  },
  ALTERNATE: {
    label: 'Every other day',
    rrule: { freq: RRule.DAILY, interval: 2 },
  },
  THREE_PER_WEEK: {
    label: '3x per week',
    rrule: { freq: RRule.WEEKLY, byweekday: [RRule.MO, RRule.WE, RRule.FR] },
  },
  SPECIFIC_DAY: {
    label: 'Specific day weekly',
    rrule: { freq: RRule.WEEKLY },
  },
}

/**
 * @param {object} pattern - one of RECURRENCE_PATTERNS values
 * @param {number|null} specificDay - 0=Sun … 6=Sat; only used for SPECIFIC_DAY
 * @param {Date} startDate
 */
export function buildRRuleString(pattern, specificDay, startDate) {
  const options = { ...pattern.rrule, dtstart: startDate }
  if (options.freq === RRule.WEEKLY && !options.byweekday) {
    options.byweekday = [WEEKDAY_MAP[specificDay ?? 1]]
  }
  return new RRule(options).toString()
}

/**
 * @param {string} rruleString
 * @param {Date} after
 * @returns {Date|null}
 */
export function getNextOccurrence(rruleString, after = new Date()) {
  return RRule.fromString(rruleString).after(after)
}

/** Human-readable description derived from rrule string. */
export function getRuleDescription(rruleString) {
  try {
    const opts = RRule.fromString(rruleString).options
    if (opts.freq === RRule.DAILY) {
      return opts.interval === 2 ? 'Every other day' : 'Every day'
    }
    if (opts.freq === RRule.WEEKLY) {
      const days = opts.byweekday || []
      if (days.length === 3) return '3× per week'
      if (days.length === 1) return `Every ${WEEKDAY_NAMES[days[0]]}`
    }
    return 'Custom schedule'
  } catch {
    return 'Custom schedule'
  }
}

function combineDateAndTime(dateISO, timeStr) {
  const d = new Date(dateISO)
  const [hours, minutes] = (timeStr || '09:00').split(':').map(Number)
  d.setUTCHours(hours, minutes, 0, 0)
  return d.toISOString()
}

/**
 * Inserts a row into recurring_rules and spawns the first task.
 * @param {object} data - { user_id, title, description, category, priority, estimated_minutes, rrule_string, next_occurrence, due_time }
 */
export async function createRecurringRule(data, client = supabase) {
  const { data: rule, error } = await client
    .from('recurring_rules')
    .insert({
      user_id: data.user_id,
      title: data.title,
      description: data.description || null,
      category: data.category,
      priority: data.priority,
      estimated_minutes: data.estimated_minutes || null,
      rrule_string: data.rrule_string,
      next_occurrence: data.next_occurrence,
      due_time: data.due_time || '09:00',
      active: true,
    })
    .select()
    .single()

  if (error) throw error

  await createNextTask(rule, client)
  return rule
}

/**
 * Creates the next pending task for a rule and advances next_occurrence.
 */
export async function createNextTask(rule, client = supabase) {
  const due_at = combineDateAndTime(rule.next_occurrence, rule.due_time)

  const { data: task, error: taskError } = await client
    .from('tasks')
    .insert({
      user_id: rule.user_id,
      title: rule.title,
      description: rule.description,
      category: rule.category,
      priority: rule.priority,
      estimated_minutes: rule.estimated_minutes,
      status: 'pending',
      due_at,
      recurring_rule_id: rule.id,
    })
    .select()
    .single()

  if (taskError) throw taskError

  const currentOcc = new Date(rule.next_occurrence)
  const nextOcc = getNextOccurrence(rule.rrule_string, currentOcc)

  await client
    .from('recurring_rules')
    .update({
      next_occurrence: nextOcc ? nextOcc.toISOString() : null,
      created_task_ids: [...(rule.created_task_ids || []), task.id],
      updated_at: new Date().toISOString(),
    })
    .eq('id', rule.id)

  return task
}

/**
 * Run on app load — spawns tasks for any active rules whose next_occurrence
 * is today or tomorrow (if no task exists yet for that date).
 */
export async function processRecurringRules(userId, client = supabase) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() + 1)

  const { data: rules, error } = await client
    .from('recurring_rules')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .lte('next_occurrence', cutoff.toISOString())
    .not('next_occurrence', 'is', null)

  if (error || !rules?.length) return

  await Promise.allSettled(
    rules.map(async (rule) => {
      const occDate = new Date(rule.next_occurrence)
      const dayStart = new Date(occDate)
      dayStart.setUTCHours(0, 0, 0, 0)
      const dayEnd = new Date(occDate)
      dayEnd.setUTCHours(23, 59, 59, 999)

      const { data: existing } = await client
        .from('tasks')
        .select('id')
        .eq('recurring_rule_id', rule.id)
        .gte('due_at', dayStart.toISOString())
        .lte('due_at', dayEnd.toISOString())
        .limit(1)

      if (!existing?.length) {
        await createNextTask(rule, client)
      }
    })
  )
}
