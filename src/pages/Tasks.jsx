import { useEffect, useState } from 'react'
import useTaskStore from '../stores/useTaskStore'
import { useAuth } from '../hooks/useAuth'
import TaskList from '../components/tasks/TaskList'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import { motion } from 'framer-motion'

export default function Tasks() {
  const { user } = useAuth()
  const { tasks, loading, error, fetchTasks, addTask, markComplete, markMissed } = useTaskStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id)
    }
  }, [user?.id, fetchTasks])

  // Exclude subtasks from the top-level list — they're grouped under their parent
  const parentTasks = tasks.filter((t) => !t.is_subtask)
  const parentCounts = {
    pending:   parentTasks.filter((t) => t.status === 'pending').length,
    completed: parentTasks.filter((t) => t.status === 'completed').length,
    missed:    parentTasks.filter((t) => t.status === 'missed').length,
  }

  async function handleCreate(data) {
    await addTask({
      ...data,
      user_id: user.id,
      status: 'pending',
      due_at: data.due_at ? new Date(data.due_at).toISOString() : null,
    })
  }

  async function handleComplete(id) {
    await markComplete(id, null)
  }

  async function handleMiss(id) {
    await markMissed(id)
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

      {/* Create modal */}
      <TaskCreateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreate}
      />
    </div>
  )
}
