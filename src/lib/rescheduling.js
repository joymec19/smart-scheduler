import { supabase } from './supabase'

// Time-of-day buckets: [startHour, endHour), defaultHour for the slot
const TIME_BUCKETS = {
  morning:   { start: 6,  end: 12, defaultHour: 9  },
  afternoon: { start: 12, end: 17, defaultHour: 14 },
  evening:   { start: 17, end: 22, defaultHour: 18 },
}

// Sensible defaults when < 5 historical tasks
const PRIORITY_DEFAULTS = {
  high:   { bucket: 'morning',   offsetDays: 1 },
  medium: { bucket: 'afternoon', offsetDays: 1 },
  low:    { bucket: 'morning',   offsetDays: 6 }, // ~next weekend
}

function getBucketForHour(hour) {
  for (const [name, { start, end }] of Object.entries(TIME_BUCKETS)) {
    if (hour >= start && hour < end) return name
  }
  return null
}

function buildSlotDatetime(bucketName, offsetDays) {
  const dt = new Date()
  dt.setDate(dt.getDate() + offsetDays)
  dt.setHours(TIME_BUCKETS[bucketName].defaultHour, 0, 0, 0)
  return dt
}

function formatBucketTime(bucketName) {
  const h = TIME_BUCKETS[bucketName].defaultHour
  const suffix = h >= 12 ? 'PM' : 'AM'
  const display = h > 12 ? h - 12 : h
  return `${display}:00 ${suffix}`
}

/**
 * Suggest a reschedule for a task.
 *
 * @param {object} task - Full task row (needs: id, user_id, category, priority, due_at)
 * @returns {{ suggested_datetime: string, rationale_text: string, confidence_score: number }}
 */
export async function suggestReschedule(task) {
  const { user_id: userId, category, priority } = task

  // 1. Fetch last 20 completed tasks in the same category
  const { data: history, error } = await supabase
    .from('tasks')
    .select('completed_at')
    .eq('user_id', userId)
    .eq('category', category)
    .eq('status', 'completed')
    .not('completed_at', 'is', null)
    .order('completed_at', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[rescheduling] failed to fetch history:', error.message)
  }

  const valid = (history || []).filter((t) => t.completed_at)

  // 2. Fall back to priority defaults when insufficient data
  if (valid.length < 5) {
    const def = PRIORITY_DEFAULTS[priority] || PRIORITY_DEFAULTS.medium
    const suggested = buildSlotDatetime(def.bucket, def.offsetDays)
    const timeStr = formatBucketTime(def.bucket)
    const dayLabel = def.offsetDays === 1 ? 'tomorrow' : `in ${def.offsetDays} days`

    return {
      suggested_datetime: suggested.toISOString(),
      rationale_text: `Not enough history for ${category} tasks yet. Based on your ${priority} priority, we suggest the ${def.bucket} slot (${timeStr}) ${dayLabel}.`,
      confidence_score: 0.3,
    }
  }

  // 3. Count completions per bucket
  const bucketCounts = { morning: 0, afternoon: 0, evening: 0 }
  for (const { completed_at } of valid) {
    const hour = new Date(completed_at).getHours()
    const bucket = getBucketForHour(hour)
    if (bucket) bucketCounts[bucket]++
  }

  // 4. Pick the bucket with the most completions
  const bestBucket = Object.entries(bucketCounts).reduce(
    (best, [name, count]) => (count > best[1] ? [name, count] : best),
    ['morning', -1]
  )[0]

  const bestCount = bucketCounts[bestBucket]
  const confidence = parseFloat(
    Math.min(0.5 + (bestCount / valid.length) * 0.5, 0.95).toFixed(2)
  )

  // 5. Build suggested slot (skip today → +1 day minimum)
  const suggested = buildSlotDatetime(bestBucket, 1)
  const timeStr = formatBucketTime(bestBucket)

  return {
    suggested_datetime: suggested.toISOString(),
    rationale_text: `You complete ${category} tasks most often in the ${bestBucket} — ${bestCount} of your last ${valid.length} completions happened then. We've picked ${timeStr} tomorrow.`,
    confidence_score: confidence,
  }
}
