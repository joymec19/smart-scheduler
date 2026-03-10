import { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ShareFallbackModal from '../share/ShareFallbackModal'
import { shareNote } from '../../lib/share'
import useTaskStore from '../../stores/useTaskStore'

const CATEGORY_META = {
  learning: { icon: '📚', badge: 'bg-blue-500/15 text-blue-400 border border-blue-500/25', dot: 'bg-blue-400', iconBg: 'bg-gradient-to-br from-blue-400 to-blue-500' },
  work:     { icon: '💼', badge: 'bg-violet-500/15 text-violet-400 border border-violet-500/25', dot: 'bg-violet-400', iconBg: 'bg-gradient-to-br from-violet-400 to-violet-600' },
  health:   { icon: '💪', badge: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25', dot: 'bg-emerald-400', iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500' },
  personal: { icon: '🌸', badge: 'bg-pink-500/15 text-pink-400 border border-pink-500/25', dot: 'bg-pink-400', iconBg: 'bg-gradient-to-br from-pink-400 to-pink-500' },
  info:     { icon: '💡', badge: 'bg-amber-500/15 text-amber-400 border border-amber-500/25', dot: 'bg-amber-400', iconBg: 'bg-gradient-to-br from-amber-400 to-orange-400' },
  creative: { icon: '🎨', badge: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25', dot: 'bg-cyan-400', iconBg: 'bg-gradient-to-br from-cyan-400 to-cyan-500' },
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

function formatDate(dateStr) {
  return new Intl.DateTimeFormat(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit',
  }).format(new Date(dateStr))
}

const STATUS_STYLES = {
  pending:   'bg-amber-500/15 text-amber-500 border border-amber-500/30',
  completed: 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30',
  missed:    'bg-rose-500/15 text-rose-400 border border-rose-500/30',
}

function NoteDetailModal({ note, onClose }) {
  const { tasks } = useTaskStore()
  const meta = CATEGORY_META[note.category] || CATEGORY_META.info

  // Look up linked task — may be completed, missed, or deleted
  const linkedTask = note.source_task_id
    ? tasks.find((t) => t.id === note.source_task_id) || null
    : null
  const taskDeleted = note.source_task_id && !linkedTask

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-lg rounded-2xl pb-6 max-h-[85vh] flex flex-col
            bg-white dark:bg-[#13131a] border border-gray-200 dark:border-white/10 shadow-2xl"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-5 pt-5 overflow-y-auto flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 shrink-0">
              <div className="flex items-center gap-2">
                <span className={`${meta.iconBg} text-base w-8 h-8 rounded-xl flex items-center justify-center shadow-sm`}>
                  {meta.icon}
                </span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${meta.badge}`}>
                  {note.category}
                </span>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-white/10 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Full content */}
            <p className="text-gray-800 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap mb-4">
              {note.content}
            </p>

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {note.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Linked task */}
            {(linkedTask || taskDeleted) && (
              <div className="rounded-xl border border-gray-200 dark:border-white/10 p-3 mb-4 bg-gray-50 dark:bg-white/5">
                <p className="text-[10px] font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                  Linked Task
                </p>
                {taskDeleted ? (
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600 shrink-0" />
                    <span className="text-sm text-gray-400 dark:text-slate-500 italic">Task has been deleted</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${
                      linkedTask.status === 'completed' ? 'bg-emerald-400' :
                      linkedTask.status === 'missed' ? 'bg-rose-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-sm text-gray-700 dark:text-slate-300 flex-1 truncate font-medium">
                      {linkedTask.title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize shrink-0 ${STATUS_STYLES[linkedTask.status] || ''}`}>
                      {linkedTask.status}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Created at */}
            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-right">
              {formatDate(note.created_at)}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// Memoised so unchanged cards skip re-renders
const NoteCard = memo(function NoteCard({ note, onDelete }) {
  const meta = CATEGORY_META[note.category] || CATEGORY_META.info
  const [shareModal, setShareModal] = useState({ open: false, content: null })
  const [detailOpen, setDetailOpen] = useState(false)

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => setDetailOpen(true)}
      className="glass-card rounded-2xl p-4 active:scale-[0.98] transition-all hover:shadow-violet-500/10 cursor-pointer"
    >
      {/* Header row */}
      <div className="flex items-start gap-3">
        {/* Category icon with gradient bg */}
        <span
          className={`${meta.iconBg} text-base w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm`}
        >
          {meta.icon}
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 dark:text-slate-100 text-sm leading-snug line-clamp-3">
            {note.content}
          </p>

          {/* Tags */}
          {note.tags && note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2 py-0.5 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${meta.badge}`}>
                {note.category}
              </span>
              {note.auto_generated && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400 border border-violet-500/25">
                  ✨ AutoInsight
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              {timeAgo(note.created_at)}
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-0.5 ml-1 shrink-0">
          {/* Share */}
          <button
            onClick={(e) => { e.stopPropagation(); shareNote(note, (content) => setShareModal({ open: true, content })) }}
            className="text-gray-300 dark:text-slate-600 hover:text-violet-400 dark:hover:text-violet-400 transition-colors p-1 rounded-lg hover:bg-violet-500/10"
            aria-label="Share note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
            </svg>
          </button>

          {/* Delete */}
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(note.id) }}
            className="text-gray-300 dark:text-slate-600 hover:text-rose-400 dark:hover:text-rose-400 transition-colors p-1 rounded-lg hover:bg-rose-500/10"
            aria-label="Delete note"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>

    <ShareFallbackModal
      open={shareModal.open}
      shareContent={shareModal.content}
      onClose={() => setShareModal({ open: false, content: null })}
    />
    {detailOpen && <NoteDetailModal note={note} onClose={() => setDetailOpen(false)} />}
    </>
  )
})

export default function NoteList({ notes, onDelete }) {
  if (notes.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative flex flex-col items-center justify-center py-16 text-center px-8 mx-4 glass-card rounded-2xl overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 blur-3xl" />
        </div>
        <span className="text-6xl mb-4 relative">💭</span>
        <p className="text-gray-700 dark:text-slate-200 font-semibold text-base relative">Capture your first idea</p>
        <p className="text-slate-400 text-sm mt-1.5 relative">Tap 📝 to jot down a thought</p>
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
