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
  learning: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  work:     'bg-violet-500/20 text-violet-400 border border-violet-500/30',
  health:   'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  personal: 'bg-pink-500/20 text-pink-400 border border-pink-500/30',
  info:     'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  creative: 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30',
}

const PRIORITY_COLORS = {
  high:   'bg-rose-500/15 text-rose-400 border border-rose-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  low:    'bg-slate-500/15 text-slate-400 border border-slate-500/25',
}

const PRIORITY_STRIPE = {
  high:   'bg-gradient-to-b from-rose-400 to-red-500',
  medium: 'bg-gradient-to-b from-amber-400 to-orange-400',
  low:    'bg-gradient-to-b from-slate-300 to-slate-400',
}

const METRIC_CONFIGS = [
  {
    label: "Today's Tasks",
    gradient: 'from-violet-500 to-indigo-600',
    shadow: 'shadow-violet-500/20',
  },
  {
    label: 'Completed',
    gradient: 'from-emerald-400 to-green-500',
    shadow: 'shadow-emerald-500/20',
  },
  {
    label: 'Missed',
    gradient: 'from-rose-400 to-red-500',
    shadow: 'shadow-rose-500/20',
  },
  {
    label: 'Nudges',
    gradient: 'from-amber-400 to-orange-500',
    shadow: 'shadow-amber-500/20',
  },
]

