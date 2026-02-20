import { memo, useState } from 'react'
import { motion } from 'framer-motion'
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

// ── SubtaskActionRow — circle checkbox + tappable time edit ────────────────────
function SubtaskActionRow({ sub, onComplete }) {
  const { updateTask } = useTaskStore()
  const [editingTime, setEditingTime] = useState(false)
  const [timeVal, setTimeVal] = useState(sub.estimated_minutes ?? sub.estimatedMinutes ?? 15)
  const isCompleted = sub.status === 'completed'

  function handleTimeSubmit() {
    const mins = Math.max(1, Number(timeVal))
    updateTask(sub.id, { estimated_minutes: mins })
    setTimeVal(mins)
    setEditingTime(false)
  }

  return (
    <div className="flex items-center gap-2 py-1">
      {/* Circle checkbox */}
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); if (!isCompleted) onComplete(sub.id) }}
        disabled={isCompleted}
        className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
          isCompleted
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-purple-400 active:scale-90'
        }`}
        aria-label={isCompleted ? 'Completed' : 'Mark complete'}
      >
        {isCompleted && <span className="text-white text-[9px] font-bold">✓</span>}
      </button>

      {/* Title */}
      <span className={`flex-1 min-w-0 text-xs leading-snug truncate ${
        isCompleted ? 'line-through text-gray-400' : 'text-gray-600'
      }`}>
        {sub.title}
        {sub.is_blocking && !isCompleted && (
          <span className="ml-1 text-amber-400 text-[10px]">🔒</span>
        )}
      </span>

      {/* Tappable time label / inline editor */}
      {editingTime ? (
        <div
          className="flex items-center gap-0.5 shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <input
            autoFocus
            type="number"
            min={1}
            max={480}
            value={timeVal}
            onChange={(e) => setTimeVal(e.target.value)}
            onBlur={handleTimeSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTimeSubmit()
              if (e.key === 'Escape') setEditingTime(false)
            }}
            className="w-10 text-xs text-center border border-purple-400 rounded px-1 py-0.5 focus:outline-none"
          />
          <span className="text-[10px] text-gray-400">m</span>
        </div>
      ) : (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); if (!isCompleted) setEditingTime(true) }}
          disabled={isCompleted}
          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-lg transition-colors ${
            isCompleted
              ? 'text-gray-300'
              : 'text-gray-400 hover:text-purple-500 hover:bg-purple-50'
          }`}
        >
          {formatEstimate(sub.estimated_minutes ?? sub.estimatedMinutes) ?? '—'}
        </button>
      )}
    </div>
  )
}

// ── TaskCard ───────────────────────────────────────────────────────────────────
const TaskCard = memo(function TaskCard({ task, onComplete, onMiss, onTap }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [wizardOpen, setWizardOpen]   = useState(false)
  const [expanded, setExpanded]       = useState(false)

  const { tasks: allTasks, markComplete: markSubtaskComplete } = useTaskStore()
  const subtasks      = allTasks.filter((t) => t.parent_task_id === task.id && t.is_subtask)
  const completedSubs = subtasks.filter((t) => t.status === 'completed')
  const siblingCount  = task.is_subtask
    ? allTasks.filter((t) => t.parent_task_id === task.parent_task_id && t.is_subtask).length
    : 0

  const overdue         = task.status === 'pending' && isOverdue(task.due_at)
  const dueLabel        = formatDue(task.due_at)
  const estimateLabel   = formatEstimate(task.estimated_minutes)
  const rescheduleCount = task.reschedule_count || 0

  async function handleSubtaskComplete(subtaskId) {
    await markSubtaskComplete(subtaskId, null)
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
      whileTap={{ scale: 0.99 }}
      className={`
        relative rounded-xl shadow-sm hover:shadow-md transition-all
        bg-white flex flex-col cursor-pointer
        ${overdue ? 'ring-1 ring-amber-300' : ''}
      `}
      onClick={() => onTap?.(task)}
    >
      <div className="flex items-stretch min-h-[72px]">
        {/* Category color stripe */}
        <div className={`w-1.5 shrink-0 rounded-l-xl ${CATEGORY_COLORS[task.category] || 'bg-gray-400'}`} />

        <div className="flex-1 p-3 min-w-0">
          {/* Subtask step label */}
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

          {/* Subtask accordion */}
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
                <div className="mt-1.5 space-y-0.5 pl-1">
                  {[...subtasks]
                    .sort((a, b) => (a.subtask_order || 0) - (b.subtask_order || 0))
                    .map((sub) => (
                      <SubtaskActionRow
                        key={sub.id}
                        sub={sub}
                        onComplete={handleSubtaskComplete}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* "Break into subtasks" */}
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
      </div>

      {/* Action buttons — only for pending tasks */}
      {task.status === 'pending' && (
        <div
          className="flex border-t border-gray-100 divide-x divide-gray-100"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              trackTaskCompleted({ was_overdue: isOverdue(task.due_at) })
              onComplete?.(task.id)
            }}
            className="flex-1 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 active:bg-green-100 transition-colors rounded-bl-xl min-h-[40px]"
          >
            ✓ Complete
          </button>
          <button
            onClick={() => setRescheduleOpen(true)}
            className="flex-1 py-2.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 active:bg-amber-100 transition-colors rounded-br-xl min-h-[40px]"
          >
            ⟳ Reschedule
          </button>
        </div>
      )}
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
