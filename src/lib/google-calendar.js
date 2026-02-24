import { supabase } from './supabase'

const GCAL_BASE = 'https://www.googleapis.com/calendar/v3'

// Google Calendar colorId mapping per category
const CATEGORY_COLOR_ID = {
  learning: '7',  // Peacock blue
  work:     '9',  // Blueberry
  health:   '2',  // Sage green
  personal: '3',  // Grape
  info:     '5',  // Banana
  creative: '6',  // Tangerine
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function gcalFetch(url, options, accessToken) {
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
}

async function refreshAndUpdateToken(userId) {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    if (error || !session?.provider_token) return null

    const newExpiry = new Date(Date.now() + 3600 * 1000).toISOString()
    await supabase
      .from('google_calendar_tokens')
      .update({ access_token: session.provider_token, expiry: newExpiry })
      .eq('user_id', userId)

    return session.provider_token
  } catch {
    return null
  }
}

async function getValidToken(tokens, userId) {
  if (!tokens?.access_token) return null
  const expiry = tokens.expiry ? new Date(tokens.expiry) : null
  // Refresh if within 5 min of expiry
  if (expiry && expiry.getTime() - Date.now() < 5 * 60 * 1000) {
    return await refreshAndUpdateToken(userId)
  }
  return tokens.access_token
}

function buildEventPayload(task) {
  const start = new Date(task.due_at)
  const end = new Date(start.getTime() + (task.estimated_minutes || 30) * 60000)
  return {
    summary: task.title,
    description: task.description || '',
    start: { dateTime: start.toISOString() },
    end:   { dateTime: end.toISOString() },
    colorId: CATEGORY_COLOR_ID[task.category] || '9',
  }
}

// ─── Token persistence ────────────────────────────────────────────────────────

export async function getStoredTokens(userId) {
  const { data } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return data || null
}

/**
 * Called after the OAuth redirect lands on /calendar?connected=true.
 * Extracts provider_token from the current Supabase session and upserts to DB.
 */
export async function saveTokensFromSession(userId) {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.provider_token) return null

  const expiry = new Date(Date.now() + 3600 * 1000).toISOString()
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .upsert(
      {
        user_id:      userId,
        access_token: session.provider_token,
        refresh_token: session.provider_refresh_token || null,
        expiry,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Connect / Disconnect ─────────────────────────────────────────────────────

export async function connectGoogleCalendar() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      scopes: 'https://www.googleapis.com/auth/calendar',
      redirectTo: window.location.origin + '/calendar?connected=true',
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  })
  if (error) throw error
}

export async function disconnectGoogleCalendar(userId) {
  await supabase
    .from('google_calendar_tokens')
    .delete()
    .eq('user_id', userId)

  // Clear google_event_id from all tasks for this user
  await supabase
    .from('tasks')
    .update({ google_event_id: null })
    .eq('user_id', userId)
}

// ─── Sync task ────────────────────────────────────────────────────────────────

/**
 * Creates or updates a Google Calendar event for a task.
 * Fire-and-forget safe — returns null on any failure.
 */
export async function syncTaskToGoogleCalendar(task, tokens) {
  if (!tokens || !task.due_at || task.is_subtask) return null

  const token = await getValidToken(tokens, task.user_id)
  if (!token) return null

  const calendarId = tokens.google_calendar_id || 'primary'
  const payload = buildEventPayload(task)

  async function attempt(accessToken) {
    if (task.google_event_id) {
      return gcalFetch(
        `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${task.google_event_id}`,
        { method: 'PATCH', body: JSON.stringify(payload) },
        accessToken
      )
    }
    return gcalFetch(
      `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events`,
      { method: 'POST', body: JSON.stringify(payload) },
      accessToken
    )
  }

  let response = await attempt(token)

  // Retry once after refreshing on 401
  if (response.status === 401) {
    const newToken = await refreshAndUpdateToken(task.user_id)
    if (!newToken) return null
    response = await attempt(newToken)
  }

  if (!response.ok) return null

  const event = await response.json()

  // Persist event ID if this was a new event creation
  if (!task.google_event_id && event.id) {
    await supabase
      .from('tasks')
      .update({ google_event_id: event.id })
      .eq('id', task.id)
  }

  await supabase
    .from('google_calendar_tokens')
    .update({ last_synced_at: new Date().toISOString() })
    .eq('user_id', task.user_id)

  return event
}

// ─── Fetch external events ────────────────────────────────────────────────────

/**
 * Returns Google Calendar events for a date range as read-only calendar items.
 */
export async function fetchGoogleCalendarEvents(tokens, userId, dateRange) {
  if (!tokens) return []

  const token = await getValidToken(tokens, userId)
  if (!token) return []

  const calendarId = tokens.google_calendar_id || 'primary'
  const params = new URLSearchParams({
    timeMin:       dateRange.start.toISOString(),
    timeMax:       dateRange.end.toISOString(),
    singleEvents:  'true',
    orderBy:       'startTime',
    maxResults:    '100',
  })

  const response = await gcalFetch(
    `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events?${params}`,
    { method: 'GET' },
    token
  )

  if (!response.ok) return []

  const data = await response.json()
  return (data.items || []).map((event) => ({
    id:         `gcal_${event.id}`,
    gcalId:     event.id,
    title:      event.summary || '(No title)',
    start:      new Date(event.start?.dateTime || event.start?.date),
    end:        new Date(event.end?.dateTime   || event.end?.date),
    isExternal: true,
    resource:   'external',
  }))
}

// ─── Delete event ─────────────────────────────────────────────────────────────

export async function deleteGoogleCalendarEvent(googleEventId, tokens, userId) {
  if (!tokens || !googleEventId) return

  const token = await getValidToken(tokens, userId)
  if (!token) return

  const calendarId = tokens.google_calendar_id || 'primary'
  await gcalFetch(
    `${GCAL_BASE}/calendars/${encodeURIComponent(calendarId)}/events/${googleEventId}`,
    { method: 'DELETE' },
    token
  )
}
