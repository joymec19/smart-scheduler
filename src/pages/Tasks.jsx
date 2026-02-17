import { useEffect, useState } from 'react'
import useTaskStore from '../stores/useTaskStore'
import { useAuth } from '../hooks/useAuth'
import TaskList from '../components/tasks/TaskList'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import { motion } from 'framer-motion'

export default function Tasks() {
  const { user } = useAuth()
  const { tasks, loading, fetchTasks, addTask, markComplete, markMissed, getCounts } = useTaskStore()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('pending')

  useEffect(() => {
    if (user?.id) {
      fetchTasks(user.id)
    }
  }, [user?.id, fetchTasks])

  const counts = getCounts()

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
    <div className="p-4 pb-24 min-h-screen flex flex-col gap-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-violet-600 bg-clip-text text-transparent">
          Tasks
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Swipe right to complete, left to miss
        </p>
      </div>

      {/* Task list */}
      <TaskList
        tasks={tasks}
        counts={counts}
        loading={loading}
        onComplete={handleComplete}
        onMiss={handleMiss}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* FAB — only on Pending tab */}
      {activeTab === 'pending' && (
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setModalOpen(true)}
          className="fixed bottom-20 right-4 w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full shadow-lg flex items-center justify-center text-2xl z-40"
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
