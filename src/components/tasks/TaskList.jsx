import { AnimatePresence, motion } from 'framer-motion'
import TaskCard from './TaskCard'
import { TaskSkeletonList } from '../Skeleton'

const TABS = ['pending', 'completed', 'missed']

const SEVEN_DAYS_AGO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

const EMPTY_STATES = {
  pending: {
    emoji: '🌅',
    title: 'Your day is wide open!',
    subtitle: 'Add your first task to get started',
  },
  completed: {
    emoji: '🎯',
    title: 'Nothing completed in the last 7 days',
    subtitle: 'Finish a task to see it here',
  },
  missed: {
    emoji: '🏆',
    title: 'No missed tasks in the last 7 days!',
    subtitle: "You're crushing it",
  },
}

export default function TaskList({ tasks, counts, loading, error, onRetry, onComplete, onMiss, onTapTask, onDelete, activeTab, onTabChange }) {

  const parentTasks = tasks.filter((t) => !t.is_subtask)

  const tabTasks = {
    pending: parentTasks.filter((t) => t.status === 'pending'),
    completed: parentTasks.filter(
      (t) => t.status === 'completed' && t.completed_at && new Date(t.completed_at) >= SEVEN_DAYS_AGO
    ),
    missed: parentTasks.filter(
      (t) => t.status === 'missed' && (!t.due_at || new Date(t.due_at) >= SEVEN_DAYS_AGO)
    ),
  }

  const filtered = tabTasks[activeTab] || []
  const tabCounts = {
    pending: tabTasks.pending.length,
    completed: tabTasks.completed.length,
    missed: tabTasks.missed.length,
  }
  const empty = EMPTY_STATES[activeTab]

  return (
    <div className="flex flex-col gap-3">
      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-white/5 rounded-2xl p-1 gap-1 border border-gray-200 dark:border-white/10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => onTabChange(tab)}
            className={`
              flex-1 py-2 text-sm font-medium rounded-xl capitalize
              min-h-[44px] transition-all duration-200
              ${activeTab === tab
                ? 'bg-white dark:bg-[#13131a] text-gray-900 dark:text-white shadow-sm border border-gray-100 dark:border-white/10'
                : 'text-gray-500 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-400'
              }
            `}
          >
            {tab}
            <span className={`ml-1 text-xs ${activeTab === tab ? 'text-violet-500 dark:text-violet-400' : 'text-gray-400 dark:text-slate-600'}`}>
              {tabCounts[tab] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Time window hint */}
      {(activeTab === 'completed' || activeTab === 'missed') && (
        <p className="text-xs text-slate-400 text-right -mt-1">Last 7 days</p>
      )}

      {/* Error state */}
      {error ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="text-5xl mb-3">😕</span>
          <p className="text-gray-700 dark:text-slate-300 font-medium">Couldn't load tasks</p>
          <p className="text-gray-400 dark:text-slate-500 text-sm mt-1 mb-5">{error}</p>
          {onRetry && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onRetry}
              className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-violet-500/30"
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
          className="relative flex flex-col items-center py-14 text-center glass-card rounded-2xl overflow-hidden"
        >
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 blur-3xl" />
          </div>
          <span className="text-5xl mb-3 relative">{empty.emoji}</span>
          <p className="text-gray-700 dark:text-slate-200 font-semibold text-base relative">{empty.title}</p>
          <p className="text-gray-400 dark:text-slate-500 text-sm mt-1 relative">{empty.subtitle}</p>
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
                onDelete={onDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  )
}
