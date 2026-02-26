import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { trackTaskCreated, trackRecurringRuleCreated } from '../../lib/analytics-tracking'
import RecurrenceSelector from './RecurrenceSelector'

const CATEGORIES = [
  { value: 'learning', label: 'Learning', color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  { value: 'work',     label: 'Work',     color: 'bg-gradient-to-br from-violet-400 to-violet-600' },
  { value: 'health',   label: 'Health',   color: 'bg-gradient-to-br from-emerald-400 to-green-500' },
  { value: 'personal', label: 'Personal', color: 'bg-gradient-to-br from-pink-400 to-pink-500' },
  { value: 'info',     label: 'Info',     color: 'bg-gradient-to-br from-amber-400 to-orange-400' },
  { value: 'creative', label: 'Creative', color: 'bg-gradient-to-br from-cyan-400 to-cyan-500' },
]

const PRIORITIES = ['high', 'medium', 'low']

const TIME_ESTIMATES = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h',  value: 60 },
  { label: '2h+', value: 120 },
]

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(1000).optional(),
  category: z.enum(['learning', 'work', 'health', 'personal', 'info', 'creative']),
  priority: z.enum(['high', 'medium', 'low']),
  due_at: z.string().optional(),
  estimated_minutes: z.number().positive().optional(),
})

const PRIORITY_ACTIVE = {
  high:   'bg-gradient-to-r from-rose-400 to-red-500 text-white shadow-md shadow-rose-500/30',
  medium: 'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-500/30',
  low:    'bg-gradient-to-r from-slate-400 to-slate-500 text-white shadow-md',
}

export default function TaskCreateModal({ open, onClose, onSubmit, defaultDueAt = '' }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    due_at: defaultDueAt,
    estimated_minutes: null,
  })

  const [recurrence, setRecurrence] = useState(null)
  // Track a key to force-remount RecurrenceSelector on each open, resetting its internal state
  const [selectorKey, setSelectorKey] = useState(0)

  // Sync defaultDueAt and reset recurrence/selector each time modal opens
  useEffect(() => {
    if (open) {
      setForm((prev) => ({ ...prev, due_at: defaultDueAt }))
      setRecurrence(null)
      setSelectorKey((k) => k + 1)
    }
  }, [open, defaultDueAt])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const payload = {
      ...form,
      due_at: form.due_at || undefined,
      estimated_minutes: form.estimated_minutes || undefined,
    }

    const result = taskSchema.safeParse(payload)
    if (!result.success) {
      const fieldErrors = {}
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({ ...result.data, recurrence })
      if (recurrence) {
        trackRecurringRuleCreated({ pattern: recurrence.pattern, category: result.data.category })
      } else {
        trackTaskCreated({ category: result.data.category, priority: result.data.priority })
      }
      setForm({ title: '', description: '', category: 'work', priority: 'medium', due_at: defaultDueAt, estimated_minutes: null })
      setRecurrence(null)
      setErrors({})
      onClose()
    } catch {
      // toast handled by store
    } finally {
      setSubmitting(false)
    }
  }

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
            className="w-full max-w-lg rounded-t-3xl p-5 pb-8 max-h-[90vh] overflow-y-auto
              bg-white dark:bg-gray-900/95 border-t border-gray-200 dark:border-white/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-4" />

            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">New Task</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Task title *"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className={`w-full px-3 py-3 rounded-xl border text-sm min-h-[44px]
                    bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                    placeholder-gray-400 dark:placeholder-slate-500
                    ${errors.title ? 'border-rose-400 dark:border-rose-500/50' : 'border-gray-200 dark:border-white/10'}
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50`}
                />
                {errors.title && <p className="text-rose-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm
                  bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                  placeholder-gray-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />

              {/* Category picker */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => update('category', cat.value)}
                      className={`
                        min-h-[44px] rounded-xl text-xs font-semibold transition-all
                        ${form.category === cat.value
                          ? `${cat.color} text-white shadow-md scale-[1.02]`
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/10'
                        }
                      `}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority segmented control */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Priority</label>
                <div className="flex bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1 border border-transparent dark:border-white/10">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update('priority', p)}
                      className={`
                        flex-1 py-2 text-sm font-semibold rounded-lg capitalize min-h-[44px] transition-all
                        ${form.priority === p ? PRIORITY_ACTIVE[p] : 'text-gray-500 dark:text-slate-500'}
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Due date</label>
                <input
                  type="datetime-local"
                  value={form.due_at}
                  onChange={(e) => update('due_at', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-sm min-h-[44px]
                    bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                />
              </div>

              {/* Time estimate */}
              <div>
                <label className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 block uppercase tracking-wide">Estimated time</label>
                <div className="flex gap-2">
                  {TIME_ESTIMATES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('estimated_minutes', form.estimated_minutes === opt.value ? null : opt.value)}
                      className={`
                        flex-1 py-2 text-sm font-semibold rounded-xl min-h-[44px] transition-all
                        ${form.estimated_minutes === opt.value
                          ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/10'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Recurrence — key forces remount on each modal open so internal state is fresh */}
              <RecurrenceSelector key={selectorKey} value={recurrence} onChange={setRecurrence} />

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl px-4 py-3 font-semibold text-sm min-h-[44px] shadow-lg shadow-violet-500/30 disabled:opacity-50 transition-opacity mt-2 active:scale-[0.98]"
              >
                {submitting ? 'Creating...' : recurrence ? 'Create Recurring Task' : 'Create Task'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
