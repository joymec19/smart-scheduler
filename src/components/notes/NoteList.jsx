import { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CATEGORY_META = {
  learning: { icon: '📚', color: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  work:     { icon: '💼', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  health:   { icon: '💪', color: 'bg-green-100 text-green-700', dot: 'bg-green-500' },
  personal: { icon: '🌸', color: 'bg-pink-100 text-pink-700', dot: 'bg-pink-500' },
  info:     { icon: '💡', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  creative: { icon: '🎨', color: 'bg-cyan-100 text-cyan-700', dot: 'bg-cyan-500' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

// Memoised so unchanged cards skip re-renders
const NoteCard = memo(function NoteCard({ note, onDelete }) {
  const meta = CATEGORY_META[note.category] || CATEGORY_META.info

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-xl shadow-sm p-4 active:scale-[0.98] transition-transform"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Category icon */}
        <span
          className={`${meta.color} text-base w-8 h-8 rounded-lg flex items-center justify-center shrink-0`}
        >
          {meta.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 text-sm leading-snug line-clamp-3">
            {note.content}
          </p>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              <span className={`text-[10px] font-medium ${meta.color.split(' ')[1]}`}>
                {note.category}
              </span>
            </div>
            <span className="text-[10px] text-gray-400">
              {timeAgo(note.created_at)}
            </span>
          </div>
        </div>

        {/* Delete */}
        <button
          onClick={() => onDelete(note.id)}
          className="text-gray-300 hover:text-red-400 transition-colors ml-1 shrink-0"
          aria-label="Delete note"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  )
})

export default function NoteList({ notes, onDelete }) {
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center py-16 text-center px-8"
      >
        <span className="text-6xl mb-4">💭</span>
        <p className="text-gray-700 font-semibold text-base">Capture your first idea</p>
        <p className="text-gray-400 text-sm mt-1.5">Tap 📝 to jot down a thought</p>
      </motion.div>
    )
  }

  return (
    <div className="space-y-3 px-4">
      <AnimatePresence initial={false}>
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={onDelete} />
        ))}
      </AnimatePresence>
    </div>
  )
}
