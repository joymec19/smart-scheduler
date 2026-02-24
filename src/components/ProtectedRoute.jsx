import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  const [hasOnboarded, setHasOnboarded] = useState(null) // null = not yet checked

  useEffect(() => {
    if (!user) {
      setHasOnboarded(null)
      return
    }
    supabase
      .from('profiles')
      .select('has_onboarded')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        setHasOnboarded(data?.has_onboarded ?? false)
      })
  }, [user?.id])

  // Waiting for auth session or profile fetch
  if (loading || (user && hasOnboarded === null)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] transition-colors">
        <div className="w-7 h-7 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (!hasOnboarded) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
