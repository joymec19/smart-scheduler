import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTemplate } from '../../lib/autoinsight'
import useNoteStore from '../../stores/useNoteStore'
import { useAuth } from '../../hooks/useAuth'
import { trackNoteCreated } from '../../lib/analytics-tracking'

const INSIGHT_LABEL = {
  podcast: '🎙 Podcast',
  article: '📄 Article',
  default: '✨ Insight',
}

const CATEGORY_GRADIENT = {
  learning: 'from-blue-500 to-blue-600',
  creative: 'from-cyan-500 to-cyan-600',
}

/**
 * AutoInsightModal — shown after completing a learning/creative task with keywords.
 *
 * Props:
 *   open         boolean
 *   task         { id, title, category }
 *   insightType  'podcast' | 'article' | 'default'
 *   onClose      () => void
 */
export default function AutoInsightModal({ open, task, insightType = 'default', onClose }) {
  const { user } = useAuth()
  const { addNote } = useNoteStore()

  const sections = task ? getTemplate(task.category, insightType) : []
  const [values, setValues] = useState(() => Object.fromEntries(sections.map((s) => [s.key, ''])))
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Reset when modal opens for a new task
  function handleOpen() {
    setValues(Object.fromEntries(sections.map((s) => [s.key, ''])))
    setSaved(false)
  }

  async function handleSave() {
    if (saving) return
    const filled = sections.filter((s) => values[s.key]?.trim())
    if (filled.length === 0) { onClose(); return }

    setSaving(true)
    try {
      await Promise.all(
        filled.map((s) =>
          addNote({
            user_id:        user.id,
            content:        `[${s.title}]\n${values[s.key].trim()}`,
            category:       task.category,
            tags:           ['autoinsight', insightType],
            auto_generated: true,
            parent_task_id: task.id,
            insight_type:   insightType,
          })
        )
      )
      filled.forEach(() =>
        trackNoteCreated({ category: task.category, has_tags: true })
      )
      setSaved(true)
      setTimeout(onClose, 1200)
    } catch {
      // toast handled in store
    } finally {
      setSaving(false)
    }
  }

  const gradient = CATEGORY_GRADIENT[task?.category] || 'from-violet-500 to-indigo-600'

  return (
    <AnimatePresence onExitComplete={handleOpen}>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="w-full max-w-lg rounded-t-3xl pb-8 max-h-[92vh] overflow-y-auto
              bg-white dark:bg-[#13131a] border-t border-gray-200 dark:border-white/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 dark:bg-white/15 rounded-full mx-auto mt-3 mb-4" />

            <div className="px-5">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${gradient}`}>
                      {INSIGHT_LABEL[insightType] ?? INSIGHT_LABEL.default}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">AutoInsight</span>
                  </div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2">
                    {task?.title}
                  </h2>
                </div>
                <button
                  onClick={onClose}
                  className="ml-2 shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <p className="text-xs text-slate-400 mb-5 mt-1">
                Capture your insights while they're fresh. Skip any section you don't need.
              </p>

              {/* Sections */}
              <div className="space-y-4">
                {sections.map((section, i) => (
                  <div key={section.key}>
                    <label className="block text-xs font-semibold text-gray-600 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
                      {i + 1}. {section.title}
                    </label>
                    <textarea
                      value={values[section.key]}
                      onChange={(e) => setValues((v) => ({ ...v, [section.key]: e.target.value }))}
                      placeholder={section.placeholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm
                        bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-slate-100
                        placeholder-gray-400 dark:placeholder-slate-500
                        focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none leading-relaxed"
                    />
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl text-sm font-semibold text-gray-500 dark:text-slate-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-h-[48px]"
                >
                  Skip
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving || saved}
                  className={`flex-1 py-3 rounded-xl text-sm font-semibold text-white min-h-[48px] transition-all
                    ${saved
                      ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30'
                      : `bg-gradient-to-r ${gradient} shadow-lg shadow-violet-500/30 disabled:opacity-50`
                    }`}
                >
                  {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Insights'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
