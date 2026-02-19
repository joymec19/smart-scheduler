import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { z } from 'zod'
import { trackTaskCreated } from '../../lib/analytics-tracking'

const CATEGORIES = [
  { value: 'learning', label: 'Learning', color: 'bg-blue-500' },
  { value: 'work', label: 'Work', color: 'bg-purple-500' },
  { value: 'health', label: 'Health', color: 'bg-green-500' },
  { value: 'personal', label: 'Personal', color: 'bg-pink-500' },
  { value: 'info', label: 'Info', color: 'bg-amber-500' },
  { value: 'creative', label: 'Creative', color: 'bg-cyan-500' },
]

const PRIORITIES = ['high', 'medium', 'low']

const TIME_ESTIMATES = [
  { label: '15m', value: 15 },
  { label: '30m', value: 30 },
  { label: '1h', value: 60 },
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

const PRIORITY_COLORS = {
  high: 'bg-red-500 text-white',
  medium: 'bg-amber-500 text-white',
  low: 'bg-gray-300 text-gray-700',
}

export default function TaskCreateModal({ open, onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'work',
    priority: 'medium',
    due_at: '',
    estimated_minutes: null,
  })
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
      await onSubmit(result.data)
      trackTaskCreated({ category: result.data.category, priority: result.data.priority })
      setForm({ title: '', description: '', category: 'work', priority: 'medium', due_at: '', estimated_minutes: null })
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white w-full max-w-lg rounded-t-2xl p-5 pb-8 max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

            <h2 className="text-lg font-bold text-gray-900 mb-4">New Task</h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Task title *"
                  value={form.title}
                  onChange={(e) => update('title', e.target.value)}
                  className={`w-full px-3 py-3 rounded-xl border text-sm min-h-[44px] ${
                    errors.title ? 'border-red-400' : 'border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-purple-400`}
                />
                {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                rows={2}
                className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
              />

              {/* Category picker */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Category</label>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => update('category', cat.value)}
                      className={`
                        min-h-[44px] rounded-xl text-xs font-medium transition-all
                        ${form.category === cat.value
                          ? `${cat.color} text-white shadow-md scale-[1.02]`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Priority</label>
                <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
                  {PRIORITIES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => update('priority', p)}
                      className={`
                        flex-1 py-2 text-sm font-medium rounded-lg capitalize min-h-[44px] transition-all
                        ${form.priority === p ? PRIORITY_COLORS[p] : 'text-gray-500'}
                      `}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Due date */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Due date</label>
                <input
                  type="datetime-local"
                  value={form.due_at}
                  onChange={(e) => update('due_at', e.target.value)}
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-sm min-h-[44px] focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
              </div>

              {/* Time estimate */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Estimated time</label>
                <div className="flex gap-2">
                  {TIME_ESTIMATES.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => update('estimated_minutes', form.estimated_minutes === opt.value ? null : opt.value)}
                      className={`
                        flex-1 py-2 text-sm font-medium rounded-xl min-h-[44px] transition-all
                        ${form.estimated_minutes === opt.value
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl px-4 py-3 font-semibold text-sm min-h-[44px] disabled:opacity-50 transition-opacity mt-2"
              >
                {submitting ? 'Creating...' : 'Create Task'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
