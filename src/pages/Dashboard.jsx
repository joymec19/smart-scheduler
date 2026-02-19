import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import useTaskStore from '../stores/useTaskStore'
import useNudgeStore from '../stores/useNudgeStore'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import QuickCaptureModal from '../components/notes/QuickCaptureModal'
import NudgeCard from '../components/nudges/NudgeCard'
import { DashboardTaskSkeleton, MetricCardSkeleton } from '../components/Skeleton'

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 }

const CATEGORY_LABEL_COLORS = {
  learning:  'bg-blue-100 text-blue-700',
  work:      'bg-purple-100 text-purple-700',
  health:    'bg-green-100 text-green-700',
  personal:  'bg-pink-100 text-pink-700',
  info:      'bg-cyan-100 text-cyan-700',
  creative:  'bg-amber-100 text-amber-700',
}

const PRIORITY_COLORS = {
  high:   'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low:    'bg-gray-100 text-gray-600',
}

const PRIORITY_STRIPE = {
  high:   'bg-red-400',
  medium: 'bg-amber-400',
  low:    'bg-gray-300',
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { tasks, loading, fetchTasks, getCounts, addTask } = useTaskStore()
  const { nudges, fetchNudges, getActiveNudges } = useNudgeStore()

  const [fabOpen, setFabOpen] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)
  const [noteOpen, setNoteOpen] = useState(false)

  const userName =
    user?.user_metadata?.name ||
    user?.email?.split('@')[0] ||
    'there'

  useEffect(() => {
    if (user) {
      fetchTasks(user.id)
      fetchNudges(user.id)
    }
  }, [user])

  const counts = getCounts()
  const activeNudges = getActiveNudges()

  const topTasks = [...tasks]
    .filter((t) => t.status === 'pending')
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 3)

  const metrics = [
    {
      label: "Today's Tasks",
      value: counts.pending + counts.completed + counts.missed,
      valueColor: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Completed',
      value: counts.completed,
      valueColor: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Missed',
      value: counts.missed,
      valueColor: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      label: 'Active Nudges',
      value: activeNudges.length,
      valueColor: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ]

  async function handleCreateTask(data) {
    await addTask({ ...data, user_id: user.id })
    setCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* ── Gradient header ── */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 pt-12 pb-10 px-5">
        <p className="text-purple-200 text-sm">{formatDate(new Date())}</p>
        <h1 className="text-white text-2xl font-bold mt-1">
          Hey, {userName} 👋
        </h1>
        <p className="text-purple-200 text-sm mt-1">Here's your daily overview</p>
      </div>

      {/* ── Metric cards — 4-up grid, overlaps header ── */}
      <div className="px-4 -mt-5">
        <div className="grid grid-cols-4 gap-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
            : metrics.map((m) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className={`${m.bg} rounded-xl p-3 text-center shadow-sm`}
                >
                  <p className={`${m.valueColor} text-xl font-bold leading-none`}>{m.value}</p>
                  <p className="text-gray-500 text-[10px] mt-1 leading-tight">{m.label}</p>
                </motion.div>
              ))}
        </div>
      </div>

      {/* ── Top 3 priority tasks ── */}
      <div className="px-4 mt-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-800 font-semibold text-base">Top Priority Tasks</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="text-purple-600 text-sm font-medium"
          >
            See all →
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            <DashboardTaskSkeleton />
            <DashboardTaskSkeleton />
            <DashboardTaskSkeleton />
          </div>
        ) : topTasks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 text-center shadow-sm"
          >
            <span className="text-4xl block mb-2">🌅</span>
            <p className="text-gray-700 font-semibold text-sm">Your day is wide open!</p>
            <p className="text-gray-400 text-xs mt-0.5">Add your first task to get started</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 bg-purple-600 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-sm active:scale-95 transition-transform"
            >
              + Add Task
            </button>
          </motion.div>
        ) : (
          <div className="space-y-2">
            {topTasks.map((task, i) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => navigate('/tasks')}
                className="bg-white rounded-xl shadow-sm flex items-stretch overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
              >
                {/* Priority stripe */}
                <div className={`w-1.5 shrink-0 ${PRIORITY_STRIPE[task.priority] || 'bg-gray-300'}`} />

                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-800 font-medium text-sm leading-snug truncate">
                      {task.title}
                    </p>
                    <span
                      className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                        PRIORITY_COLORS[task.priority] || ''
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        CATEGORY_LABEL_COLORS[task.category] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.category}
                    </span>
                    {task.estimated_minutes && (
                      <span className="text-xs text-gray-400">
                        {task.estimated_minutes < 60
                          ? `${task.estimated_minutes}m`
                          : `${Math.round(task.estimated_minutes / 60)}h`}
                      </span>
                    )}
                    {task.due_at && (
                      <span className="text-xs text-gray-400">
                        {new Date(task.due_at) < new Date()
                          ? '⚠ overdue'
                          : `due ${new Date(task.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center pr-3">
                  <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Smart Nudges — horizontal scroll ── */}
      <div className="mt-7">
        <div className="px-4 mb-3 flex items-center justify-between">
          <h2 className="text-gray-800 font-semibold text-base">Smart Nudges</h2>
          {activeNudges.length > 0 && (
            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">
              {activeNudges.length} active
            </span>
          )}
        </div>

        {activeNudges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 bg-white rounded-xl p-5 text-center shadow-sm"
          >
            <span className="text-3xl block mb-1.5">✨</span>
            <p className="text-gray-700 font-semibold text-sm">All caught up!</p>
            <p className="text-gray-400 text-xs mt-0.5">No nudges right now — keep it up!</p>
          </motion.div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-4 pb-2" style={{ scrollbarWidth: 'none' }}>
            {activeNudges.map((nudge) => (
              <NudgeCard key={nudge.id} nudge={nudge} />
            ))}
          </div>
        )}
      </div>

      {/* ── FAB ── */}
      <div className="fixed bottom-24 right-4 z-50 flex flex-col items-end gap-2">
        <AnimatePresence>
          {fabOpen && (
            <motion.div
              key="fab-options"
              initial={{ opacity: 0, y: 8, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col items-end gap-2 mb-2"
            >
              <button
                onClick={() => { setFabOpen(false); setCreateOpen(true) }}
                className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-100"
              >
                Add Task
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-bold">✓</span>
              </button>
              <button
                onClick={() => { setFabOpen(false); setNoteOpen(true) }}
                className="flex items-center gap-2 bg-white rounded-full shadow-lg px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-100"
              >
                Quick Note
                <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">📝</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          data-tour-id="tour-fab"
          whileTap={{ scale: 0.88 }}
          onClick={() => setFabOpen((v) => !v)}
          className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full shadow-xl flex items-center justify-center text-white"
          aria-label="Quick actions"
        >
          <motion.span
            animate={{ rotate: fabOpen ? 45 : 0 }}
            transition={{ duration: 0.2 }}
            className="text-2xl font-light leading-none"
          >
            +
          </motion.span>
        </motion.button>
      </div>

      {/* ── Task create modal (from FAB) ── */}
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* ── Quick capture modal (from FAB) ── */}
      <QuickCaptureModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
      />
    </div>
  )
}
