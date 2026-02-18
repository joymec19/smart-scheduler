import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { supabase } from '../../lib/supabase'
import useTaskStore from '../../stores/useTaskStore'
import { suggestReschedule } from '../../lib/rescheduling'

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

// Convert ISO → "YYYY-MM-DDTHH:mm" for datetime-local input
function toInputValue(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function RescheduleModal({ open, task, onClose, onMiss }) {
  const { updateTask } = useTaskStore()

  const [suggestion, setSuggestion]       = useState(null)
  const [loadingSuggestion, setLoading]   = useState(false)
  const [showPicker, setShowPicker]       = useState(false)
  const [adjustedDate, setAdjustedDate]   = useState('')
  const [submitting, setSubmitting]       = useState(false)

  // Reset + fetch whenever the modal opens for a new task
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

      // Log the reschedule event
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
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Bottom sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-50 px-5 pt-4 pb-10 max-h-[88vh] overflow-y-auto"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            {/* Header */}
            <h2 className="text-lg font-bold text-gray-800">Reschedule Task</h2>
            <p className="text-sm text-gray-500 mt-0.5">Missed this one? Let's find a better time.</p>

            {/* Warning banner — reschedule_count >= 3 */}
            {showWarning && (
              <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 items-start">
                <span className="text-amber-500 mt-0.5">⚠️</span>
                <div>
                  <p className="text-amber-700 text-sm font-semibold">Consider breaking this down</p>
                  <p className="text-amber-600 text-xs mt-0.5">
                    This task has been rescheduled {rescheduleCount} times. Try splitting it into smaller steps.
                  </p>
                </div>
              </div>
            )}

            {/* Task info */}
            <div className="mt-4 bg-gray-50 rounded-xl p-4">
              <p className="text-gray-800 font-semibold text-sm">{task.title}</p>
              <p className="text-gray-400 text-xs mt-1">
                Original due: {formatDateTime(task.due_at)}
              </p>
              {rescheduleCount > 0 && (
                <p className="text-red-400 text-xs mt-0.5">Rescheduled {rescheduleCount}×</p>
              )}
            </div>

            {/* AI suggestion card */}
            {loadingSuggestion ? (
              <div className="mt-4 flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                Analysing your patterns…
              </div>
            ) : suggestion ? (
              <div className="mt-4 bg-purple-50 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <span className="text-purple-500 text-base mt-0.5">✦</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-purple-700 text-xs font-semibold uppercase tracking-wide">Suggested time</p>
                    <p className="text-purple-900 text-base font-bold mt-0.5">
                      {formatDateTime(previewDatetime)}
                    </p>
                    <p className="text-purple-500 text-xs mt-1 leading-relaxed">
                      {suggestion.rationale_text}
                    </p>

                    {/* Confidence bar */}
                    <div className="mt-3 flex items-center gap-2">
                      <div className="h-1.5 bg-purple-200 rounded-full flex-1">
                        <div
                          className="h-1.5 bg-purple-500 rounded-full transition-all"
                          style={{ width: `${Math.round(suggestion.confidence_score * 100)}%` }}
                        />
                      </div>
                      <span className="text-purple-400 text-xs shrink-0">
                        {Math.round(suggestion.confidence_score * 100)}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Custom date picker — shown when Adjust is pressed */}
            {showPicker && (
              <div className="mt-3">
                <label className="text-xs font-medium text-gray-500">Choose a different time</label>
                <input
                  type="datetime-local"
                  value={adjustedDate}
                  onChange={(e) => setAdjustedDate(e.target.value)}
                  className="mt-1 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>
            )}

            {/* Action buttons */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                onClick={handleAccept}
                disabled={submitting || loadingSuggestion || !suggestion}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform"
              >
                {submitting ? 'Saving…' : 'Accept & Reschedule'}
              </button>

              <button
                onClick={() => setShowPicker((v) => !v)}
                className="w-full bg-gray-100 text-gray-700 font-medium py-3 rounded-xl active:scale-95 transition-transform"
              >
                {showPicker ? 'Use Suggested Time' : 'Adjust Time'}
              </button>

              <button
                onClick={handleCancelTask}
                disabled={submitting}
                className="w-full bg-red-50 text-red-500 font-medium py-3 rounded-xl border border-red-100 disabled:opacity-50 active:scale-95 transition-transform"
              >
                Cancel Task (Mark Missed)
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
