// Supabase Edge Function — Daily Nudge Generation
// Trigger: pg_cron daily at 08:00 UTC (configure via Supabase dashboard)
//
// Deploy:
//   supabase functions deploy generate-daily-nudges
//
// Set cron (Supabase dashboard → Database → Extensions → pg_cron):
//   select cron.schedule(
//     'daily-nudges',
//     '0 8 * * *',
//     $$
//       select net.http_post(
//         url      => '<SUPABASE_URL>/functions/v1/generate-daily-nudges',
//         headers  => '{"Authorization": "Bearer <SUPABASE_ANON_KEY>"}'::jsonb,
//         body     => '{}'::jsonb
//       )
//     $$
//   );

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// ── Static resource maps (mirrors src/lib/nudges.js) ─────────────────────

const TOPIC_TO_LINKS: Record<string, string[]> = {
  javascript:   ['https://javascript.info', 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', 'https://github.com/getify/You-Dont-Know-JS'],
  react:        ['https://react.dev/learn', 'https://ui.dev/react', 'https://overreacted.io'],
  python:       ['https://docs.python.org/3/tutorial/', 'https://realpython.com', 'https://www.youtube.com/@ArjanCodes'],
  design:       ['https://www.refactoringui.com', 'https://www.nngroup.com/articles', 'https://lawsofux.com'],
  marketing:    ['https://moz.com/blog', 'https://neilpatel.com/blog/', 'https://backlinko.com/blog'],
  writing:      ['https://www.nngroup.com/articles/writing-for-the-web/', 'https://www.julian.com/guide/write/intro', 'https://sive.rs/d1'],
  productivity: ['https://fortelabs.com/blog/', 'https://nesslabs.com', 'https://todoist.com/inspiration'],
  data:         ['https://towardsdatascience.com', 'https://www.kaggle.com/learn', 'https://fast.ai'],
  ai:           ['https://www.deeplearning.ai', 'https://huggingface.co/learn', 'https://simonwillison.net'],
  default:      ['https://medium.com', 'https://dev.to', 'https://hackernoon.com'],
}

const PODCAST_LINKS: Record<string, string> = {
  health:       'https://www.hubermanlab.com/episodes',
  fitness:      'https://www.hubermanlab.com/episodes',
  mindfulness:  'https://www.tenpercent.com/podcast-episode',
  personal:     'https://tim.blog/podcast/',
  productivity: 'https://www.relay.fm/cortex',
  default:      'https://open.spotify.com/search/productivity%20podcast',
}

// ── Helper functions ──────────────────────────────────────────────────────

function extractTopicFromTitle(text: string): string {
  const lower = (text || '').toLowerCase()
  for (const key of Object.keys(TOPIC_TO_LINKS).filter((k) => k !== 'default')) {
    if (lower.includes(key)) return key
  }
  if (lower.includes('machine learning') || lower.includes(' ml ') || lower.includes('neural')) return 'ai'
  if (lower.includes('node') || lower.includes('typescript') || lower.includes('vue')) return 'javascript'
  if (lower.includes('ux') || lower.includes('figma') || lower.includes('ui ')) return 'design'
  if (lower.includes('seo') || lower.includes('content') || lower.includes('social media')) return 'marketing'
  if (lower.includes('dataset') || lower.includes('analytics') || lower.includes('sql')) return 'data'
  return 'default'
}

function extractPodcastTopic(titles: string[]): string {
  const combined = titles.join(' ').toLowerCase()
  if (combined.includes('fitness') || combined.includes('gym') || combined.includes('run')) return 'fitness'
  if (combined.includes('mindful') || combined.includes('meditat')) return 'mindfulness'
  if (combined.includes('productiv') || combined.includes('planning') || combined.includes('habit')) return 'productivity'
  if (combined.includes('health') || combined.includes('wellness')) return 'health'
  return 'personal'
}

// ── Core nudge generation for a single user ───────────────────────────────

async function generateNudgesForUser(
  // deno-lint-ignore no-explicit-any
  supabase: any,
  userId: string
): Promise<number> {
  const now = new Date()
  const startOfDay = new Date(now); startOfDay.setHours(0, 0, 0, 0)
  const endOfDay   = new Date(now); endOfDay.setHours(23, 59, 59, 999)
  const cutoff24h  = new Date(Date.now() - 24 * 60 * 60 * 1000)

  // 1. Purge stale active nudges older than 24 h
  await supabase
    .from('nudges')
    .delete()
    .eq('user_id', userId)
    .eq('status', 'active')
    .lt('triggered_at', cutoff24h.toISOString())

  // 2. Enforce max-5 quota: delete oldest active if exceeded
  const { data: allActive } = await supabase
    .from('nudges')
    .select('id, triggered_at')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('triggered_at', { ascending: true })

  if ((allActive || []).length >= 5) return 0   // already at quota; cron will try again tomorrow

  const slotsLeft = 5 - (allActive || []).length

  // 3. Fetch task data
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const [{ data: weekTasks }, { data: todayTasks }, { data: futureTasks }] = await Promise.all([
    supabase.from('tasks').select('category, status').eq('user_id', userId).gte('due_at', weekAgo.toISOString()),
    supabase.from('tasks').select('id, category, status, title').eq('user_id', userId).gte('due_at', startOfDay.toISOString()).lte('due_at', endOfDay.toISOString()),
    supabase.from('tasks').select('id, category, status, title, description').eq('user_id', userId).gt('due_at', endOfDay.toISOString()).order('due_at', { ascending: true }).limit(10),
  ])

  const safeWeek   = (weekTasks   || []) as Array<{ category: string; status: string }>
  const safeToday  = (todayTasks  || []) as Array<{ id: string; category: string; status: string; title: string }>
  const safeFuture = (futureTasks || []) as Array<{ id: string; category: string; status: string; title: string; description?: string }>
  const allUpcoming = [...safeToday, ...safeFuture].filter((t) => t.status === 'pending')

  // deno-lint-ignore no-explicit-any
  const candidates: any[] = []

  // Rule 1: pattern
  const missedByCategory: Record<string, number> = {}
  safeWeek.filter((t) => t.status === 'missed').forEach((t) => {
    missedByCategory[t.category] = (missedByCategory[t.category] || 0) + 1
  })
  const worstEntry = Object.entries(missedByCategory).sort(([, a], [, b]) => b - a)[0]
  if (worstEntry && worstEntry[1] >= 2) {
    const [cat, count] = worstEntry
    candidates.push({ user_id: userId, type: 'pattern', title: 'Schedule Earlier', message: `You've missed ${count} ${cat} tasks this week. Try scheduling them earlier in the day.`, impact_score: 0.8, status: 'active' })
  }

  // Rule 2: momentum
  const completedCount = safeToday.filter((t) => t.status === 'completed').length
  if (completedCount >= 3) {
    candidates.push({ user_id: userId, type: 'momentum', title: "You're on Fire!", message: `Amazing! ${completedCount} tasks done today. Keep the streak going — one more!`, impact_score: 0.9, status: 'active' })
  }

  // Rule 3: content_capture
  const hasLearningToday = safeToday.some((t) => t.category === 'learning' && t.status === 'pending')
  if (hasLearningToday) {
    candidates.push({ user_id: userId, type: 'content_capture', title: 'Capture Your Insights', message: 'You have a learning task today. Open Mental Notes to capture what you discover!', impact_score: 0.6, status: 'active' })
  }

  // Rule 4a: podcast_bundling
  const healthTask = allUpcoming.find((t) => ['health', 'personal'].includes(t.category))
  if (healthTask) {
    const { data: pastLearning } = await supabase
      .from('tasks').select('title').eq('user_id', userId)
      .in('category', ['learning', 'info']).lt('due_at', startOfDay.toISOString())
      .order('due_at', { ascending: false }).limit(5)
    const topic = extractPodcastTopic(((pastLearning || []) as Array<{ title: string }>).map((t) => t.title))
    const podcastUrl = PODCAST_LINKS[topic] || PODCAST_LINKS.default
    candidates.push({ user_id: userId, type: 'podcast_bundling', title: 'Pair Activity with Learning 🎧', message: `Pair your "${healthTask.title}" with a ${topic} podcast. Tap to listen!||url:${podcastUrl}||`, impact_score: 0.75, status: 'active', related_task_id: healthTask.id })
  }

  // Rule 4b: learning_content
  const learningTask = allUpcoming.find((t) => t.category === 'learning')
  if (learningTask) {
    const topic = extractTopicFromTitle((learningTask.title || '') + ' ' + (learningTask.description || ''))
    const links = TOPIC_TO_LINKS[topic] || TOPIC_TO_LINKS.default
    candidates.push({ user_id: userId, type: 'learning_content', title: 'Boost Your Learning 📚', message: `Studying "${learningTask.title}"? Tap for curated resources to accelerate your progress.||url:${links[0]}||`, impact_score: 0.8, status: 'active', related_task_id: learningTask.id })
  }

  // Rule 4c: work_reflection
  const workTask = safeToday.find((t) => t.category === 'work' && t.status === 'pending')
  if (workTask) {
    candidates.push({ user_id: userId, type: 'work_reflection', title: 'End-of-Day Reflection 💼', message: `Finishing "${workTask.title}" today? Capture your top 3 wins + blockers in Mental Notes.`, impact_score: 0.7, status: 'active', related_task_id: workTask.id })
  }

  if (candidates.length === 0) return 0

  // Deduplicate by type, sort, slice to quota
  const byType: Record<string, typeof candidates[0]> = {}
  for (const c of candidates) {
    if (!byType[c.type] || c.impact_score > byType[c.type].impact_score) byType[c.type] = c
  }
  const toInsert = Object.values(byType)
    .sort((a, b) => b.impact_score - a.impact_score)
    .slice(0, slotsLeft)

  const { error } = await supabase.from('nudges').insert(toInsert)
  if (error) {
    console.error(`[nudges] insert failed for ${userId}:`, error.message)
    return 0
  }
  return toInsert.length
}

// ── Entry point ───────────────────────────────────────────────────────────

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    // Service role bypasses RLS — required to read/write all users
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  // Fetch profiles that haven't had nudges generated in the last 24 h (or ever)
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id')
    .or(`last_nudge_generation.is.null,last_nudge_generation.lt.${cutoff}`)

  if (profileErr) {
    console.error('[daily-nudges] profiles query failed:', profileErr.message)
    return new Response(JSON.stringify({ ok: false, error: profileErr.message }), { status: 500 })
  }

  const users = profiles || []
  let totalGenerated = 0
  let failed = 0

  for (const { id: userId } of users) {
    try {
      const count = await generateNudgesForUser(supabase, userId)
      totalGenerated += count

      await supabase
        .from('profiles')
        .update({ last_nudge_generation: new Date().toISOString() })
        .eq('id', userId)
    } catch (err) {
      console.error(`[daily-nudges] failed for user ${userId}:`, err)
      failed++
    }
  }

  const summary = { ok: true, users_processed: users.length, nudges_generated: totalGenerated, failed }
  console.log('[daily-nudges] done', summary)

  return new Response(JSON.stringify(summary), {
    headers: { 'Content-Type': 'application/json' },
  })
})
