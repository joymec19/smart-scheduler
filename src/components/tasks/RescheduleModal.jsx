import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import useTaskStore from '../../stores/useTaskStore'
import { suggestReschedule } from '../../lib/rescheduling'
import { trackRescheduleAccepted, trackRescheduleRejected, trackTaskMissed } from '../../lib/analytics-tracking'
import DecomposeWizard from '../decomposition/DecomposeWizard'
import useDecompositionStore from '../../stores/useDecompositionStore'

function formatDateTime(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

function toInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RescheduleModal({ open, task, onClose, onMiss }) {
  const { updateTask } = useTaskStore()
  const { startWizard } = useDecompositionStore()

  const [suggestion, setSuggestion]       = useState(null)
  const [loadingSuggestion, setLoading]   = useState(false)
  const [showPicker, setShowPicker]       = useState(false)
  const [adjustedDate, setAdjustedDate]   = useState('')
  const [submitting, setSubmitting]       = useState(false)
  const [showWizard, setShowWizard]       = useState(false)

  useEffect(() => {
    if (!open || !task) return
    setSuggestion(null)
    setShowPicker(false)
    setAdjustedDate('')

    async function load() {
      setLoading(true)
      try {
        const result = await suggestReschedule(task)
        setSuggestion(result)
        setAdjustedDate(toInputValue(result.suggested_datetime))
      } catch (e) {
        console.error('[RescheduleModal] suggestion error:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [open, task?.id])

  async function handleAccept() {
    const newDueAt = showPicker && adjustedDate
      ? new Date(adjustedDate).toISOString()
      : suggestion?.suggested_datetime

    if (!newDueAt) return

    setSubmitting(true)
    try {
      const newCount = (task.reschedule_count || 0) + 1

      await updateTask(task.id, {
        due_at: newDueAt,
        status: 'pending',
        reschedule_count: newCount,
      })

      await supabase.from('task_activity_logs').insert({
        user_id: task.user_id,
        task_id: task.id,
        event_type: 'rescheduled',
        payload: {
          from: task.due_at,
          to: newDueAt,
          reschedule_count: newCount,
          rationale: suggestion?.rationale_text ?? null,
        },
      })

      trackRescheduleAccepted()
      toast.success('Task rescheduled!')
      onClose()
    } catch (e) {
      toast.error('Failed to reschedule')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  function handleCancelTask() {
    trackTaskMissed()
    trackRescheduleRejected()
    onMiss(task.id)
    onClose()
  }

  if (!task) return null

  const rescheduleCount = task.reschedule_count || 0
  const showWarning = rescheduleCount >= 3

  const previewDatetime = showPicker && adjustedDate
    ? new Date(adjustedDate).toISOString()
    : suggestion?.suggested_datetime

  return (
    <>
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 rounded-t-3xl z-50 px-5 pt-4 pb-10 max-h-[88vh] overflow-y-auto
              bg-white dark:bg-gray-900/98 border-t border-gray-200 dark:border-white/10"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-200 dark:bg-white/15 rounded-full mx-auto mb-5" />

            {/* Header */}
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Reschedule Task</h2>
            <p className="text-sm text-slate-400 mt-0.5">Missed this one? Let's find a better time.</p>

            {/* Warning banner */}
            {showWarning && (
              <div className="mt-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl p-3 flex gap-2 items-start">
                <span className="text-amber-400 mt-0.5">⚠️</span>
                <div>
                  <p className="text-amber-500 dark:text-amber-400 text-sm font-semibold">Consider breaking this down</p>
                  <p className="text-amber-600 dark:text-amber-500/80 text-xs mt-0.5">
                    This task has been rescheduled {rescheduleCount} times. Try splitting it into smaller steps.
                  </p>
                </div>
              </div>
            )}

            {/* Task info */}
            <div className="mt-4 bg-gray-50 dark:bg-white/5 rounded-2xl p-4 border border-gray-100 dark:border-white/10">
              <p className="text-gray-800 dark:text-slate-100 font-semibold text-sm">{task.title}</p>
              <p className="text-slate-400 text-xs mt-1">
                Original due: {formatDateTime(task.due_at)}
              </p>
              {rescheduleCount > 0 && (
                <p className="text-rose-400 text-xs mt-0.5">Rescheduled {rescheduleCount}×</p>
              )}
            </div>

            {/* AI suggestion card */}
            {loadingSuggestion ? (
              <div className="mt-4 flex items-center gap-2 text-slate-400 text-sm">
                <div className="w-4 h-4 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
                Analysing your patterns…
              </div>
            ) : suggestion ? (
              <div className="mt-4 bg-violet-500/10 border border-violet-500/20 rounded-2xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 text-base mt-0.5">✦</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-violet-400 text-xs font-semibold uppercase tracking-wide">Suggested time</p>
                    <p className="text-gray-900 dark:text-white text-base font-bold mt-0.5">
                      {formatDateTime(previewDatetime)}
                    </p>
                    <p className="text-violet-400 dark:text-violet-400/80 text-xs mt-1 leading-relaxed">
                      {suggestion.rationale_text}
                    </p>

                    {/* Confidence bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 bg-violet-500/20 rounded-full flex-1">
                        <div
                          className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                          style={{ width: `${Math.round(suggestion.confidence_score * 100)}%` }}
                        />
                      </div>
                      <span className="text-violet-400 text-xs shrink-0">
                        {Math.round(suggestion.confidence_score * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Custom date picker */}
            {showPicker && (
              <div className="mt-3">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Choose a different time</label>
                <input
                  type="datetime-local"
                  value={adjustedDate}
                  onChange={(e) => setAdjustedDate(e.target.value)}
                  className="mt-1.5 w-full border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 text-sm
                    bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>
            )}

            {/* Orange rescheduled-times banner */}
            {rescheduleCount >= 3 && (
              <div className="mt-5 bg-orange-500/10 border border-orange-500/20 rounded-xl px-3 py-2 text-orange-400 text-sm font-medium">
                This task has been rescheduled {rescheduleCount} times
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-3 flex flex-col gap-2.5">
              <button
                onClick={handleAccept}
                disabled={submitting || loadingSuggestion || !suggestion}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-violet-500/25 disabled:opacity-50 active:scale-95 transition-all"
              >
                {submitting ? 'Saving…' : 'Accept & Reschedule'}
              </button>

              <button
                onClick={() => setShowPicker((v) => !v)}
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-slate-300 font-medium py-3 rounded-xl active:scale-95 transition-all"
              >
                {showPicker ? 'Use Suggested Time' : 'Adjust Time'}
              </button>

              <button
                onClick={handleCancelTask}
                disabled={submitting}
                className="w-full bg-rose-500/10 text-rose-400 font-medium py-3 rounded-xl border border-rose-500/20 disabled:opacity-50 active:scale-95 transition-all"
              >
                Cancel Task (Mark Missed)
              </button>

              {/* Decompose button — only when rescheduled 3+ times */}
              {rescheduleCount >= 3 && (
                <button
                  onClick={() => { startWizard(task); setShowWizard(true) }}
                  className="relative w-full py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 overflow-hidden active:scale-95 transition-transform"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-violet-500 to-cyan-500 rounded-xl" />
                  <span className="absolute inset-[2px] bg-white dark:bg-gray-900 rounded-[10px]" />
                  <span className="relative flex items-center gap-2">
                    <span>✂️</span>
                    <span className="bg-gradient-to-r from-violet-600 to-cyan-600 bg-clip-text text-transparent font-semibold">
                      Want me to break it down?
                    </span>
                  </span>
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>

    <DecomposeWizard
      open={showWizard}
      task={task}
      onClose={() => { setShowWizard(false); onClose() }}
    />
    </>
  )
}
