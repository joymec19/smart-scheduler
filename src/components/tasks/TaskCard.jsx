import { memo, useState, useRef } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import RescheduleModal from './RescheduleModal'
import DecomposeWizard from '../decomposition/DecomposeWizard'
import { trackTaskCompleted } from '../../lib/analytics-tracking'
import useTaskStore from '../../stores/useTaskStore'

const CATEGORY_COLORS = {
  learning: 'bg-blue-500',
  work: 'bg-purple-500',
  health: 'bg-green-500',
  personal: 'bg-pink-500',
  info: 'bg-amber-500',
  creative: 'bg-cyan-500',
}

const CATEGORY_BORDER = {
  learning: 'border-blue-500',
  work:     'border-purple-500',
  health:   'border-green-500',
  personal: 'border-pink-500',
  info:     'border-amber-500',
  creative: 'border-cyan-500',
}

const PRIORITY_STYLES = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-gray-100 text-gray-600',
}

const SWIPE_THRESHOLD = 80

function isOverdue(dueAt) {
  if (!dueAt) return false
  return new Date(dueAt) < new Date()
}

function formatDue(dueAt) {
  if (!dueAt) return null
  const date = new Date(dueAt)
  const now = new Date()
  const diffMs = date - now
  const diffHours = Math.round(diffMs / (1000 * 60 * 60))
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0 && diffHours >= 0) return `${diffHours}h left`
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays === -1) return 'Yesterday'
  if (diffDays < -1) return `${Math.abs(diffDays)}d overdue`
  if (diffDays <= 7) return `${diffDays}d left`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatEstimate(minutes) {
  if (!minutes) return null
  if (minutes < 60) return `${minutes}m`
  return `${Math.round(minutes / 60)}h`
}

