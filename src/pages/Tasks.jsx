import { useEffect, useState } from 'react'
import useTaskStore from '../stores/useTaskStore'
import { useAuth } from '../hooks/useAuth'
import TaskList from '../components/tasks/TaskList'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import TaskDetailModal from '../components/tasks/TaskDetailModal'
import { motion, AnimatePresence } from 'framer-motion'
import {
  buildRRuleString,
  getNextOccurrence,
  processRecurringRules,
  getRuleDescription,
  RECURRENCE_PATTERNS,
} from '../lib/recurring'

export default function Tasks() {
  const { user } = useAuth()
  const {
    tasks, loading, error,
    fetchTasks, addTask, markComplete, markMissed, deleteTask,
    recurringRules, fetchRecurringRules, addRecurringRule, pauseRule, deleteRule,
  } = useTaskStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')
  const [rulesExpanded, setRulesExpanded] = useState(false)
  const [detailTask, setDetailTask] = useState(null)

  useEffect(() => {
    if (!user?.id) return
    const init = async () => {
      await processRecurringRules(user.id)
      fetchTasks(user.id)
      fetchRecurringRules(user.id)
    }
    init()
  }, [user?.id])

  // Exclude subtasks from the top-level list — they're grouped under their parent
  const parentTasks = tasks.filter((t) => !t.is_subtask)
  const parentCounts = {
    pending:   parentTasks.filter((t) => t.status === 'pending').length,
    completed: parentTasks.filter((t) => t.status === 'completed').length,
    missed:    parentTasks.filter((t) => t.status === 'missed').length,
  }

  async function handleCreate({ recurrence, ...data }) {
    if (recurrence) {
      const startDate = data.due_at ? new Date(data.due_at) : new Date()
      const pattern = RECURRENCE_PATTERNS[recurrence.pattern]
      const rruleString = buildRRuleString(pattern, recurrence.specificDay, startDate)
      const nextOcc = getNextOccurrence(rruleString) ?? startDate
      await addRecurringRule({
        ...data,
        user_id: user.id,
        rrule_string: rruleString,
        next_occurrence: nextOcc.toISOString(),
        due_time: recurrence.dueTime,
        pattern_key: recurrence.pattern,
      })
    } else {
      await addTask({
        ...data,
        user_id: user.id,
        status: 'pending',
        due_at: data.due_at ? new Date(data.due_at).toISOString() : null,
      })
    }
  }

  async function handleComplete(id) {
    await markComplete(id, null)
  }

  async function handleMiss(id) {
    await markMissed(id)
  }

  async function handleDelete(id) {
    await deleteTask(id)
  }

  function handleTapTask(task) {
    if (task.status === 'completed' || task.status === 'missed') {
      setDetailTask(task)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300 pb-24">
      {/* Header */}
      <div className="pt-14 pb-5 px-5">
        <h1 className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Tasks
          </span>
        </h1>
        <p className="text-xs text-slate-400 mt-0.5 font-medium">
          Tap Complete or Reschedule on each task
        </p>
      </div>

      {/* Task list */}
      <div className="px-4">
        <TaskList
          tasks={parentTasks}
          counts={parentCounts}
          loading={loading}
          error={error}
          onRetry={() => fetchTasks(user.id)}
          onComplete={handleComplete}
          onMiss={handleMiss}
          onDelete={handleDelete}
          onTapTask={handleTapTask}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </div>

      {/* FAB — only on Pending tab */}
      {activeTab === 'pending' && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="fixed bottom-24 right-4 w-14 h-14 bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-full shadow-xl shadow-violet-500/40 flex items-center justify-center text-2xl z-40"
          aria-label="Add task"
        >
          +
        </motion.button>
      )}

      {/* Recurring Rules collapsible */}
      <div className="px-4 mt-2 mb-6">
        <button
          onClick={() => setRulesExpanded((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl
            bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10
            shadow-sm min-h-[44px]"
        >
          <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
            🔁 Recurring Rules
            {recurringRules.length > 0 && (
              <span className="text-xs bg-violet-100 dark:bg-violet-500/20 text-violet-600 dark:text-violet-300 px-2 py-0.5 rounded-full">
                {recurringRules.length}
              </span>
            )}
          </span>
          <span className="text-gray-400 text-xs">{rulesExpanded ? '▲' : '▼'}</span>
        </button>

        <AnimatePresence>
          {rulesExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-2 flex flex-col gap-2">
                {recurringRules.length === 0 ? (
                  <p className="text-sm text-gray-400 dark:text-slate-500 text-center py-6">
                    No recurring tasks yet. Toggle "Make this recurring?" when creating a task.
                  </p>
                ) : (
                  recurringRules.map((rule) => {
                    const nextDate = rule.next_occurrence
                      ? new Date(rule.next_occurrence).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                      : '—'
                    return (
                      <div
                        key={rule.id}
                        className="rounded-xl bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                              {rule.title}
                            </p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
                              {getRuleDescription(rule.rrule_string)} · Next: {nextDate}
                            </p>
                          </div>
                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => pauseRule(rule.id)}
                              className="text-xs px-3 py-1.5 rounded-lg min-h-[32px]
                                bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 font-medium"
                            >
                              Pause
                            </button>
                            <button
                              onClick={() => deleteRule(rule.id)}
                              className="text-xs px-3 py-1.5 rounded-lg min-h-[32px]
                                bg-red-50 dark:bg-red-500/10 text-red-500 dark:text-red-400 font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create modal */}
      <TaskCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />

      {/* Task detail modal (completed / missed) */}
      <TaskDetailModal
        open={!!detailTask}
        task={detailTask}
        onClose={() => setDetailTask(null)}
      />
    </div>
  )
}
