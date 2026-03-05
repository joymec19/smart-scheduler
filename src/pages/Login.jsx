import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signIn, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await signIn(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] px-4 transition-colors duration-300">
      {/* Background gradient orb */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-violet-500/10 to-indigo-500/10 blur-3xl" />
      </div>

      <div className="w-full max-w-sm relative">
        {/* Logo / App name */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-xl shadow-violet-500/30 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">
            Smart Scheduler
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Your intelligent productivity co-pilot</p>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Welcome back</h2>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="w-full flex items-center justify-center gap-3 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-semibold text-gray-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors active:scale-[0.98] mb-4"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
            <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-white/10" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm
                  bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                  placeholder-gray-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm
                  bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                  placeholder-gray-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

            {error && (
              <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white rounded-xl px-4 py-3 font-semibold text-sm shadow-lg shadow-violet-500/30 disabled:opacity-50 transition-opacity active:scale-[0.98] mt-1"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Don&apos;t have an account?{' '}
          <Link to="/signup" className="text-violet-500 dark:text-violet-400 font-semibold hover:text-violet-600 transition-colors">Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