const TaskCard = memo(function TaskCard({ task, onComplete, onMiss, onTap }) {
  const x = useMotionValue(0)
  const [swiping, setSwiping]         = useState(null)
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [wizardOpen, setWizardOpen]   = useState(false)
  const [expanded, setExpanded]       = useState(false)
  const containerRef = useRef(null)

  // Derive subtasks from the store (avoids extra Supabase calls)
  const { tasks: allTasks } = useTaskStore()
  const subtasks          = allTasks.filter((t) => t.parent_task_id === task.id && t.is_subtask)
  const completedSubs     = subtasks.filter((t) => t.status === 'completed')
  // Sibling count — needed when this card IS a subtask
  const siblingCount      = task.is_subtask
    ? allTasks.filter((t) => t.parent_task_id === task.parent_task_id && t.is_subtask).length
    : 0

  const bgColor = useTransform(x, [-120, -SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD, 120], [
    'rgba(245, 158, 11, 0.3)',
    'rgba(245, 158, 11, 0.2)',
    'rgba(0,0,0,0)',
    'rgba(34, 197, 94, 0.2)',
    'rgba(34, 197, 94, 0.3)',
  ])

  const overdue         = task.status === 'pending' && isOverdue(task.due_at)
  const dueLabel        = formatDue(task.due_at)
  const estimateLabel   = formatEstimate(task.estimated_minutes)
  const rescheduleCount = task.reschedule_count || 0

  function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD && task.status === 'pending') {
      trackTaskCompleted({ was_overdue: isOverdue(task.due_at) })
      onComplete?.(task.id)
    } else if (info.offset.x < -SWIPE_THRESHOLD && task.status === 'pending') {
      setRescheduleOpen(true)
    }
    setSwiping(null)
  }

  function handleDrag(_, info) {
    if (info.offset.x > 30) setSwiping('complete')
    else if (info.offset.x < -30) setSwiping('miss')
    else setSwiping(null)
  }

  return (
    <>
    {/* Indent wrapper only applied when this card is a subtask */}
    <div className={
      task.is_subtask
        ? `pl-3 border-l-2 ml-3 ${CATEGORY_BORDER[task.category] || 'border-gray-300'}`
        : ''
    }>
    <motion.div
      ref={containerRef}
      style={{ backgroundColor: bgColor }}
      className="relative rounded-xl overflow-hidden"
    >
      {/* Swipe hints */}
      {swiping === 'complete' && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500 font-semibold text-sm">
          Complete
        </div>
      )}
      {swiping === 'miss' && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500 font-semibold text-sm">
          Reschedule
        </div>
      )}

      <motion.div
        style={{ x }}
        drag={task.status === 'pending' ? 'x' : false}
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.1}
        whileHover={{ scale: 1.01 }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        onTap={() => onTap?.(task)}
        className={`
          relative rounded-xl shadow-sm hover:shadow-md transition-all
          bg-white flex items-stretch min-h-[72px] cursor-pointer
          ${overdue ? 'ring-1 ring-amber-300' : ''}
        `}
      >
        {/* Category color stripe */}
        <div className={`w-1.5 shrink-0 rounded-l-xl ${CATEGORY_COLORS[task.category] || 'bg-gray-400'}`} />

        <div className="flex-1 p-3 min-w-0">
          {/* Subtask step label — only visible when this card IS a subtask */}
          {task.is_subtask && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
                Step {task.subtask_order} of {siblingCount}
              </span>
              {task.is_blocking && (
                <span className="text-amber-500 text-xs" title="Complete this before next step">
                  🔒
                </span>
              )}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-medium text-sm leading-snug truncate ${
                task.status === 'completed' ? 'line-through text-gray-400' : 'text-gray-900'
              }`}
            >
              {task.title}
            </h3>
            <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${PRIORITY_STYLES[task.priority] || ''}`}>
              {task.priority}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-500">
            <span className="capitalize">{task.category}</span>
            {estimateLabel && (
              <>
                <span className="text-gray-300">|</span>
                <span>{estimateLabel}</span>
              </>
            )}
            {dueLabel && (
              <>
                <span className="text-gray-300">|</span>
                <span className={overdue ? 'text-amber-600 font-medium' : ''}>
                  {dueLabel}
                </span>
              </>
            )}
            {task.reschedule_count > 0 && (
              <>
                <span className="text-gray-300">|</span>
                <span className="text-red-400">rescheduled {task.reschedule_count}x</span>
              </>
            )}
          </div>

          {/* Subtask accordion — visible on parent tasks that have subtasks */}
          {!task.is_subtask && subtasks.length > 0 && (
            <div className="mt-2">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
                className="flex items-center gap-1.5 text-xs text-gray-500 min-h-[28px]"
              >
                <span>{expanded ? '▾' : '▸'}</span>
                <span>{completedSubs.length}/{subtasks.length} steps done</span>
                <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden ml-1 w-16">
                  <div
                    className={`h-full rounded-full ${CATEGORY_COLORS[task.category] || 'bg-gray-400'}`}
                    style={{
                      width: `${subtasks.length
                        ? Math.round((completedSubs.length / subtasks.length) * 100)
                        : 0}%`,
                    }}
                  />
                </div>
              </button>

              {expanded && (
                <div className="mt-1.5 space-y-1 pl-1">
                  {[...subtasks]
                    .sort((a, b) => (a.subtask_order || 0) - (b.subtask_order || 0))
                    .map((sub) => (
                      <div key={sub.id} className="flex items-center gap-1.5 text-xs text-gray-500">
                        <span className={sub.status === 'completed' ? 'text-green-500' : 'text-gray-300'}>
                          {sub.status === 'completed' ? '✓' : '○'}
                        </span>
                        <span className={sub.status === 'completed' ? 'line-through text-gray-400' : ''}>
                          {sub.title}
                        </span>
                        {sub.is_blocking && (
                          <span className="text-amber-400 text-[10px]">🔒</span>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}

          {/* "Break into subtasks" — visible only on non-subtask pending tasks
               with reschedule_count < 3 and no existing subtasks */}
          {!task.is_subtask && rescheduleCount < 3 && subtasks.length === 0 && task.status === 'pending' && (
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => { e.stopPropagation(); setWizardOpen(true) }}
              className="mt-2 text-xs text-purple-500 hover:text-purple-700 font-medium transition-colors min-h-[28px]"
            >
              ✂️ Break into subtasks
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
    </div>{/* /indent wrapper */}

    <RescheduleModal
      open={rescheduleOpen}
      task={task}
      onClose={() => setRescheduleOpen(false)}
      onMiss={onMiss}
    />

    <DecomposeWizard
      open={wizardOpen}
      task={task}
      onClose={() => setWizardOpen(false)}
    />
    </>
  )
})

export default TaskCard
