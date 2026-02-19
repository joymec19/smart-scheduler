import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useNoteStore from '../../stores/useNoteStore'
import useTaskStore from '../../stores/useTaskStore'
import { useAuth } from '../../hooks/useAuth'
import { trackNoteCreated } from '../../lib/analytics-tracking'

const CATEGORIES = [
  { value: 'learning', label: 'Learning', icon: '📚', color: 'bg-blue-500' },
  { value: 'work',     label: 'Work',     icon: '💼', color: 'bg-purple-500' },
  { value: 'health',   label: 'Health',   icon: '💪', color: 'bg-green-500' },
  { value: 'personal', label: 'Personal', icon: '🌸', color: 'bg-pink-500' },
  { value: 'info',     label: 'Info',     icon: '💡', color: 'bg-amber-500' },
  { value: 'creative', label: 'Creative', icon: '🎨', color: 'bg-cyan-500' },
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
  const [showTaskPicker, setShowTaskPicker] = useState(false)
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
      setShowTaskPicker(false)
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

  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const linkedTask = pendingTasks.find((t) => t.id === selectedTaskId)

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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white w-full max-w-lg rounded-t-2xl pb-8 max-h-[90vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Handle */}
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mt-3 mb-4" />

            <div className="px-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">Quick Note</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-gray-800 placeholder-gray-400 leading-relaxed"
              />

              {/* Category chips */}
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">Category</p>
                <div className="grid grid-cols-3 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className={`
                        min-h-[40px] rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5
                        ${category === cat.value
                          ? `${cat.color} text-white shadow-md scale-[1.02]`
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
                <p className="text-xs font-medium text-gray-500 mb-2">Tags (optional)</p>

                {/* Tag pills + input */}
                <div className="flex flex-wrap gap-1.5 px-3 py-2 rounded-xl border border-gray-200 min-h-[44px] focus-within:ring-2 focus-within:ring-purple-400 focus-within:border-transparent">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        className="text-purple-400 hover:text-purple-700"
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
                    className="flex-1 min-w-[120px] text-xs outline-none bg-transparent text-gray-700 placeholder-gray-400"
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
                          className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full hover:bg-gray-200 transition-colors"
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
                    if (!linkTask) setShowTaskPicker(true)
                  }}
                  className="flex items-center gap-2 text-sm text-gray-600 w-full"
                >
                  <span
                    className={`w-10 h-6 rounded-full transition-colors flex items-center px-0.5 ${
                      linkTask ? 'bg-purple-500' : 'bg-gray-200'
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
                    <div className="mt-3 rounded-xl border border-gray-200 max-h-36 overflow-y-auto">
                      {pendingTasks.length === 0 ? (
                        <p className="text-center text-xs text-gray-400 py-4">No pending tasks</p>
                      ) : (
                        pendingTasks.map((task) => (
                          <button
                            key={task.id}
                            type="button"
                            onClick={() => {
                              setSelectedTaskId(task.id)
                              setShowTaskPicker(false)
                            }}
                            className={`w-full text-left px-3 py-2.5 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0 ${
                              selectedTaskId === task.id ? 'bg-purple-50' : ''
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                task.priority === 'high' ? 'bg-red-400' :
                                task.priority === 'medium' ? 'bg-amber-400' : 'bg-gray-300'
                              }`}
                            />
                            <span className="truncate text-gray-700">{task.title}</span>
                            {selectedTaskId === task.id && (
                              <span className="ml-auto text-purple-500 shrink-0">✓</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>

                    {linkedTask && (
                      <p className="text-xs text-purple-600 mt-1.5 px-1">
                        Linked to: <span className="font-medium">{linkedTask.title}</span>
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
                className="w-full mt-6 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl px-4 py-3 font-semibold text-sm min-h-[48px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
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
