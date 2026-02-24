import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const currentName = user?.user_metadata?.name || user?.email?.split('@')[0] || ''
  const [name, setName] = useState(currentName)
  const [editingName, setEditingName] = useState(false)
  const [saving, setSaving] = useState(false)

  const initials = currentName.slice(0, 2).toUpperCase() || '?'
  const joinDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  async function handleSaveName() {
    if (!name.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: name.trim() } })
      if (error) throw error
      toast.success('Name updated!')
      setEditingName(false)
    } catch (err) {
      toast.error('Failed to update name')
    } finally {
      setSaving(false)
    }
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] transition-colors duration-300 pb-8">
      {/* Hero header */}
      <div className="pt-14 pb-14 px-5 relative overflow-hidden">
        {/* Background gradient blur */}
        <div className="absolute inset-0 bg-gradient-to-b from-violet-500/10 to-transparent pointer-events-none" />
        <h1 className="text-2xl font-bold relative">
          <span className="bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Profile
          </span>
        </h1>
        <p className="text-slate-400 text-sm mt-1 font-medium relative">Manage your account</p>
      </div>

      {/* Avatar — overlaps hero */}
      <div className="flex justify-center -mt-10 mb-3">
        <div className="w-20 h-20 rounded-full shadow-2xl flex items-center justify-center border-4 border-gray-50 dark:border-[#0a0a0f] ring-2 ring-violet-500/40
          bg-gradient-to-br from-violet-500 to-indigo-600">
          <span className="text-2xl font-bold text-white select-none">{initials}</span>
        </div>
      </div>

      {/* Name + email under avatar */}
      <p className="text-center text-gray-700 dark:text-white font-semibold text-base">{currentName}</p>
      <p className="text-center text-slate-400 text-xs mt-0.5">{user?.email}</p>

      {/* Details */}
      <div className="px-4 mt-6 space-y-3">

        {/* Display Name — editable */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-2">Display Name</p>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') { setName(currentName); setEditingName(false) }
                }}
                className="flex-1 text-gray-800 dark:text-slate-100 font-medium text-sm bg-gray-50 dark:bg-white/5 rounded-xl px-3 py-2 outline-none ring-2 ring-violet-500/50 border border-gray-200 dark:border-white/10 transition-shadow"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="text-violet-500 dark:text-violet-400 text-sm font-semibold min-w-[44px]"
              >
                {saving ? '…' : 'Save'}
              </button>
              <button
                onClick={() => { setName(currentName); setEditingName(false) }}
                className="text-slate-400 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-800 dark:text-slate-100 font-medium text-sm">{currentName}</p>
              <button
                onClick={() => setEditingName(true)}
                className="text-violet-500 dark:text-violet-400 text-xs font-semibold px-3 py-1.5 bg-violet-500/10 rounded-lg border border-violet-500/20 hover:bg-violet-500/15 transition-colors"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email — read-only */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Email</p>
          <p className="text-gray-800 dark:text-slate-100 font-medium text-sm">{user?.email}</p>
        </div>

        {/* Member Since */}
        <div className="glass-card rounded-2xl p-4">
          <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wide mb-1">Member Since</p>
          <p className="text-gray-800 dark:text-slate-100 font-medium text-sm">{joinDate}</p>
        </div>

        {/* Sign Out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className="w-full mt-2 bg-rose-500/10 text-rose-400 rounded-2xl py-4 font-semibold text-sm border border-rose-500/20 active:bg-rose-500/20 transition-colors hover:bg-rose-500/15"
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  )
}
