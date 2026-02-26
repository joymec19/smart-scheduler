import { useState } from 'react'

const PATTERN_CHIPS = [
  { key: 'DAILY',          label: 'Every day' },
  { key: 'ALTERNATE',      label: 'Every other day' },
  { key: 'THREE_PER_WEEK', label: '3× per week' },
  { key: 'SPECIFIC_DAY',   label: 'Specific day' },
]

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function getPreviewText(pattern, specificDay, dueTime) {
  const timeLabel = (() => {
    const [h, m] = (dueTime || '09:00').split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0)
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  })()
  switch (pattern) {
    case 'DAILY':          return `Creates tasks every day at ${timeLabel}`
    case 'ALTERNATE':      return `Creates tasks every other day at ${timeLabel}`
    case 'THREE_PER_WEEK': return `Creates tasks Mon, Wed & Fri at ${timeLabel}`
    case 'SPECIFIC_DAY':
      return specificDay != null
        ? `Creates tasks every ${DAY_LABELS[specificDay]} at ${timeLabel}`
        : 'Pick a day below'
    default: return ''
  }
}

/**
 * Props:
 *   value    — null | { pattern, specificDay, dueTime }
 *   onChange — (value) => void
 */
export default function RecurrenceSelector({ value, onChange }) {
  const [enabled,     setEnabled]     = useState(false)
  const [pattern,     setPattern]     = useState('DAILY')
  const [specificDay, setSpecificDay] = useState(1)   // Mon
  const [dueTime,     setDueTime]     = useState('09:00')

  function toggle() {
    const next = !enabled
    setEnabled(next)
    onChange(next ? { pattern, specificDay, dueTime } : null)
  }

  function selectPattern(key) {
    setPattern(key)
    if (enabled) onChange({ pattern: key, specificDay, dueTime })
  }

  function selectDay(idx) {
    setSpecificDay(idx)
    if (enabled) onChange({ pattern, specificDay: idx, dueTime })
  }

  function updateTime(t) {
    setDueTime(t)
    if (enabled) onChange({ pattern, specificDay, dueTime: t })
  }

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 overflow-hidden">
      {/* Toggle header */}
      <button
        type="button"
        onClick={toggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-white/5 min-h-[44px]"
      >
        <span className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
          🔁 Make this recurring?
        </span>
        {/* Toggle pill */}
        <span className={`relative w-10 h-5 rounded-full transition-colors ${
          enabled ? 'bg-violet-500' : 'bg-gray-200 dark:bg-white/10'
        }`}>
          <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${
            enabled ? 'translate-x-5' : 'translate-x-0.5'
          }`} />
        </span>
      </button>

      {/* Expanded options */}
      {enabled && (
        <div className="px-4 py-3 flex flex-col gap-3 bg-white dark:bg-gray-900/50">
          {/* Pattern chips */}
          <div className="grid grid-cols-2 gap-2">
            {PATTERN_CHIPS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => selectPattern(key)}
                className={`py-2 text-xs font-semibold rounded-xl min-h-[44px] transition-all ${
                  pattern === key
                    ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-slate-400 border border-transparent dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Day picker (SPECIFIC_DAY only) */}
          {pattern === 'SPECIFIC_DAY' && (
            <div className="flex gap-1">
              {DAY_LABELS.map((day, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => selectDay(idx)}
                  className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg min-h-[36px] transition-all ${
                    specificDay === idx
                      ? 'bg-violet-500 text-white'
                      : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-slate-400'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          )}

          {/* Time picker */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-slate-400 shrink-0">Daily at</span>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => updateTime(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-white/10 text-sm min-h-[44px]
                bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-violet-500/50"
            />
          </div>

          {/* Preview */}
          <p className="text-xs font-medium text-violet-500 dark:text-violet-400">
            {getPreviewText(pattern, specificDay, dueTime)}
          </p>
          <p className="text-[10px] text-gray-400 dark:text-slate-600">
            Pause anytime from the Recurring Rules section on the Tasks page
          </p>
        </div>
      )}
    </div>
  )
}
