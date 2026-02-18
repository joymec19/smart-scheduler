import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import useNoteStore from '../stores/useNoteStore'
import NoteList from '../components/notes/NoteList'

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
  const { notes, loading, fetchNotes, deleteNote } = useNoteStore()
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
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <NoteList notes={filtered} onDelete={deleteNote} />
        )}
      </div>
    </div>
  )
}
