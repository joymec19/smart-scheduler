import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import useNoteStore from '../stores/useNoteStore'
import NoteList from '../components/notes/NoteList'
import { NoteSkeletonList } from '../components/Skeleton'

const CATEGORIES = ['all', 'learning', 'work', 'health', 'personal', 'info', 'creative']

const CATEGORY_ICONS = {
  all:      '🗂',
  learning: '📚',
  work:     '💼',
  health:   '💪',
  personal: '🌸',
  info:     '💡',
  creative: '🎨',
}

const CATEGORY_ACTIVE = {
  all:      'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30',
  learning: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white shadow-md shadow-blue-500/30',
  work:     'bg-gradient-to-r from-violet-400 to-violet-600 text-white shadow-md shadow-violet-500/30',
  health:   'bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-emerald-500/30',
  personal: 'bg-gradient-to-r from-pink-400 to-pink-500 text-white shadow-md shadow-pink-500/30',
  info:     'bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md shadow-amber-500/30',
  creative: 'bg-gradient-to-r from-cyan-400 to-cyan-500 text-white shadow-md shadow-cyan-500/30',
}

export default function Notes() {
  const { user } = useAuth()
  const { notes, loading, error, fetchNotes, deleteNote } = useNoteStore()
  const [activeCategory, setActiveCategory] = useState('all')

  useEffect(() => {
    if (user) fetchNotes(user.id)
  }, [user])

  const filtered =
    activeCategory === 'all'
      ? notes
      : notes.filter((n) => n.category === activeCategory)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300 pb-8">
      {/* Header */}
      <div className="pt-14 pb-5 px-5">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Mental Notes
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} captured
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="px-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold shrink-0 transition-all
                ${activeCategory === cat
                  ? CATEGORY_ACTIVE[cat]
                  : 'bg-white dark:bg-[#13131a] text-gray-500 dark:text-slate-500 border border-gray-100 dark:border-white/10 shadow-sm'
                }
              `}
            >
              <span>{CATEGORY_ICONS[cat]}</span>
              <span className="capitalize">{cat}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mt-5">
        {error ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center py-14 text-center px-8"
          >
            <span className="text-5xl mb-3">😕</span>
            <p className="text-gray-700 dark:text-slate-200 font-semibold">Couldn't load notes</p>
            <p className="text-slate-400 text-sm mt-1 mb-5">{error}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchNotes(user.id)}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/30"
            >
              Try Again
            </motion.button>
          </motion.div>
        ) : loading ? (
          <NoteSkeletonList count={4} />
        ) : (
          <NoteList notes={filtered} onDelete={deleteNote} />
        )}
      </div>
    </div>
  )
}
