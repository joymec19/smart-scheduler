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
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Gradient header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 pt-12 pb-14 px-5">
        <h1 className="text-white text-2xl font-bold">Profile</h1>
        <p className="text-purple-200 text-sm mt-1">Manage your account</p>
      </div>

      {/* Avatar — overlaps header */}
      <div className="flex justify-center -mt-10 mb-2">
        <div className="w-20 h-20 rounded-full bg-white shadow-xl flex items-center justify-center border-4 border-white ring-2 ring-purple-200">
          <span className="text-2xl font-bold text-purple-600 select-none">{initials}</span>
        </div>
      </div>

      {/* Name label under avatar */}
      <p className="text-center text-gray-700 font-semibold text-base">{currentName}</p>
      <p className="text-center text-gray-400 text-xs mt-0.5">{user?.email}</p>

      {/* Details */}
      <div className="px-4 mt-6 space-y-3">

        {/* Display Name — editable */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-2">Display Name</p>
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName()
                  if (e.key === 'Escape') { setName(currentName); setEditingName(false) }
                }}
                className="flex-1 text-gray-800 font-medium text-sm bg-gray-50 rounded-xl px-3 py-2 outline-none ring-2 ring-purple-300 focus:ring-purple-500 transition-shadow"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                disabled={saving}
                className="text-purple-600 text-sm font-semibold min-w-[44px]"
              >
                {saving ? '…' : 'Save'}
              </button>
              <button
                onClick={() => { setName(currentName); setEditingName(false) }}
                className="text-gray-400 text-sm"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <p className="text-gray-800 font-medium text-sm">{currentName}</p>
              <button
                onClick={() => setEditingName(true)}
                className="text-purple-500 text-xs font-semibold px-3 py-1.5 bg-purple-50 rounded-lg"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        {/* Email — read-only */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-1">Email</p>
          <p className="text-gray-800 font-medium text-sm">{user?.email}</p>
        </div>

        {/* Member Since */}
        <div className="bg-white rounded-2xl p-4 shadow-sm">
          <p className="text-gray-400 text-[11px] font-medium uppercase tracking-wide mb-1">Member Since</p>
          <p className="text-gray-800 font-medium text-sm">{joinDate}</p>
        </div>

        {/* Sign Out */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSignOut}
          className="w-full mt-2 bg-red-50 text-red-500 rounded-2xl py-4 font-semibold text-sm shadow-sm border border-red-100 active:bg-red-100 transition-colors"
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  )
}
