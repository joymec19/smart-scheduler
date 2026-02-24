import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { trackUserSignup, identifyUser } from '../lib/analytics-tracking'

export default function Signup() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { data, error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      trackUserSignup()
      if (data?.user) identifyUser(data.user.id, { signup_date: new Date().toISOString() })
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0f] px-4 transition-colors duration-300">
      {/* Background gradient orb */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gradient-to-r from-violet-500/10 to-cyan-500/10 blur-3xl" />
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
          <p className="text-slate-400 text-sm mt-1.5 font-medium">Start your productivity journey</p>
        </div>

        <div className="glass-card rounded-3xl p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Create account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm
                  bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                  placeholder-gray-400 dark:placeholder-slate-500
                  focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </div>

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
                minLength={6}
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
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-violet-500 dark:text-violet-400 font-semibold hover:text-violet-600 transition-colors">Sign In</Link>
        </p>
      </div>
    </div>
  )
}
