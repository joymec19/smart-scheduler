import { AnimatePresence, motion } from 'framer-motion'
import TaskCard from './TaskCard'
import { TaskSkeletonList } from '../Skeleton'

const TABS = ['pending', 'completed', 'missed']

const EMPTY_STATES = {
  pending: {
    emoji: '🌅',
    title: 'Your day is wide open!',
    subtitle: 'Add your first task to get started',
  },
  completed: {
    emoji: '🎯',
    title: 'Nothing completed yet',
    subtitle: 'Finish a task to see it here',
  },
  missed: {
    emoji: '🏆',
    title: 'No missed tasks!',
    subtitle: "You're crushing it today",
  },
}

export default function TaskList({ tasks, counts, loading, error, onRetry, onComplete, onMiss, onTapTask, activeTab, onTabChange }) {

  const filtered = tasks.filter((t) => t.status === activeTab)
  const empty = EMPTY_STATES[activeTab]

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 gap-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              flex-1 py-2 text-sm font-medium rounded-lg capitalize
              min-h-[44px] transition-colors
              ${activeTab === tab
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
              }
            `}
          >
            {tab}
            <span className="ml-1 text-xs text-gray-400">
              {counts[tab] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Error state */}
      {error ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="text-5xl mb-3">😕</span>
          <p className="text-gray-700 font-medium">Couldn't load tasks</p>
          <p className="text-gray-400 text-sm mt-1 mb-5">{error}</p>
          {onRetry && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="bg-purple-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
            >
              Try Again
            </motion.button>
          )}
        </div>
      ) : loading ? (
        <TaskSkeletonList count={3} />
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center py-14 text-center"
        >
          <span className="text-5xl mb-3">{empty.emoji}</span>
          <p className="text-gray-700 font-semibold text-base">{empty.title}</p>
          <p className="text-gray-400 text-sm mt-1">{empty.subtitle}</p>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {filtered.map((task) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.2 }}
            >
              <TaskCard
                task={task}
                onComplete={onComplete}
                onMiss={onMiss}
                onTap={onTapTask}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
