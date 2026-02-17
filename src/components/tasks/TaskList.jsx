import { AnimatePresence, motion } from 'framer-motion'
import TaskCard from './TaskCard'

const TABS = ['pending', 'completed', 'missed']

export default function TaskList({ tasks, counts, loading, onComplete, onMiss, onTapTask, activeTab, onTabChange }) {

  const filtered = tasks.filter((t) => t.status === activeTab)

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

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm">
          {activeTab === 'pending' && 'No pending tasks. Tap + to add one!'}
          {activeTab === 'completed' && 'No completed tasks yet.'}
          {activeTab === 'missed' && 'No missed tasks. Great job!'}
        </div>
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
