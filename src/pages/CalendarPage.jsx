import { useState, useCallback, useMemo, useEffect } from 'react'
import { Calendar, momentLocalizer, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'
import toast from 'react-hot-toast'
import useTaskStore from '../stores/useTaskStore'
import { useAuth } from '../hooks/useAuth'
import TaskCreateModal from '../components/tasks/TaskCreateModal'
import CalendarEventCard from '../components/calendar/CalendarEventCard'

const localizer = momentLocalizer(moment)
const DnDCalendar = withDragAndDrop(Calendar)

const CATEGORY_BG = {
  learning: 'rgba(59,130,246,0.82)',
  work:     'rgba(168,85,247,0.82)',
  health:   'rgba(34,197,94,0.82)',
  personal: 'rgba(236,72,153,0.82)',
  info:     'rgba(245,158,11,0.82)',
  creative: 'rgba(6,182,212,0.82)',
}

const CATEGORY_BORDER = {
  learning: '#2563eb',
  work:     '#9333ea',
  health:   '#16a34a',
  personal: '#db2777',
  info:     '#d97706',
  creative: '#0891b2',
}

// ─── Custom Toolbar ──────────────────────────────────────────────────────────
function CalendarToolbar({ date, view, onNavigate, onView, label }) {
  const views = [Views.DAY, Views.WEEK, Views.MONTH]

  return (
    <div className="flex items-center justify-between mb-3 px-0.5 gap-2 flex-wrap">
      {/* Navigation */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => onNavigate('PREV')}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 dark:bg-white/5 border border-white/10 text-gray-600 dark:text-slate-300 hover:bg-white/10 transition-colors text-sm font-medium"
          aria-label="Previous"
        >
          ‹
        </button>
        <button
          onClick={() => onNavigate('TODAY')}
          className="px-3 h-8 rounded-lg bg-white/5 border border-white/10 text-xs font-semibold text-gray-600 dark:text-slate-300 hover:bg-white/10 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate('NEXT')}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 border border-white/10 text-gray-600 dark:text-slate-300 hover:bg-white/10 transition-colors text-sm font-medium"
          aria-label="Next"
        >
          ›
        </button>
      </div>

      {/* Label */}
      <span className="text-sm font-semibold text-gray-800 dark:text-white text-center flex-1 min-w-0 truncate">
        {label}
      </span>

      {/* View switcher */}
      <div className="flex bg-white/5 border border-white/10 rounded-lg p-0.5 gap-0.5">
        {views.map((v) => (
          <button
            key={v}
            onClick={() => onView(v)}
            className={`px-2.5 h-7 rounded-md text-[11px] font-semibold capitalize transition-all ${
              view === v
                ? 'bg-gradient-to-r from-violet-500 to-indigo-600 text-white shadow-md shadow-violet-500/30'
                : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200'
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function CalendarPage() {
  const { user } = useAuth()
  const { tasks, fetchTasks, addTask, updateTaskTime } = useTaskStore()

  const [view, setView] = useState(Views.DAY)
  const [date, setDate] = useState(new Date())
  const [createModal, setCreateModal] = useState({ open: false, defaultDueAt: '' })

  // Load tasks on mount
  useEffect(() => {
    if (user) fetchTasks(user.id)
  }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  // Map tasks → calendar events (skip subtasks, skip tasks without due_at)
  const events = useMemo(
    () =>
      tasks
        .filter((t) => !t.is_subtask && t.due_at)
        .map((t) => ({
          id: t.id,
          title: t.title,
          start: new Date(t.due_at),
          end: new Date(
            new Date(t.due_at).getTime() + (t.estimated_minutes || 30) * 60000
          ),
          category: t.category,
          priority: t.priority,
          status: t.status,
          resource: 'task',
        })),
    [tasks]
  )

  // Style events by category
  const eventPropGetter = useCallback((event) => {
    const bg = CATEGORY_BG[event.category] || CATEGORY_BG.work
    const border = CATEGORY_BORDER[event.category] || CATEGORY_BORDER.work
    return {
      style: {
        backgroundColor: bg,
        borderLeft: `3px solid ${border}`,
        borderTop: 'none',
        borderRight: 'none',
        borderBottom: 'none',
        borderRadius: '6px',
        color: '#fff',
        fontSize: '12px',
        padding: '0',
        opacity: event.status === 'completed' ? 0.55 : 1,
      },
    }
  }, [])

  // Drag-and-drop: move event
  const onEventDrop = useCallback(
    ({ event, start }) => {
      updateTaskTime(event.id, start.toISOString())
    },
    [updateTaskTime]
  )

  // Drag-and-drop: resize event (updates due_at to new start)
  const onEventResize = useCallback(
    ({ event, start }) => {
      updateTaskTime(event.id, start.toISOString())
    },
    [updateTaskTime]
  )

  // Click on empty slot → open TaskCreateModal pre-filled
  const onSelectSlot = useCallback(({ start }) => {
    const iso = moment(start).format('YYYY-MM-DDTHH:mm')
    setCreateModal({ open: true, defaultDueAt: iso })
  }, [])

  // Click on existing event → show a quick toast with details
  const onSelectEvent = useCallback((event) => {
    const timeStr = moment(event.start).format('h:mm A')
    toast(
      `${event.title} · ${timeStr} · ${event.status}`,
      { icon: event.status === 'completed' ? '✅' : event.status === 'missed' ? '⏭' : '📌' }
    )
  }, [])

  async function handleCreateTask(data) {
    await addTask({ ...data, user_id: user.id })
  }

  return (
    <div className="flex flex-col gap-3 pb-24">
      {/* Header */}
      <div className="px-1 pt-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Drag tasks to reschedule · Tap a slot to add
        </p>
      </div>

      {/* Calendar container */}
      <div
        className="rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10
          bg-white dark:bg-[#13131a] shadow-sm"
        style={{ height: 'calc(100vh - 200px)', minHeight: 520 }}
      >
        <div className="h-full p-3">
          <DnDCalendar
            localizer={localizer}
            events={events}
            view={view}
            date={date}
            onView={setView}
            onNavigate={setDate}
            defaultView={Views.DAY}
            views={[Views.DAY, Views.WEEK, Views.MONTH]}
            // Time range: 6 AM – 11 PM
            min={new Date(0, 0, 0, 6, 0, 0)}
            max={new Date(0, 0, 0, 23, 0, 0)}
            step={15}
            timeslots={4}
            // Interaction
            selectable
            resizable
            onEventDrop={onEventDrop}
            onEventResize={onEventResize}
            onSelectSlot={onSelectSlot}
            onSelectEvent={onSelectEvent}
            // Styling
            eventPropGetter={eventPropGetter}
            // Custom components
            components={{
              toolbar: CalendarToolbar,
              event: CalendarEventCard,
            }}
            // Scroll to current time in day/week views
            scrollToTime={new Date()}
            style={{ height: '100%' }}
          />
        </div>
      </div>

      {/* Category legend */}
      <div className="flex flex-wrap gap-2 px-1">
        {Object.entries(CATEGORY_BG).map(([cat, color]) => (
          <span key={cat} className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="capitalize">{cat}</span>
          </span>
        ))}
      </div>

      {/* Task create modal */}
      <TaskCreateModal
        open={createModal.open}
        defaultDueAt={createModal.defaultDueAt}
        onClose={() => setCreateModal({ open: false, defaultDueAt: '' })}
        onSubmit={handleCreateTask}
      />
    </div>
  )
}
