import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import useNoteStore from '../stores/useNoteStore'
import NoteList from '../components/notes/NoteList'
import { NoteSkeletonList } from '../components/Skeleton'

const CATEGORIES = ['all', 'learning', 'work', 'health', 'personal', 'info', 'creative']

const CATEGORY_ICONS = {
  all: '🗂',
  learning: '📚',
  work: '💼',
  health: '💪',
  personal: '🌸',
  info: '💡',
  creative: '🎨',
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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 pt-12 pb-5 px-5">
        <h1 className="text-white text-2xl font-bold">Mental Notes</h1>
        <p className="text-purple-200 text-sm mt-1">
          {notes.length} {notes.length === 1 ? 'note' : 'notes'} captured
        </p>
      </div>

      {/* Category filter tabs */}
      <div className="px-4 mt-4">
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`
                flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium shrink-0 transition-all shadow-sm
                ${activeCategory === cat
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-white text-gray-500 border border-gray-100'
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
            <p className="text-gray-700 font-semibold">Couldn't load notes</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">{error}</p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => fetchNotes(user.id)}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
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
