import { trackTaskShared, trackNoteShared } from './analytics-tracking'

export function buildWhatsAppLink(text) {
  return 'https://wa.me/?text=' + encodeURIComponent(text)
}

export function buildGmailLink(title, body) {
  return (
    'https://mail.google.com/mail/?view=cm&su=' +
    encodeURIComponent(title) +
    '&body=' +
    encodeURIComponent(body)
  )
}

export function buildSMSLink(text) {
  return 'sms:?body=' + encodeURIComponent(text)
}

function formatDate(dateStr) {
  if (!dateStr) return 'No due date'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function buildTaskShareText(task) {
  const lines = [
    `📌 Task: ${task.title}`,
    `Category: ${task.category} | Priority: ${task.priority}`,
    `Due: ${formatDate(task.due_at)}`,
  ]
  if (task.description) lines.push(task.description)
  lines.push('— Shared from Smart Scheduler')
  return lines.join('\n')
}

export function buildNoteShareText(note) {
  const lines = [`💡 ${note.category}: ${note.content}`]
  if (note.tags && note.tags.length > 0) {
    lines.push(`Tags: ${note.tags.join(', ')}`)
  }
  lines.push('— Shared from Smart Scheduler')
  return lines.join('\n')
}

/**
 * shareTask(task, onFallback)
 * Tries navigator.share; calls onFallback({ title, text, category, type }) when unavailable.
 */
export async function shareTask(task, onFallback) {
  const text = buildTaskShareText(task)
  const title = task.title

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url: window.location.origin })
      trackTaskShared({ method: 'native', category: task.category })
    } catch (err) {
      // User cancelled (AbortError) — no fallback needed
      if (err.name !== 'AbortError') {
        onFallback?.({ title, text, category: task.category, type: 'task' })
      }
    }
  } else {
    onFallback?.({ title, text, category: task.category, type: 'task' })
  }
}

/**
 * shareNote(note, onFallback)
 * Tries navigator.share; calls onFallback({ title, text, category, type }) when unavailable.
 */
export async function shareNote(note, onFallback) {
  const text = buildNoteShareText(note)
  const title = `${note.category}: ${note.content.slice(0, 60)}`

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title, text, url: window.location.origin })
      trackNoteShared({ method: 'native', note_category: note.category })
    } catch (err) {
      if (err.name !== 'AbortError') {
        onFallback?.({ title, text, category: note.category, type: 'note' })
      }
    }
  } else {
    onFallback?.({ title, text, category: note.category, type: 'note' })
  }
}
