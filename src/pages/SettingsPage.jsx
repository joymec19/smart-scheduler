import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import GoogleCalendarConnect from '../components/settings/GoogleCalendarConnect'

function SectionHeader({ title, description }) {
  return (
    <div className="mb-3">
      <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
      {description && (
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{description}</p>
      )}
    </div>
  )
}

function PlaceholderCard({ label }) {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-white/10 p-5">
      <p className="text-sm text-gray-400 dark:text-slate-500">{label}</p>
    </div>
  )
}

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const displayName =
    user?.user_metadata?.name || user?.email?.split('@')[0] || '—'
  const email = user?.email || '—'

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 pb-24 max-w-lg mx-auto">
      {/* Page header */}
      <div className="px-1 pt-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
          Manage your account and integrations
        </p>
      </div>

      {/* ── Account ─────────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <SectionHeader title="Account" />
        <div className="rounded-2xl bg-white dark:bg-[#1a1a2e] border border-gray-100 dark:border-white/10 divide-y divide-gray-100 dark:divide-white/10 overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{displayName}</p>
              <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="text-sm text-gray-700 dark:text-slate-300">Sign out</span>
          </button>
        </div>
      </motion.section>

      {/* ── Google Calendar ──────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <SectionHeader
          title="Google Calendar"
          description="Sync tasks to your Google Calendar automatically"
        />
        <GoogleCalendarConnect />
      </motion.section>

      {/* ── Notifications (placeholder) ──────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <SectionHeader title="Notifications" description="Coming soon" />
        <PlaceholderCard label="Push notification settings will appear here." />
      </motion.section>

      {/* ── Data Export (placeholder) ────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SectionHeader title="Data Export" description="Download your data" />
        <PlaceholderCard label="Export your tasks and notes as CSV — coming soon." />
      </motion.section>

      {/* ── Danger Zone ──────────────────────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <SectionHeader title="Danger Zone" />
        <div className="rounded-2xl bg-white dark:bg-[#1a1a2e] border border-red-100 dark:border-red-500/20 p-5 space-y-4">
          <p className="text-xs text-red-500 dark:text-red-400">
            Deleting your account is permanent and cannot be undone. All tasks, notes, and data will be erased.
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-2 rounded-xl border border-red-200 dark:border-red-500/30 text-red-500 text-xs font-semibold py-2 px-3 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete my account
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">
                Are you sure? This cannot be undone.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => alert('Account deletion requires a backend implementation. Contact support.')}
                  className="flex-1 rounded-xl bg-red-500 text-white text-xs font-semibold py-2 hover:bg-red-600 transition-colors"
                >
                  Delete account
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-300 text-xs font-semibold py-2 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.section>
    </div>
  )
}
