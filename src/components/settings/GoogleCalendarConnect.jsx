import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import {
  connectGoogleCalendar,
  disconnectGoogleCalendar,
  getStoredTokens,
} from '../../lib/google-calendar'

export default function GoogleCalendarConnect() {
  const { user } = useAuth()
  const [tokens, setTokens]               = useState(null)
  const [loading, setLoading]             = useState(true)
  const [connecting, setConnecting]       = useState(false)
  const [showConfirm, setShowConfirm]     = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)

  useEffect(() => {
    if (!user) return
    getStoredTokens(user.id)
      .then(setTokens)
      .finally(() => setLoading(false))
  }, [user])

  async function handleConnect() {
    setConnecting(true)
    try {
      await connectGoogleCalendar()
      // Page will redirect — no cleanup needed
    } catch {
      setConnecting(false)
    }
  }

  async function handleDisconnect() {
    setDisconnecting(true)
    try {
      await disconnectGoogleCalendar(user.id)
      setTokens(null)
    } catch {
      // silent
    } finally {
      setDisconnecting(false)
      setShowConfirm(false)
    }
  }

  function formatLastSynced(ts) {
    if (!ts) return 'Never'
    return new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day:   'numeric',
      hour:  'numeric',
      minute: '2-digit',
    }).format(new Date(ts))
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
            <div className="h-3 w-48 rounded bg-gray-100 dark:bg-white/5 animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  const isConnected = !!tokens

  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-white/10 p-5 space-y-4">
      {/* Header row */}
      <div className="flex items-center gap-3">
        {/* Google icon placeholder */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center shadow-sm flex-shrink-0">
          <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              Google Calendar
            </span>
            {isConnected && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-500 border border-emerald-500/25">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Connected
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
            {isConnected
              ? `Last synced: ${formatLastSynced(tokens.last_synced_at)}`
              : 'Tasks sync instantly when created, edited, or rescheduled'}
          </p>
        </div>
      </div>

      {/* Detail row when connected */}
      {isConnected && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-3 text-xs text-emerald-700 dark:text-emerald-300 space-y-1"
        >
          <p className="font-medium">Sync is active</p>
          <p className="text-emerald-600 dark:text-emerald-400">
            Tasks sync instantly when created, edited, or rescheduled.
            External Google events appear in gray on your calendar.
          </p>
        </motion.div>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {!isConnected ? (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white text-sm font-semibold py-2.5 px-4 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
          >
            {connecting ? (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            )}
            {connecting ? 'Redirecting…' : 'Connect Google Calendar'}
          </button>
        ) : (
          <button
            onClick={() => setShowConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-semibold py-2 px-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
            Disconnect
          </button>
        )}
      </div>

      {/* Disconnect confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/25 p-4 space-y-3"
          >
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              Disconnect Google Calendar?
            </p>
            <p className="text-xs text-red-500 dark:text-red-400/80">
              Your Google Calendar events will stop syncing and existing event IDs will be cleared.
              Your tasks won't be deleted.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="flex-1 rounded-xl bg-red-500 text-white text-xs font-semibold py-2 hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {disconnecting ? 'Disconnecting…' : 'Yes, disconnect'}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 text-xs font-semibold py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
