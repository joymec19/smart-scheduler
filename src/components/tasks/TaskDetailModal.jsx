import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_BADGE = {
  learning: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  work:     'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  health:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  personal: 'bg-pink-500/15 text-pink-400 border border-pink-500/25',
  info:     'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  creative: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
}

const PRIORITY_STYLES = {
  high:   'bg-rose-500/15 text-rose-400 border border-rose-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  low:    'bg-slate-500/15 text-slate-400 border border-slate-500/25',
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso))
}

function formatMinutes(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function DetailCell({ label, children }) {
  return (
    <div className="bg-gray-50 dark:bg-white/5 rounded-xl p-3 border border-gray-100 dark:border-white/10">
      <p className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wide font-semibold mb-1">{label}</p>
      {children}
    </div>
  )
}

export default function TaskDetailModal({ open, task, onClose }) {
  if (!task) return null

  const isCompleted = task.status === 'completed'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[85vh] overflow-y-auto
              bg-white dark:bg-gray-900/95 border-t border-gray-200 dark:border-white/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-4" />

            {/* Status banner */}
            <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 text-sm font-semibold ${
              isCompleted
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-rose-500/15 text-rose-400'
            }`}>
              <span>{isCompleted ? '✓ Completed' : '✗ Missed'}</span>
              {isCompleted && task.completed_at && (
                <span className="font-normal text-xs ml-auto opacity-80">{formatDate(task.completed_at)}</span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1 leading-snug">{task.title}</h2>

            {/* Description */}
            {task.description && (
              <p className="text-sm text-gray-500 dark:text-slate-400 mb-4 leading-relaxed">{task.description}</p>
            )}

            <div className="h-px bg-gray-100 dark:bg-white/10 mb-4" />

            {/* Details grid */}
            <div className="grid grid-cols-2 gap-2.5">
              <DetailCell label="Category">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize inline-block ${CATEGORY_BADGE[task.category] || 'bg-gray-100 dark:bg-white/10 text-gray-500'}`}>
                  {task.category}
                </span>
              </DetailCell>

              <DetailCell label="Priority">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize inline-block ${PRIORITY_STYLES[task.priority] || ''}`}>
                  {task.priority}
                </span>
              </DetailCell>

              <DetailCell label="Due date">
                <p className="text-sm text-gray-700 dark:text-slate-200">{formatDate(task.due_at)}</p>
              </DetailCell>

              <DetailCell label="Estimated">
                <p className="text-sm text-gray-700 dark:text-slate-200">{formatMinutes(task.estimated_minutes)}</p>
              </DetailCell>

              {isCompleted && task.actual_minutes ? (
                <DetailCell label="Actual time">
                  <p className="text-sm text-gray-700 dark:text-slate-200">{formatMinutes(task.actual_minutes)}</p>
                </DetailCell>
              ) : null}

              <DetailCell label="Rescheduled">
                <p className="text-sm text-gray-700 dark:text-slate-200">
                  {task.reschedule_count > 0 ? `${task.reschedule_count}×` : 'Never'}
                </p>
              </DetailCell>

              <DetailCell label="Recurring">
                <p className="text-sm text-gray-700 dark:text-slate-200">
                  {task.recurring_rule_id ? '🔁 Yes' : 'No'}
                </p>
              </DetailCell>

              <DetailCell label="Created">
                <p className="text-sm text-gray-700 dark:text-slate-200">{formatDate(task.created_at)}</p>
              </DetailCell>
            </div>

            <button
              onClick={onClose}
              className="mt-5 w-full py-3 rounded-xl text-sm font-semibold
                bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-slate-300
                hover:bg-gray-200 dark:hover:bg-white/15 transition-colors min-h-[44px]"
            >
              Close
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
