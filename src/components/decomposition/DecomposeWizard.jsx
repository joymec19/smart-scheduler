// DecomposeWizard.jsx — 3-step modal for task decomposition
// Triggered from RescheduleModal (reschedule_count >= 3) or TaskCard direct button.

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { TEMPLATES } from '../../lib/decomposition-templates'
import { generateSubtasks, saveSubtasks } from '../../lib/decomposition-engine'
import { getPatternSuggestion } from '../../lib/decomposition-suggestions'
import useTaskStore from '../../stores/useTaskStore'
import SubtaskTimeline from './SubtaskTimeline'

// ── Design system maps ─────────────────────────────────────────────────────────
const CATEGORY_BG = {
  learning: 'bg-blue-500',
  work:     'bg-purple-500',
  health:   'bg-green-500',
  personal: 'bg-pink-500',
  info:     'bg-amber-500',
  creative: 'bg-cyan-500',
}

const CATEGORY_PLACEHOLDER = {
  learning: 'e.g., finish reading chapter 3 and write a summary…',
  work:     'e.g., deliver a 5-slide deck by Friday…',
  health:   'e.g., 30-min gym session + meal prep…',
  personal: 'e.g., buy a birthday gift and ship it…',
  info:     'e.g., collect 5 sources and write a 1-page brief…',
  creative: 'e.g., write a 500-word blog post on productivity…',
}

const GRANULARITY = [
  { value: 'fewer_steps', label: 'Fewer steps' },
  { value: 'balanced',    label: 'Balanced'    },
  { value: 'more_detail', label: 'More detail' },
]

