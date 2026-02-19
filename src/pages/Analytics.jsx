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

// ─── SVG Donut (pure CSS/SVG, no library) ────────────────────────────────────
function DonutChart({ data }) {
  const entries = Object.entries(data).filter(([, v]) => v > 0)
  const total = entries.reduce((s, [, v]) => s + v, 0)

  if (total === 0) {
    return (
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
        <span className="text-gray-400 text-xs">—</span>
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
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth={sw} />
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
          fill="#374151"
        >
          {total}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 max-w-[140px]">
        {segments.map(({ cat, count, color }) => (
          <span key={cat} className="flex items-center gap-0.5 text-[9px] text-gray-500">
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
  if (diff > 0) return <span className="text-green-500 text-xs font-semibold">↑{diff}%</span>
  if (diff < 0) return <span className="text-red-400 text-xs font-semibold">↓{Math.abs(diff)}%</span>
  return <span className="text-gray-400 text-xs">→</span>
}

// ─── Accuracy colour helper ───────────────────────────────────────────────────
function accuracyMeta(pct) {
  if (pct === null) return { color: 'text-gray-400', label: 'No data yet', bar: 'bg-gray-300' }
  if (pct <= 110) return { color: 'text-green-600', label: 'Right on target', bar: 'bg-green-500' }
  if (pct <= 140) return { color: 'text-amber-500', label: 'Slightly over estimate', bar: 'bg-amber-400' }
  return { color: 'text-red-500', label: 'Underestimating time', bar: 'bg-red-400' }
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ── Header ── */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 pt-12 pb-5 px-5">
        <h1 className="text-white text-2xl font-bold">Analytics</h1>
        <p className="text-purple-200 text-sm mt-1">Your productivity at a glance</p>
      </div>

      {/* ── Date range segmented control ── */}
      <div className="px-4 mt-4">
        <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`
                flex-1 py-2 text-xs font-medium rounded-lg transition-all
                ${range === r.value ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-500'}
              `}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ── 2×2 metric cards ── */}
          <div className="px-4 mt-5 grid grid-cols-2 gap-3">

            {/* Completion Rate */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <p className="text-gray-400 text-[11px] font-medium mb-2">Completion Rate</p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-purple-600">
                  {rate ? `${rate.rate}%` : '—'}
                </span>
                {range === 'this_week' && rate && (
                  <span className="mb-0.5">
                    <TrendArrow current={rate.rate} previous={prevRate} />
                  </span>
                )}
              </div>
              {rate?.total > 0 && (
                <p className="text-gray-400 text-[10px] mt-0.5">
                  {rate.completed} / {rate.total} tasks
                </p>
              )}
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all duration-700"
                  style={{ width: `${rate?.rate ?? 0}%` }}
                />
              </div>
            </motion.div>

            {/* Time Accuracy */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.06 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <p className="text-gray-400 text-[11px] font-medium mb-2">Time Accuracy</p>
              <span className={`text-3xl font-bold ${accMeta.color}`}>
                {accuracy !== null ? `${accuracy}%` : '—'}
              </span>
              <p className="text-gray-400 text-[10px] mt-0.5">{accMeta.label}</p>
              <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${accMeta.bar}`}
                  style={{ width: `${Math.min(accuracy ?? 0, 100)}%` }}
                />
              </div>
            </motion.div>

            {/* Missed by Category — donut */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 }}
              className="bg-white rounded-2xl p-4 shadow-sm flex flex-col items-center"
            >
              <p className="text-gray-400 text-[11px] font-medium mb-3 self-start">Missed Tasks</p>
              <DonutChart data={missed} />
            </motion.div>

            {/* Notes Created */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
              className="bg-white rounded-2xl p-4 shadow-sm"
            >
              <p className="text-gray-400 text-[11px] font-medium mb-2">Notes Captured</p>
              <span className="text-3xl font-bold text-cyan-600">{notes}</span>
              <p className="text-gray-400 text-[10px] mt-0.5">mental notes</p>

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
                        <span className="text-[10px] text-gray-500 capitalize flex-1">{cat}</span>
                        <span className="text-[10px] font-semibold text-gray-600">{count}</span>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Coaching Insights ── */}
          <div className="px-4 mt-6">
            <h2 className="text-gray-800 font-semibold text-base mb-3">Coaching Insights</h2>

            {insights.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <span className="text-4xl">💡</span>
                <p className="text-gray-400 text-sm mt-3">
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
                    className="w-full bg-white rounded-2xl p-4 shadow-sm flex items-start gap-3 text-left active:scale-[0.98] transition-transform"
                  >
                    <span className="text-xl shrink-0 mt-0.5">{insight.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-700 text-sm leading-snug">{insight.text}</p>
                      <p className="text-purple-500 text-xs font-medium mt-1.5">
                        {insight.route === '/notes' ? 'View Notes →' : 'View Tasks →'}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
