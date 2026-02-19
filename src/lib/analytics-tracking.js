import mixpanel from 'mixpanel-browser'

mixpanel.init(import.meta.env.VITE_MIXPANEL_TOKEN || 'dev', {
  debug: import.meta.env.DEV,
  track_pageview: false,
  persistence: 'localStorage',
})

export function identifyUser(userId, { signup_date, persona_type } = {}) {
  mixpanel.identify(userId)
  mixpanel.people.set_once({ signup_date: signup_date ?? new Date().toISOString() })
  if (persona_type) mixpanel.people.set({ persona_type })
}

export function trackSessionStart() {
  mixpanel.track('session_start')
}

export function trackUserSignup() {
  mixpanel.track('user_signup')
}

export function trackTaskCreated({ category, priority }) {
  mixpanel.track('task_created', { category, priority })
}

export function trackTaskCompleted({ was_overdue }) {
  mixpanel.track('task_completed', { was_overdue })
}

export function trackTaskMissed() {
  mixpanel.track('task_missed')
}

export function trackRescheduleAccepted() {
  mixpanel.track('reschedule_accepted')
}

export function trackRescheduleRejected() {
  mixpanel.track('reschedule_rejected')
}

export function trackNudgeActed({ nudge_type }) {
  mixpanel.track('nudge_acted', { nudge_type })
}

export function trackNudgeDismissed({ nudge_type }) {
  mixpanel.track('nudge_dismissed', { nudge_type })
}

export function trackNoteCreated({ category, has_tags }) {
  mixpanel.track('note_created', { category, has_tags })
}

export function trackAnalyticsViewed() {
  mixpanel.track('analytics_viewed')
}
