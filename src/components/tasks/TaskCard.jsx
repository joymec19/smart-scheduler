import { memo, useState } from 'react'
import { motion } from 'framer-motion'
import RescheduleModal from './RescheduleModal'
import DecomposeWizard from '../decomposition/DecomposeWizard'
import ShareFallbackModal from '../share/ShareFallbackModal'
import { trackTaskCompleted } from '../../lib/analytics-tracking'
import { shareTask } from '../../lib/share'
import useTaskStore from '../../stores/useTaskStore'

const CATEGORY_COLORS = {
  learning: 'bg-gradient-to-b from-blue-400 to-blue-500',
  work:     'bg-gradient-to-b from-violet-400 to-violet-600',
  health:   'bg-gradient-to-b from-emerald-400 to-green-500',
  personal: 'bg-gradient-to-b from-pink-400 to-pink-500',
  info:     'bg-gradient-to-b from-amber-400 to-orange-400',
  creative: 'bg-gradient-to-b from-cyan-400 to-cyan-500',
}

const CATEGORY_BADGE = {
  learning: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
  work:     'bg-violet-500/15 text-violet-400 border border-violet-500/25',
  health:   'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25',
  personal: 'bg-pink-500/15 text-pink-400 border border-pink-500/25',
  info:     'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  creative: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25',
}

const CATEGORY_BORDER = {
  learning: 'border-blue-500',
  work:     'border-violet-500',
  health:   'border-emerald-500',
  personal: 'border-pink-500',
  info:     'border-amber-500',
  creative: 'border-cyan-500',
}

const PRIORITY_STYLES = {
  high:   'bg-rose-500/15 text-rose-400 border border-rose-500/25',
  medium: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  low:    'bg-slate-500/15 text-slate-400 border border-slate-500/25',
}

