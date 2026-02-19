// SubtaskTimeline.jsx — vertical timeline for subtask chains
// Used in DecomposeWizard Step 3 and TaskCard expanded view.

const COLORS = {
  learning: { dot: 'bg-blue-500',    line: 'bg-blue-200',    text: 'text-blue-600'   },
  work:     { dot: 'bg-purple-500',  line: 'bg-purple-200',  text: 'text-purple-600' },
  health:   { dot: 'bg-green-500',   line: 'bg-green-200',   text: 'text-green-600'  },
  personal: { dot: 'bg-pink-500',    line: 'bg-pink-200',    text: 'text-pink-600'   },
  info:     { dot: 'bg-amber-500',   line: 'bg-amber-200',   text: 'text-amber-600'  },
  creative: { dot: 'bg-cyan-500',    line: 'bg-cyan-200',    text: 'text-cyan-600'   },
}

function formatMinutes(minutes) {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

/**
 * SubtaskTimeline
 *
 * @param {Array}  subtasks  — array of subtask objects (from DB or generateSubtasks output)
 * @param {string} category  — parent task category for color theming
 */
export default function SubtaskTimeline({ subtasks = [], category = 'work' }) {
  const colors = COLORS[category] || COLORS.work

  return (
    <div className="space-y-0">
      {subtasks.map((sub, idx) => {
        const isLast      = idx === subtasks.length - 1
        // Support both DB field names (is_blocking) and engine output (isBlocking)
        const isBlocking  = sub.is_blocking ?? sub.isBlocking ?? false
        const isCompleted = sub.status === 'completed'
        const isMissed    = sub.status === 'missed'
        // blockedBy is set by getDependencyChain; canStart===false means blocked
        const isBlocked   = Array.isArray(sub.blockedBy)
          ? sub.blockedBy.length > 0
          : sub.canStart === false

        return (
          <div key={sub.id ?? idx} className="flex gap-3 min-w-0">
            {/* ── Timeline rail ── */}
            <div className="flex flex-col items-center shrink-0">
              {/* Node dot */}
              <div
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center border-2
                  ${isCompleted
                    ? 'bg-green-500 border-green-500'
                    : isBlocked
                    ? 'bg-gray-100 border-gray-300'
                    : `${colors.dot} border-transparent`}
                `}
              >
                {isCompleted ? (
                  <span className="text-white text-xs font-bold">✓</span>
                ) : isBlocked ? (
                  <span className="text-gray-400 text-xs">🔒</span>
                ) : (
                  <span className="text-white text-xs font-bold">{idx + 1}</span>
                )}
              </div>

              {/* Connecting line */}
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 min-h-[20px] mt-1 ${
                    isBlocking ? colors.line : 'bg-gray-100'
                  }`}
                />
              )}
            </div>

            {/* ── Content ── */}
            <div className={`flex-1 min-w-0 ${isLast ? 'pb-0' : 'pb-4'}`}>
              <div className="flex items-start justify-between gap-2">
                <p
                  className={`text-sm font-medium leading-snug ${
                    isCompleted
                      ? 'line-through text-gray-400'
                      : isBlocked
                      ? 'text-gray-400'
                      : 'text-gray-800'
                  }`}
                >
                  {sub.title}
                  {isBlocked && (
                    <span className="ml-1 text-xs text-gray-400 font-normal">(blocked)</span>
                  )}
                </p>

                {/* Lock icon on blocking steps that connect to a next step */}
                {isBlocking && !isLast && !isCompleted && (
                  <span
                    className="shrink-0 text-amber-500 text-sm leading-none mt-0.5"
                    title="Complete this before next step"
                  >
                    🔒
                  </span>
                )}
              </div>

              {/* Meta: time + status badge */}
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400">
                  {formatMinutes(sub.estimatedMinutes ?? sub.estimated_minutes)}
                </span>
                {isCompleted && (
                  <span className="text-xs text-green-500 font-medium">Done</span>
                )}
                {isMissed && (
                  <span className="text-xs text-red-400 font-medium">Missed</span>
                )}
                {isBlocked && !isCompleted && (
                  <span className="text-xs text-gray-400">Waiting…</span>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