// ── Framer Motion slide variants ───────────────────────────────────────────────
const slide = {
  enter:  (dir) => ({ x: dir > 0 ? 280 : -280, opacity: 0 }),
  center:          { x: 0, opacity: 1 },
  exit:   (dir) => ({ x: dir < 0 ? 280 : -280, opacity: 0 }),
}

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmtMin(min) {
  if (!min) return '—'
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h ${m}m` : `${h}h`
}

function firstScheduledTime(task) {
  const base = task?.due_at ? new Date(task.due_at) : (() => {
    const d = new Date()
    d.setDate(d.getDate() + 1)
    d.setHours(9, 0, 0, 0)
    return d
  })()
  return base.toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
  })
}

// ── SubtaskRow — editable row used in Step 2 ──────────────────────────────────
function SubtaskRow({ sub, idx, total, category, onUpdate, onDelete, onMove }) {
  const [editingTitle, setEditingTitle] = useState(false)
  const stripe = CATEGORY_BG[category] || 'bg-gray-400'

  return (
    <div className="flex items-center gap-2 bg-white border border-gray-100 rounded-xl p-2.5">
      {/* Category stripe */}
      <div className={`w-1 self-stretch rounded-full shrink-0 ${stripe}`} />

      {/* Up / down reorder */}
      <div className="flex flex-col gap-0.5 shrink-0">
        <button
          onClick={() => onMove(idx, -1)}
          disabled={idx === 0}
          className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-[10px] leading-none min-h-[22px] px-1"
          aria-label="Move up"
        >▲</button>
        <button
          onClick={() => onMove(idx, 1)}
          disabled={idx === total - 1}
          className="text-gray-300 hover:text-gray-500 disabled:opacity-20 text-[10px] leading-none min-h-[22px] px-1"
          aria-label="Move down"
        >▼</button>
      </div>

      {/* Inline-editable title */}
      <div className="flex-1 min-w-0">
        {editingTitle ? (
          <input
            autoFocus
            value={sub.title}
            onChange={(e) => onUpdate(sub.id, 'title', e.target.value)}
            onBlur={() => setEditingTitle(false)}
            onKeyDown={(e) => e.key === 'Enter' && setEditingTitle(false)}
            className="w-full text-sm border-b border-purple-400 focus:outline-none bg-transparent"
          />
        ) : (
          <p
            className="text-sm text-gray-800 truncate cursor-pointer hover:text-purple-600 transition-colors"
            onClick={() => setEditingTitle(true)}
            title="Click to edit"
          >
            {sub.title}
          </p>
        )}
      </div>

      {/* Estimated minutes */}
      <input
        type="number"
        min={5}
        max={240}
        value={sub.estimatedMinutes}
        onChange={(e) => onUpdate(sub.id, 'estimatedMinutes', Math.max(5, Number(e.target.value)))}
        className="w-11 text-xs text-center border border-gray-200 rounded-lg py-1 focus:outline-none focus:border-purple-400 min-h-[30px]"
        aria-label="Estimated minutes"
      />
      <span className="text-xs text-gray-400 shrink-0">m</span>

      {/* Blocking toggle */}
      <button
        onClick={() => onUpdate(sub.id, 'isBlocking', !sub.isBlocking)}
        title={sub.isBlocking ? 'Blocking — tap to toggle' : 'Not blocking — tap to toggle'}
        className={`shrink-0 text-base leading-none min-h-[30px] min-w-[24px] transition-opacity ${
          sub.isBlocking ? 'opacity-100' : 'opacity-20 hover:opacity-50'
        }`}
      >🔒</button>

      {/* Delete */}
      <button
        onClick={() => onDelete(sub.id)}
        className="shrink-0 text-gray-300 hover:text-red-400 transition-colors text-base leading-none min-h-[30px] min-w-[24px]"
        aria-label="Delete step"
      >✕</button>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function DecomposeWizard({ open, task, onClose }) {
  const navigate      = useNavigate()
  const { fetchTasks } = useTaskStore()
  const answerRef     = useRef(null)

  const [step,            setStep]            = useState(1)
  const [dir,             setDir]             = useState(1)
  const [answer,          setAnswer]          = useState('')
  const [patternHint,     setPatternHint]     = useState(null)
  const [granularity,     setGranularity]     = useState('balanced')
  const [subtasks,        setSubtasks]        = useState([])
  const [loadingSteps,    setLoadingSteps]    = useState(false)
  const [saving,          setSaving]          = useState(false)
  const [savedSubtasks,   setSavedSubtasks]   = useState([])

  const template           = task ? (TEMPLATES[task.category] ?? TEMPLATES.work) : null
  const clarifyingQuestion = template?.clarifyingQuestion ?? 'What does completing this task mean?'
  const placeholder        = CATEGORY_PLACEHOLDER[task?.category] ?? 'Describe what done looks like…'
  const totalEstimate      = subtasks.reduce((s, t) => s + (t.estimatedMinutes || 0), 0)
  // Lock non-selected granularity once subtasks have been generated
  const granularityLocked  = !loadingSteps && subtasks.length > 0

  // Reset state and fetch pattern hint when wizard opens
  useEffect(() => {
    if (!open || !task) return
    setStep(1)
    setDir(1)
    setAnswer('')
    setGranularity('balanced')
    setSubtasks([])
    setSavedSubtasks([])
    setPatternHint(null)

    if (task.user_id) {
      getPatternSuggestion(task.user_id, task.category)
        .then(setPatternHint)
        .catch(() => {})
    }

    setTimeout(() => answerRef.current?.focus(), 250)
  }, [open, task?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Subtask generation ───────────────────────────────────────────────────────
  async function loadSubtasks(gran = granularity) {
    setLoadingSteps(true)
    try {
      const granPref = gran === 'balanced' ? undefined : gran
      const generated = await generateSubtasks(task, answer, { granularity_preference: granPref })
      setSubtasks(
        generated.map((s, i) => ({
          ...s,
          id: `step-${i}-${Date.now()}`,
        }))
      )
    } catch (e) {
      toast.error('Failed to generate steps')
      console.error('[DecomposeWizard] generateSubtasks:', e)
    } finally {
      setLoadingSteps(false)
    }
  }

  // ── Navigation ───────────────────────────────────────────────────────────────
  async function goStep2() {
    setDir(1)
    setStep(2)
    await loadSubtasks(granularity)
  }

  function goBack() {
    setDir(-1)
    setStep((s) => s - 1)
  }

  // ── Save subtasks ────────────────────────────────────────────────────────────
  async function handleSave() {
    setSaving(true)
    try {
      const ordered = subtasks.map((s, i) => ({ ...s, order: i + 1 }))
      const { subtasks: created } = await saveSubtasks(
        task.id,
        ordered,
        null,
        { question: clarifyingQuestion, answer },
      )
      setSavedSubtasks(created ?? subtasks)
      if (task.user_id) await fetchTasks(task.user_id)
      setDir(1)
      setStep(3)
    } catch (e) {
      toast.error('Failed to save subtasks')
      console.error('[DecomposeWizard] saveSubtasks:', e)
    } finally {
      setSaving(false)
    }
  }

  function handleDone() {
    onClose()
    navigate('/tasks')
  }

  // ── Subtask list helpers ─────────────────────────────────────────────────────
  function updateSubtask(id, field, value) {
    setSubtasks((prev) => prev.map((s) => s.id === id ? { ...s, [field]: value } : s))
  }

  function deleteSubtask(id) {
    setSubtasks((prev) => prev.filter((s) => s.id !== id))
  }

  function addSubtask() {
    setSubtasks((prev) => [
      ...prev,
      {
        id:               `step-custom-${Date.now()}`,
        title:            'New step',
        estimatedMinutes: 15,
        isBlocking:       false,
        category:         task?.category ?? 'work',
        order:            prev.length + 1,
      },
    ])
  }

  function moveSubtask(idx, delta) {
    setSubtasks((prev) => {
      const next   = [...prev]
      const target = idx + delta
      if (target < 0 || target >= next.length) return next
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }

  if (!task) return null

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="dw-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal card */}
          <motion.div
            key="dw-modal"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{    opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl z-50 max-w-lg mx-auto overflow-hidden max-h-[88vh] flex flex-col"
          >
            {/* Progress bar */}
            <div className="h-1 bg-gray-100">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-violet-600"
                animate={{ width: `${(step / 3) * 100}%` }}
                transition={{ ease: 'easeInOut', duration: 0.35 }}
              />
            </div>

            {/* Header row */}
            <div className="flex items-center justify-between px-5 pt-4">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">
                Step {step} of 3
              </span>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >✕</button>
            </div>

            {/* ── Animated step panels ── */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              <AnimatePresence custom={dir} mode="wait">

                {/* ─── STEP 1 — Clarifying question ─── */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="px-5 pt-3 pb-7"
                  >
                    <h2 className="text-lg font-bold text-gray-800">
                      Let me understand this better…
                    </h2>
                    <p className="text-sm text-gray-500 mt-0.5 truncate">"{task.title}"</p>

                    {/* Pattern hint card */}
                    {patternHint?.hasSuggestion && (
                      <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                        <span className="text-blue-500 shrink-0 mt-0.5">💡</span>
                        <p className="text-blue-700 text-sm leading-snug">
                          {patternHint.suggestionText}
                        </p>
                      </div>
                    )}

                    {/* Question + textarea */}
                    <div className="mt-4">
                      <label className="text-sm font-medium text-gray-700">
                        {clarifyingQuestion}
                      </label>
                      <textarea
                        ref={answerRef}
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        placeholder={placeholder}
                        rows={3}
                        className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1">
                        {answer.length < 10
                          ? `${10 - answer.length} more chars needed`
                          : '✓ Ready to continue'}
                      </p>
                    </div>

                    <button
                      onClick={goStep2}
                      disabled={answer.length <= 10}
                      className="mt-5 w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3.5 rounded-xl disabled:opacity-40 active:scale-95 transition-transform min-h-[44px]"
                    >
                      Continue →
                    </button>
                  </motion.div>
                )}

                {/* ─── STEP 2 — Proposed breakdown ─── */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="px-5 pt-3 pb-5 flex flex-col flex-1 min-h-0"
                  >
                    <h2 className="text-lg font-bold text-gray-800 shrink-0">Proposed Breakdown</h2>

                    {/* Granularity toggle — locked once subtasks are generated */}
                    <div className="mt-3 shrink-0 flex bg-gray-100 rounded-xl p-1 gap-1">
                      {GRANULARITY.map((opt) => {
                        const isSelected = granularity === opt.value
                        const isLocked   = granularityLocked && !isSelected
                        return (
                          <button
                            key={opt.value}
                            disabled={loadingSteps || isLocked}
                            onClick={() => {
                              setGranularity(opt.value)
                              loadSubtasks(opt.value)
                            }}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all min-h-[32px] ${
                              isSelected
                                ? 'bg-white text-purple-600 shadow-sm'
                                : isLocked
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                          >
                            {opt.label}
                          </button>
                        )
                      })}
                    </div>

                    {/* Inline pattern hint */}
                    {patternHint?.hasSuggestion && (
                      <div className="mt-3 shrink-0 bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                        <span className="text-blue-500 shrink-0 mt-0.5 text-sm">💡</span>
                        <p className="text-blue-700 text-xs leading-snug">
                          {patternHint.suggestionText}
                        </p>
                      </div>
                    )}

                    {/* Subtask list */}
                    {loadingSteps ? (
                      <div className="mt-4 flex-1 flex items-center justify-center gap-2 text-gray-400 text-sm">
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        Generating steps…
                      </div>
                    ) : (
                      <div className="mt-3 flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5">
                        {subtasks.map((sub, idx) => (
                          <SubtaskRow
                            key={sub.id}
                            sub={sub}
                            idx={idx}
                            total={subtasks.length}
                            category={task.category}
                            onUpdate={updateSubtask}
                            onDelete={deleteSubtask}
                            onMove={moveSubtask}
                          />
                        ))}

                        <button
                          onClick={addSubtask}
                          className="w-full border border-dashed border-gray-300 text-gray-500 text-sm py-2.5 rounded-xl hover:border-purple-400 hover:text-purple-500 transition-colors min-h-[44px]"
                        >
                          + Add step
                        </button>
                      </div>
                    )}

                    {/* Time summary */}
                    <div className="mt-3 shrink-0 flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2">
                      <span>
                        Total: <strong>{fmtMin(totalEstimate)}</strong>
                      </span>
                      {task.estimated_minutes > 0 && (
                        <span>Original: {fmtMin(task.estimated_minutes)}</span>
                      )}
                    </div>

                    {/* CTA row */}
                    <div className="mt-4 shrink-0 flex gap-2">
                      <button
                        onClick={goBack}
                        className="flex-1 bg-gray-100 text-gray-600 font-medium py-3 rounded-xl active:scale-95 transition-transform text-sm min-h-[44px]"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={saving || loadingSteps || subtasks.length === 0}
                        className="flex-[2] bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3 rounded-xl disabled:opacity-50 active:scale-95 transition-transform text-sm min-h-[44px]"
                      >
                        {saving ? 'Saving…' : 'Looks good, create subtasks'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ─── STEP 3 — Confirmation ─── */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    custom={dir}
                    variants={slide}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    className="px-5 pt-3 pb-7"
                  >
                    {/* Success header */}
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-2xl">✅</span>
                      </div>
                      <h2 className="text-lg font-bold text-gray-800 mt-3 leading-snug">
                        {task.title}
                      </h2>
                      <p className="text-sm text-green-600 font-medium mt-1">
                        Decomposed into {(savedSubtasks.length || subtasks.length)} steps
                      </p>
                    </div>

                    {/* Subtask timeline */}
                    <div className="mt-5 max-h-[40vh] overflow-y-auto">
                      <SubtaskTimeline
                        subtasks={savedSubtasks.length ? savedSubtasks : subtasks}
                        category={task.category}
                      />
                    </div>

                    {/* Auto-schedule info */}
                    <div className="mt-4 bg-purple-50 border border-purple-100 rounded-xl px-3 py-2.5 text-purple-700 text-sm">
                      📅 First step scheduled for{' '}
                      <strong>{firstScheduledTime(task)}</strong>
                    </div>

                    <button
                      onClick={handleDone}
                      className="mt-5 w-full bg-gradient-to-r from-purple-500 to-violet-600 text-white font-semibold py-3.5 rounded-xl active:scale-95 transition-transform min-h-[44px]"
                    >
                      Done
                    </button>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
