const CATEGORY_COLORS = {
  learning: '#3b82f6',
  work: '#a855f7',
  health: '#22c55e',
  personal: '#ec4899',
  info: '#f59e0b',
  creative: '#06b6d4',
}

export default function CalendarEventCard({ event }) {
  const dotColor = CATEGORY_COLORS[event.category] || '#a855f7'
  const isMissed = event.status === 'missed'
  const isCompleted = event.status === 'completed'

  return (
    <div
      className={`h-full flex items-start gap-1 px-1.5 py-0.5 overflow-hidden rounded-md ${
        isCompleted ? 'opacity-50' : ''
      }`}
      style={isMissed ? { borderLeft: '3px solid #ef4444' } : {}}
    >
      <span
        className="w-2 h-2 rounded-full flex-shrink-0 mt-[3px]"
        style={{ backgroundColor: dotColor }}
      />
      <span
        className={`text-[11px] font-medium leading-tight truncate flex-1 ${
          isCompleted ? 'line-through' : ''
        }`}
      >
        {event.title}
      </span>
      {event.priority === 'high' && (
        <span className="ml-auto text-[9px] text-rose-300 flex-shrink-0 font-bold">!</span>
      )}
    </div>
  )
}
