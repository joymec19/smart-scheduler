import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useNudgeStore from '../../stores/useNudgeStore'

const TYPE_META = {
  pattern: {
    icon: '📊',
    gradient: 'from-blue-400 to-purple-500',
    actLabel: 'Schedule Task',
    actRoute: '/tasks',
  },
  momentum: {
    icon: '🔥',
    gradient: 'from-orange-400 to-red-500',
    actLabel: 'Start a Task',
    actRoute: '/tasks',
  },
  content_capture: {
    icon: '📝',
    gradient: 'from-green-400 to-teal-500',
    actLabel: 'Open Notes',
    actRoute: '/notes',
  },
}

export default function NudgeCard({ nudge }) {
  const navigate = useNavigate()
  const { actOnNudge, dismissNudge, snoozeNudge } = useNudgeStore()
  const meta = TYPE_META[nudge.type] || TYPE_META.momentum

  async function handleAct() {
    await actOnNudge(nudge.id)
    navigate(meta.actRoute)
  }

  return (
    <motion.div
      layout
      whileTap={{ scale: 0.97 }}
      className={`bg-gradient-to-br ${meta.gradient} rounded-2xl p-4 flex-shrink-0 w-64 text-white shadow-md flex flex-col gap-2`}
    >
      {/* Icon + title */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{meta.icon}</span>
        <p className="font-semibold text-sm leading-tight">{nudge.title}</p>
      </div>

      {/* Message */}
      <p className="text-white/85 text-xs leading-relaxed">{nudge.message}</p>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button
          onClick={handleAct}
          className="flex-1 bg-white/25 hover:bg-white/35 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors"
        >
          {meta.actLabel}
        </button>
        <button
          onClick={() => snoozeNudge(nudge.id)}
          className="bg-white/15 hover:bg-white/25 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          aria-label="Snooze 1 hour"
        >
          ⏰
        </button>
        <button
          onClick={() => dismissNudge(nudge.id)}
          className="bg-white/15 hover:bg-white/25 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
    </motion.div>
  )
}
