import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import useAnalyticsStore from '../stores/useAnalyticsStore'
import { trackAnalyticsViewed } from '../lib/analytics-tracking'

// ─── Design tokens ───────────────────────────────────────────────────────────
const CAT_COLORS = {
  learning: '#3b82f6',
  work:     '#8b5cf6',
  health:   '#22c55e',
  personal: '#ec4899',
  info:     '#f59e0b',
  creative: '#06b6d4',
}

const RANGES = [
  { value: 'this_week',  label: 'This Week' },
  { value: 'last_week',  label: 'Last Week' },
  { value: 'this_month', label: 'This Month' },
]

// ─── SVG Donut ────────────────────────────────────────────────────────────────
function DonutChart({ data }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0)
  const total = entries.reduce((s, [, v]) => s + v, 0)

  if (total === 0) {
    return (
      <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center">
        <span className="text-slate-400 text-xs">—</span>
      </div>
    )
  }

  const r = 36
  const cx = 44
  const cy = 44
  const C = 2 * Math.PI * r
  const sw = 10

  let cumulative = 0
  const segments = entries.map(([cat, count]) => {
    const f = count / total
    const dash = f * C
    const offset = -(cumulative * C)
    cumulative += f
    return { cat, count, dash, offset, color: CAT_COLORS[cat] || '#94a3b8' }
  })

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={cx * 2} height={cy * 2} viewBox={`0 0 ${cx * 2} ${cy * 2}`}>
        {/* Track ring */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={sw} />
        {/* Coloured segments, rotated so first segment starts at 12 o'clock */}
        <g style={{ transform: `rotate(-90deg)`, transformOrigin: `${cx}px ${cy}px` }}>
          {segments.map(({ cat, dash, offset, color }) => (
            <circle
              key={cat}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={color}
              strokeWidth={sw}
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={offset}
            />
          ))}
        </g>
        {/* Centre count */}
        <text
          x={cx}
          y={cy}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="13"
          fontWeight="700"
          fill="currentColor"
          className="fill-gray-700 dark:fill-slate-200"
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-[140px]">
        {segments.map(({ cat, count, color }) => (
          <span key={cat} className="flex items-center gap-0.5 text-[9px] text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
            {cat} {count}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── Trend arrow ─────────────────────────────────────────────────────────────
function TrendArrow({ current, previous }) {
  if (previous === null || previous === undefined) return null
  const diff = current - previous
  if (diff > 0) return <span className="text-emerald-400 text-xs font-semibold">↑{diff}%</span>
  if (diff < 0) return <span className="text-rose-400 text-xs font-semibold">↓{Math.abs(diff)}%</span>
  return <span className="text-slate-400 text-xs">→</span>
}

// ─── Accuracy colour helper ───────────────────────────────────────────────────
function accuracyMeta(pct) {
  if (pct === null) return { color: 'text-slate-400', label: 'No data yet', bar: 'from-slate-400 to-slate-500' }
  if (pct <= 110) return { color: 'text-emerald-400', label: 'Right on target', bar: 'from-emerald-400 to-green-500' }
  if (pct <= 140) return { color: 'text-amber-400', label: 'Slightly over estimate', bar: 'from-amber-400 to-orange-400' }
  return { color: 'text-rose-400', label: 'Underestimating time', bar: 'from-rose-400 to-red-500' }
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function Analytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { stats, prevRate, loading, fetchStats } = useAnalyticsStore()
  const [range, setRange] = useState('this_week')

  useEffect(() => {
    trackAnalyticsViewed()
  }, [])

  useEffect(() => {
    if (user) fetchStats(user.id, range)
  }, [user, range])

  const rate     = stats?.completionRate
  const accuracy = stats?.timeAccuracy ?? null
  const missed   = stats?.missedByCategory ?? {}
  const notes    = stats?.notesTotal ?? 0
  const insights = stats?.insights ?? []
  const accMeta  = accuracyMeta(accuracy)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300 pb-8">
      {/* ── Header ── */}
      <div className="pt-14 pb-5 px-5">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Analytics
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">Your productivity at a glance</p>
      </div>

      {/* ── Date range segmented control ── */}
      <div className="px-4">
        <div className="flex bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-1 border border-gray-200 dark:border-white/10">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`
                flex-1 py-2 text-xs font-semibold rounded-xl transition-all
                ${range === r.value
                  ? 'bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/10'
                  : 'text-gray-500 dark:text-slate-500'
                }
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── 2×2 metric cards ── */}
          <div className="px-4 mt-5 grid grid-cols-2 gap-3">

            {/* Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="glass-card rounded-2xl p-4"
            >
              <p className="text-slate-400 text-[11px] font-semibold mb-2 uppercase tracking-wide">Completion Rate</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
                  {rate ? `${rate.rate}%` : '—'}
                </span>
                {range === 'this_week' && rate && (
                  <span className="mb-0.5">
                    <TrendArrow current={rate.rate} previous={prevRate} />
                  </span>
                )}
              </div>
              {rate?.total > 0 && (
                <p className="text-slate-400 text-[10px] mt-0.5">
                  {rate.completed} / {rate.total} tasks
                </p>
              )}
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all duration-700"
                  style={{ width: `${rate?.rate ?? 0}%` }}
                />
              </div>
            </motion.div>

            {/* Time Accuracy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="glass-card rounded-2xl p-4"
            >
              <p className="text-slate-400 text-[11px] font-semibold mb-2 uppercase tracking-wide">Time Accuracy</p>
              <span className={`text-3xl font-bold ${accMeta.color}`}>
                {accuracy !== null ? `${accuracy}%` : '—'}
              </span>
              <p className="text-slate-400 text-[10px] mt-0.5">{accMeta.label}</p>
              <div className="mt-3 h-1.5 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r ${accMeta.bar}`}
                  style={{ width: `${Math.min(accuracy ?? 0, 100)}%` }}
                />
              </div>
            </motion.div>

            {/* Missed by Category — donut */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="glass-card rounded-2xl p-4 flex flex-col items-center"
            >
              <p className="text-slate-400 text-[11px] font-semibold mb-3 self-start uppercase tracking-wide">Missed Tasks</p>
              <DonutChart data={missed} />
            </motion.div>

            {/* Notes Created */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="glass-card rounded-2xl p-4"
            >
              <p className="text-slate-400 text-[11px] font-semibold mb-2 uppercase tracking-wide">Notes Captured</p>
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                {notes}
              </span>
              <p className="text-slate-400 text-[10px] mt-0.5">mental notes</p>

              {Object.keys(stats?.notesByCategory ?? {}).length > 0 && (
                <div className="mt-3 space-y-1">
                  {Object.entries(stats.notesByCategory)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([cat, count]) => (
                      <div key={cat} className="flex items-center gap-1.5">
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ background: CAT_COLORS[cat] || '#94a3b8' }}
                        />
                        <span className="text-[10px] text-slate-400 capitalize flex-1">{cat}</span>
                        <span className="text-[10px] font-semibold text-slate-300 dark:text-slate-300">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Coaching Insights ── */}
          <div className="px-4 mt-6">
            <h2 className="text-gray-800 dark:text-white font-semibold text-base mb-3">Coaching Insights</h2>

            {insights.length === 0 ? (
              <div className="relative glass-card rounded-2xl p-6 text-center overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-3xl" />
                </div>
                <span className="text-4xl relative">💡</span>
                <p className="text-slate-400 text-sm mt-3 relative">
                  {range !== 'this_week'
                    ? 'Insights are only generated for This Week.'
                    : 'Complete a few tasks to unlock personalised insights.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {insights.map((insight, i) => (
                  <motion.button
                    key={insight.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => navigate(insight.route)}
                    className="w-full glass-card rounded-2xl p-4 flex items-start gap-3 text-left active:scale-[0.98] transition-all hover:shadow-violet-500/10"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-slate-200 text-sm leading-snug">{insight.text}</p>
                      <p className="text-violet-500 dark:text-violet-400 text-xs font-semibold mt-1.5">
                        {insight.route === '/notes' ? 'View Notes →' : 'View Tasks →'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-slate-400 dark:text-slate-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