function getGreeting() {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 12) return { text: 'Good morning', emoji: '☀️' }
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon', emoji: '🌤' }
  if (hour >= 17 && hour < 21) return { text: 'Good evening', emoji: '🌙' }
  return { text: 'Good night', emoji: '✨' }
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
  const greeting = getGreeting()

  const topTasks = [...tasks]
    .filter((t) => t.status === 'pending' && !t.is_subtask)
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority])
    .slice(0, 3)

  function subtaskProgress(parentId) {
    const subtasks = tasks.filter((t) => t.parent_task_id === parentId && t.is_subtask)
    if (!subtasks.length) return null
    return {
      total:     subtasks.length,
      completed: subtasks.filter((t) => t.status === 'completed').length,
    }
  }

  const metricValues = [
    counts.pending + counts.completed + counts.missed,
    counts.completed,
    counts.missed,
    activeNudges.length,
  ]

  async function handleCreateTask(data) {
    await addTask({ ...data, user_id: user.id })
    setCreateOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] pb-8 transition-colors duration-300">
      <div className="mb-8 p-6 bg-gradient-to-br from-violet-50 to-indigo-50 dark:bg-none dark:bg-white/5 backdrop-blur-md rounded-2xl border border-violet-100 dark:border-white/10">
        <div className="flex items-center gap-3 mb-2">
          <img src="/logo.png" alt="Smart Scheduler logo" className="w-10 h-10 rounded-xl shadow-md shadow-violet-500/20" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-white dark:to-slate-200 bg-clip-text text-transparent">
            Smart Scheduler
          </h1>
        </div>
        <p className="text-slate-500 dark:text-slate-400 mb-4">AI-powered task management for professionals</p>
        <div className="flex gap-4 text-sm">
          <a href="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</a>
          <a href="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</a>
        </div>
      </div>
      {/* ── Hero greeting section ── */}
      <div className="pt-14 pb-8 px-5 relative">
        {/* Settings gear icon — offset left of the dark mode toggle */}
        <button
          onClick={() => navigate('/settings')}
          className="absolute top-2 right-14 w-9 h-9 flex items-center justify-center rounded-full text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          aria-label="Settings"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
        <p className="text-slate-500 dark:text-slate-500 text-sm font-medium">
          {greeting.text} {greeting.emoji}
        </p>
        <h1 className="mt-1 font-bold leading-tight" style={{ fontSize: '28px' }}>
          <span className="text-gray-900 dark:text-white">Hey, </span>
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            {userName}
          </span>
          <span className="ml-1">👋</span>
        </h1>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1.5 font-medium">
          {formatDate(new Date())}
        </p>
      </div>

      {/* ── Metric cards — 4-up grid ── */}
      <div className="px-4">
        <div className="grid grid-cols-4 gap-2">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
            : METRIC_CONFIGS.map((m, i) => (
                <motion.div
                  key={m.label}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative rounded-2xl p-3 text-center overflow-hidden glass-card hover:shadow-violet-500/10 transition-all"
                >
                  {/* Gradient top stripe */}
                  <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${m.gradient}`} />
                  <p className={`text-2xl font-bold leading-none bg-gradient-to-r ${m.gradient} bg-clip-text text-transparent`}>
                    {metricValues[i]}
                  </p>
                  <p className="text-slate-500 dark:text-slate-500 text-[9px] mt-1.5 leading-tight font-medium">
                    {m.label}
                  </p>
                </motion.div>
              ))}
        </div>
      </div>

      {/* ── Top 3 priority tasks ── */}
      <div className="px-4 mt-7">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-gray-800 dark:text-white font-semibold text-base">Top Priority</h2>
          <button
            onClick={() => navigate('/tasks')}
            className="text-violet-600 dark:text-violet-400 text-sm font-medium hover:text-violet-700 transition-colors"
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
            className="relative glass-card rounded-2xl p-6 text-center overflow-hidden"
          >
            {/* Subtle animated gradient circle */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 blur-2xl" />
            </div>
            <span className="text-4xl block mb-2 relative">🌅</span>
            <p className="text-gray-700 dark:text-slate-200 font-semibold text-sm relative">Your day is wide open!</p>
            <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5 relative">Add your first task to get started</p>
            <button
              onClick={() => setCreateOpen(true)}
              className="mt-4 bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-lg shadow-violet-500/30 active:scale-95 transition-transform relative"
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
                className="glass-card rounded-2xl flex items-stretch overflow-hidden cursor-pointer active:scale-[0.98] transition-all hover:shadow-violet-500/10"
              >
                {/* Priority stripe */}
                <div className={`w-1 shrink-0 ${PRIORITY_STRIPE[task.priority] || 'bg-gray-300'}`} />

                <div className="flex-1 p-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-gray-800 dark:text-slate-100 font-semibold text-sm leading-snug truncate">
                      {task.title}
                    </p>
                    <span
                      className={`shrink-0 text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${
                        PRIORITY_COLORS[task.priority] || ''
                      }`}
                    >
                      {task.priority}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${
                        CATEGORY_LABEL_COLORS[task.category] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.category}
                    </span>
                    {task.estimated_minutes && (
                      <span className="text-xs text-slate-400">
                        {task.estimated_minutes < 60
                          ? `${task.estimated_minutes}m`
                          : `${Math.round(task.estimated_minutes / 60)}h`}
                      </span>
                    )}
                    {task.due_at && (
                      <span className={`text-xs ${new Date(task.due_at) < new Date() ? 'text-rose-400 font-medium' : 'text-slate-400'}`}>
                        {new Date(task.due_at) < new Date()
                          ? '⚠ overdue'
                          : `due ${new Date(task.due_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </span>
                    )}
                  </div>

                  {/* Subtask progress bar */}
                  {(() => {
                    const progress = subtaskProgress(task.id)
                    if (!progress) return null
                    const pct = Math.round((progress.completed / progress.total) * 100)
                    return (
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1 bg-gray-100 dark:bg-white/10 rounded-full flex-1">
                          <div
                            className="h-1 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {progress.completed}/{progress.total}
                        </span>
                      </div>
                    )
                  })()}
                </div>

                <div className="flex items-center pr-3">
                  <svg className="w-4 h-4 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <h2 className="text-gray-800 dark:text-white font-semibold text-base">Smart Nudges</h2>
          {activeNudges.length > 0 && (
            <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              {activeNudges.length} active
            </span>
          )}
        </div>

        {activeNudges.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-4 relative glass-card rounded-2xl p-5 text-center overflow-hidden"
          >
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 blur-2xl" />
            </div>
            <span className="text-3xl block mb-1.5 relative">✨</span>
            <p className="text-gray-700 dark:text-slate-200 font-semibold text-sm relative">All caught up!</p>
            <p className="text-gray-400 dark:text-slate-500 text-xs mt-0.5 relative">No nudges right now — keep it up!</p>
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
                className="flex items-center gap-2 glass-float rounded-full shadow-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200"
              >
                Add Task
                <span className="w-6 h-6 bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-sm">✓</span>
              </button>
              <button
                onClick={() => { setFabOpen(false); setNoteOpen(true) }}
                className="flex items-center gap-2 glass-float rounded-full shadow-xl px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-slate-200"
              >
                Quick Note
                <span className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-blue-500 text-white rounded-full flex items-center justify-center text-xs shadow-sm">📝</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          data-tour-id="tour-fab"
          whileTap={{ scale: 0.88 }}
          onClick={() => setFabOpen((v) => !v)}
          className="w-14 h-14 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-xl shadow-violet-500/40 flex items-center justify-center text-white"
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

      {/* ── Task create modal ── */}
      <TaskCreateModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateTask}
      />

      {/* ── Quick capture modal ── */}
      <QuickCaptureModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
      />
    </div>
  )
}