const PRIORITY_DOT = {
  high:   'bg-rose-400',
  medium: 'bg-amber-400',
  low:    'bg-slate-400',
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

// ── SubtaskActionRow ──────────────────────────────────────────────────────────
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
            ? 'bg-gradient-to-br from-emerald-400 to-green-500 border-transparent shadow-sm shadow-emerald-500/30'
            : 'border-gray-300 dark:border-white/20 hover:border-violet-400 active:scale-90'
        }`}
        aria-label={isCompleted ? 'Completed' : 'Mark complete'}
      >
        {isCompleted && <span className="text-white text-[9px] font-bold">✓</span>}
      </button>

      {/* Title */}
      <span className={`flex-1 min-w-0 text-xs leading-snug truncate ${
        isCompleted
          ? 'line-through text-gray-400 dark:text-slate-600'
          : 'text-gray-600 dark:text-slate-300'
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
            className="w-10 text-xs text-center border border-violet-400 rounded-lg px-1 py-0.5 focus:outline-none bg-white dark:bg-[#13131a] dark:text-slate-200"
          />
          <span className="text-[10px] text-slate-400">m</span>
        </div>
      ) : (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); if (!isCompleted) setEditingTime(true) }}
          disabled={isCompleted}
          className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-lg transition-colors ${
            isCompleted
              ? 'text-gray-300 dark:text-slate-700'
              : 'text-slate-400 hover:text-violet-500 hover:bg-violet-500/10'
          }`}
        >
          {formatEstimate(sub.estimated_minutes ?? sub.estimatedMinutes) ?? '—'}
        </button>
      )}
    </div>
  )
}

// ── TaskCard ─────────────────────────────────────────────────────────────────
const TaskCard = memo(function TaskCard({ task, onComplete, onMiss, onTap }) {
  const [rescheduleOpen, setRescheduleOpen] = useState(false)
  const [wizardOpen, setWizardOpen]         = useState(false)
  const [expanded, setExpanded]             = useState(false)
  const [shareModal, setShareModal]         = useState({ open: false, content: null })

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
    {/* Indent wrapper for subtasks */}
    <div className={
      task.is_subtask
        ? `pl-3 border-l-2 ml-3 ${CATEGORY_BORDER[task.category] || 'border-gray-300 dark:border-white/20'}`
        : ''
    }>
    <motion.div
      whileTap={{ scale: 0.99 }}
      className={`
        relative rounded-2xl transition-all cursor-pointer
        glass-card hover:shadow-violet-500/10
        ${overdue ? 'ring-1 ring-amber-400/40' : ''}
        flex flex-col
      `}
      onClick={() => onTap?.(task)}
    >
      <div className="flex items-stretch min-h-[72px]">
        {/* Category gradient stripe */}
        <div className={`w-1 shrink-0 rounded-l-2xl ${CATEGORY_COLORS[task.category] || 'bg-gray-400'}`} />

        <div className="flex-1 p-3 min-w-0">
          {/* Subtask step label */}
          {task.is_subtask && (
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                Step {task.subtask_order} of {siblingCount}
              </span>
              {task.is_blocking && (
                <span className="text-amber-400 text-xs" title="Complete this before next step">
                  🔒
                </span>
              )}
            </div>
          )}

          {/* Title row */}
          <div className="flex items-start justify-between gap-2">
            <h3
              className={`font-semibold text-sm leading-snug truncate ${
                task.status === 'completed'
                  ? 'line-through text-gray-400 dark:text-slate-600'
                  : 'text-gray-900 dark:text-slate-100'
              }`}
            >
              {task.title}
            </h3>
            <div className="flex items-center gap-1 shrink-0">
              {/* Share button */}
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation()
                  shareTask(task, (content) => setShareModal({ open: true, content }))
                }}
                className="text-gray-300 dark:text-slate-600 hover:text-violet-400 dark:hover:text-violet-400 transition-colors p-0.5 rounded-lg hover:bg-violet-500/10"
                aria-label="Share task"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              </button>
              {/* Priority dot */}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${PRIORITY_DOT[task.priority] || 'bg-gray-300'}`} />
              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full capitalize ${PRIORITY_STYLES[task.priority] || ''}`}>
                {task.priority}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${CATEGORY_BADGE[task.category] || 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-slate-400'}`}>
              {task.category}
            </span>
            {estimateLabel && (
              <span className="text-xs text-slate-400">⏱ {estimateLabel}</span>
            )}
            {dueLabel && (
              <span className={`text-xs font-medium ${overdue ? 'text-rose-400' : 'text-slate-400'}`}>
                {overdue ? '⚠ ' : ''}{dueLabel}
              </span>
            )}
            {task.reschedule_count > 0 && (
              <span className="text-xs text-rose-400">↻ {task.reschedule_count}x</span>
            )}
            {task.recurring_rule_id && (
              <span className="text-[10px] text-violet-400" title="Recurring task">🔁</span>
            )}
          </div>

          {/* Subtask accordion */}
          {!task.is_subtask && subtasks.length > 0 && (
            <div className="mt-2">
              <button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v) }}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-300 min-h-[28px] transition-colors"
              >
                <span>{expanded ? '▾' : '▸'}</span>
                <span>{completedSubs.length}/{subtasks.length} steps done</span>
                <div className="flex-1 h-1 bg-gray-100 dark:bg-white/10 rounded-full overflow-hidden ml-1 w-16">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${
                      CATEGORY_COLORS[task.category]?.replace('bg-gradient-to-b', 'bg-gradient-to-r') || 'from-violet-500 to-indigo-500'
                    }`}
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
              className="mt-2 text-xs text-violet-500 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 font-medium transition-colors min-h-[28px]"
            >
              ✂️ Break into subtasks
            </button>
          )}
        </div>
      </div>

      {/* Action buttons — only for pending tasks */}
      {task.status === 'pending' && (
        <div
          className="flex border-t border-gray-100 dark:border-white/10 divide-x divide-gray-100 dark:divide-white/10"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              trackTaskCompleted({ was_overdue: isOverdue(task.due_at) })
              onComplete?.(task.id)
            }}
            className="flex-1 py-2.5 text-xs font-semibold text-emerald-500 hover:bg-emerald-500/10 active:bg-emerald-500/15 transition-colors rounded-bl-2xl min-h-[40px]"
          >
            ✓ Complete
          </button>
          <button
            onClick={() => setRescheduleOpen(true)}
            className="flex-1 py-2.5 text-xs font-semibold text-amber-500 hover:bg-amber-500/10 active:bg-amber-500/15 transition-colors rounded-br-2xl min-h-[40px]"
          >
            ⟳ Reschedule
          </button>
        </div>
      )}
    </motion.div>
    </div>

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

    <ShareFallbackModal
      open={shareModal.open}
      shareContent={shareModal.content}
      onClose={() => setShareModal({ open: false, content: null })}
    />
    </>
  )
})

export default TaskCard
