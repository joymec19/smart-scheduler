import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useNudgeStore from '../../stores/useNudgeStore'
import { trackNudgeActed, trackNudgeDismissed } from '../../lib/analytics-tracking'

const TYPE_META = {
  pattern: {
    icon: '📊',
    gradient: 'from-violet-500 to-indigo-600',
    iconBg: 'from-violet-400/20 to-indigo-500/20',
    actLabel: 'Schedule Task',
    actRoute: '/tasks',
  },
  momentum: {
    icon: '🔥',
    gradient: 'from-rose-400 to-orange-500',
    iconBg: 'from-rose-400/20 to-orange-500/20',
    actLabel: 'Start a Task',
    actRoute: '/tasks',
  },
  content_capture: {
    icon: '📝',
    gradient: 'from-cyan-400 to-blue-500',
    iconBg: 'from-cyan-400/20 to-blue-500/20',
    actLabel: 'Open Notes',
    actRoute: '/notes',
  },
}

export default function NudgeCard({ nudge }) {
  const navigate = useNavigate()
  const { actOnNudge, dismissNudge, snoozeNudge } = useNudgeStore()
  const meta = TYPE_META[nudge.type] || TYPE_META.momentum

  async function handleAct() {
    trackNudgeActed({ nudge_type: nudge.type })
    await actOnNudge(nudge.id)
    navigate(meta.actRoute)
  }

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.97 }}
      className="relative rounded-2xl p-4 flex-shrink-0 w-64 flex flex-col gap-3 overflow-hidden
        bg-white dark:bg-[#13131a] border border-gray-100 dark:border-white/10
        shadow-lg shadow-black/5 dark:shadow-black/30"
    >
      {/* Subtle gradient background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${meta.iconBg} opacity-60 pointer-events-none`} />

      {/* Icon + title */}
      <div className="flex items-center gap-3 relative">
        {/* Gradient icon background */}
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
          <span className="text-lg">{meta.icon}</span>
        </div>
        <p className="font-semibold text-sm leading-tight text-gray-900 dark:text-slate-100">
          {nudge.title}
        </p>
      </div>

      {/* Message */}
      <p className="text-gray-500 dark:text-slate-400 text-xs leading-relaxed relative">
        {nudge.message}
      </p>

      {/* Actions */}
      <div className="flex gap-2 mt-auto relative">
        <button
          onClick={handleAct}
          className={`flex-1 bg-gradient-to-r ${meta.gradient} text-white rounded-xl px-2.5 py-1.5 text-xs font-semibold shadow-md transition-opacity hover:opacity-90`}
        >
          {meta.actLabel}
        </button>
        <button
          onClick={() => snoozeNudge(nudge.id)}
          className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors text-gray-500 dark:text-slate-400"
          aria-label="Snooze 1 hour"
        >
          ⏰
        </button>
        <button
          onClick={() => { trackNudgeDismissed({ nudge_type: nudge.type }); dismissNudge(nudge.id) }}
          className="bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 rounded-xl px-2.5 py-1.5 text-xs font-medium transition-colors text-gray-500 dark:text-slate-400"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}
