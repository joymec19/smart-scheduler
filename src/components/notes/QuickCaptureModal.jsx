import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNoteStore from '../../stores/useNoteStore'
import useTaskStore from '../../stores/useTaskStore'
import { useAuth } from '../../hooks/useAuth'
import { trackNoteCreated } from '../../lib/analytics-tracking'

const CATEGORIES = [
  { value: 'learning', label: 'Learning', icon: '📚', color: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  { value: 'work',     label: 'Work',     icon: '💼', color: 'bg-gradient-to-br from-violet-400 to-violet-600' },
  { value: 'health',   label: 'Health',   icon: '💪', color: 'bg-gradient-to-br from-emerald-400 to-green-500' },
  { value: 'personal', label: 'Personal', icon: '🌸', color: 'bg-gradient-to-br from-pink-400 to-pink-500' },
  { value: 'info',     label: 'Info',     icon: '💡', color: 'bg-gradient-to-br from-amber-400 to-orange-400' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'bg-gradient-to-br from-cyan-400 to-cyan-500' },
]

export default function QuickCaptureModal({ open, onClose }) {
  const { user } = useAuth()
  const { addNote, getRecentTags } = useNoteStore()
  const { tasks } = useTaskStore()

  const [content, setContent] = useState('')
  const [category, setCategory] = useState('learning')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [linkTask, setLinkTask] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const textRef = useRef(null)
  const recentTags = getRecentTags()

  // Auto-focus text area when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => textRef.current?.focus(), 100)
    } else {
      // Reset form on close
      setContent('')
      setCategory('learning')
      setTagInput('')
      setTags([])
      setLinkTask(false)
      setSelectedTaskId(null)
    }
  }, [open])

  function addTag(tag) {
    const trimmed = tag.trim().toLowerCase().replace(/\s+/g, '-')
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed])
    }
    setTagInput('')
  }

  function handleTagKeyDown(e) {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault()
      addTag(tagInput)
    }
    if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  const linkableTasks = tasks.filter((t) => !t.is_subtask)
  const linkedTask = linkableTasks.find((t) => t.id === selectedTaskId)

  async function handleSave() {
    if (!content.trim() || submitting) return
    setSubmitting(true)
    try {
      await addNote({
        user_id: user.id,
        content: content.trim(),
        category,
        tags,
        source_task_id: linkTask ? selectedTaskId : null,
      })
      trackNoteCreated({ category, has_tags: tags.length > 0 })
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
            className="w-full max-w-lg rounded-t-3xl pb-8 max-h-[90vh] overflow-y-auto
              bg-white dark:bg-gray-900/98 border-t border-gray-200 dark:border-white/10"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 dark:bg-white/15 rounded-full mx-auto mt-3 mb-4" />

            <div className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Quick Note</h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Main text input */}
              <textarea
                ref={textRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?..."
                rows={4}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm
                  bg-gray-50 dark:bg-white/5 text-gray-800 dark:text-slate-100
                  placeholder-gray-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none leading-relaxed"
              />

              {/* Category chips */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Category</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`
                        min-h-[40px] rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5
                        ${category === cat.value
                          ? `${cat.color} text-white shadow-md scale-[1.02]`
                          : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent dark:border-white/10'
                        }
                      `}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tag input */}
              <div className="mt-4">
                <p className="text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">Tags (optional)</p>

                {/* Tag pills + input */}
                <div className="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 min-h-[44px] focus-within:ring-2 focus-within:ring-violet-500/50 focus-within:border-transparent bg-gray-50 dark:bg-white/5">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-violet-500/15 text-violet-400 border border-violet-500/25 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        className="text-violet-400 hover:text-violet-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    onBlur={() => tagInput.trim() && addTag(tagInput)}
                    placeholder={tags.length === 0 ? 'Add tag, press Enter...' : ''}
                    className="flex-1 min-w-[120px] text-xs outline-none bg-transparent text-gray-700 dark:text-slate-300 placeholder-gray-400 dark:placeholder-slate-500"
                  />
                </div>

                {/* Recent tag suggestions */}
                {recentTags.length > 0 && tagInput === '' && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {recentTags
                      .filter((t) => !tags.includes(t))
                      .slice(0, 8)
                      .map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => addTag(tag)}
                          className="text-[10px] bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-500 border border-gray-200 dark:border-white/10 px-2 py-0.5 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                          #{tag}
                        </button>
                      ))}
                  </div>
                )}
              </div>

              {/* Link to task toggle */}
              <div className="mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setLinkTask((v) => !v)
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-300 w-full"
                >
                  <span
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                      linkTask ? 'bg-gradient-to-r from-violet-500 to-indigo-600' : 'bg-gray-200 dark:bg-white/10'
                    }`}
                  >
                    <motion.span
                      className="w-5 h-5 bg-white rounded-full shadow-sm"
                      animate={{ x: linkTask ? 16 : 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  </span>
                  <span className="font-medium">Link to task</span>
                </button>
              </div>

              {/* Task picker (shown when linkTask is enabled) */}
              <AnimatePresence>
                {linkTask && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-xl border border-gray-200 dark:border-white/10 max-h-36 overflow-y-auto bg-gray-50 dark:bg-white/5">
                      {linkableTasks.length === 0 ? (
                        <p className="text-center text-xs text-slate-400 py-4">No tasks found</p>
                      ) : (
                        linkableTasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => {
                              setSelectedTaskId(task.id)
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-gray-100 dark:border-white/5 last:border-0 ${
                              selectedTaskId === task.id ? 'bg-violet-500/10' : ''
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                task.status === 'completed' ? 'bg-emerald-400' :
                                task.status === 'missed' ? 'bg-rose-400' :
                                task.priority === 'high' ? 'bg-rose-400' :
                                task.priority === 'medium' ? 'bg-amber-400' : 'bg-gray-300 dark:bg-slate-500'
                              }`}
                            />
                            <span className="truncate text-gray-700 dark:text-slate-300">{task.title}</span>
                            <span className={`ml-auto text-[10px] shrink-0 font-medium capitalize ${
                              task.status === 'completed' ? 'text-emerald-500' :
                              task.status === 'missed' ? 'text-rose-400' : 'text-gray-400 dark:text-slate-500'
                            }`}>
                              {task.status === 'pending' ? '' : task.status}
                            </span>
                            {selectedTaskId === task.id && (
                              <span className="text-violet-500 shrink-0">✓</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {linkedTask && (
                      <p className="text-xs text-violet-500 dark:text-violet-400 mt-1.5 px-1">
                        Linked to: <span className="font-semibold">{linkedTask.title}</span>
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={!content.trim() || submitting}
                className="w-full mt-6 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl px-4 py-3 font-semibold text-sm min-h-[48px] shadow-lg shadow-violet-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-opacity active:scale-[0.98]"
              >
                {submitting ? 'Saving...' : 'Save Note'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
