import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import toast from 'react-hot-toast'

const PERSONA_TEMPLATES = {
  creator: [
    { title: 'Write LinkedIn post', category: 'creative', priority: 'medium' },
    { title: 'Record 3 content ideas', category: 'creative', priority: 'high' },
    { title: 'Review analytics', category: 'work', priority: 'low' },
  ],
  professional: [
    { title: 'Team standup prep', category: 'work', priority: 'high' },
    { title: 'Review inbox', category: 'work', priority: 'medium' },
    { title: 'Block deep work time', category: 'work', priority: 'medium' },
  ],
  student: [
    { title: 'Review lecture notes', category: 'learning', priority: 'high' },
    { title: 'Complete assignment', category: 'learning', priority: 'high' },
    { title: 'Skim 2 articles', category: 'info', priority: 'low' },
  ],
  other: [
    { title: 'Plan my week', category: 'personal', priority: 'high' },
    { title: 'Capture 3 ideas', category: 'creative', priority: 'medium' },
    { title: 'Review goals', category: 'personal', priority: 'medium' },
  ],
}

const CHUNK_OPTIONS = [
  { label: '15 min', value: '15' },
  { label: '25 min', value: '25' },
  { label: '45 min', value: '45' },
  { label: '60 min+', value: '60' },
]

const PERSONAS = [
  { value: 'creator', label: '🎨 Content Creator' },
  { value: 'professional', label: '💼 Professional' },
  { value: 'student', label: '📚 Student' },
  { value: 'other', label: '✨ Other' },
]

const slideVariants = {
  initial: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  animate: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

const slideTransition = { type: 'spring', stiffness: 280, damping: 28 }

function ProgressDots({ current }) {
  return (
    <div className="flex justify-center gap-2 mt-6">
      {[1, 2, 3, 4].map((s) => (
        <div
          key={s}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            s === current
              ? 'w-6 bg-violet-500'
              : s < current
              ? 'w-3 bg-violet-400'
              : 'w-3 bg-gray-300 dark:bg-white/20'
          }`}
        />
      ))}
    </div>
  )
}

function BackButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-slate-300 mb-6 flex items-center gap-1 transition-colors"
    >
      ← Back
    </button>
  )
}

export default function OnboardingPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [dir, setDir] = useState(1)
  const [privacyChecked, setPrivacyChecked] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [persona, setPersona] = useState('')
  const [chunkSize, setChunkSize] = useState('')
  const [saving, setSaving] = useState(false)

  const goTo = (next) => {
    setDir(next > step ? 1 : -1)
    setStep(next)
  }

  const handleSetupNext = async () => {
    if (!displayName.trim() || !persona || !chunkSize) {
      toast.error('Please fill in all fields')
      return
    }
    setSaving(true)
    try {
      // Try upsert with persona_type; fall back without if column doesn't exist
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({ id: user.id, display_name: displayName.trim(), persona_type: persona })

      if (profileError) {
        await supabase
          .from('profiles')
          .upsert({ id: user.id, display_name: displayName.trim() })
      }

      // Save focus session preference
      await supabase
        .from('user_decomposition_preferences')
        .insert({ user_id: user.id, chunk_size_pref: chunkSize })
        .select()

      goTo(4)
    } catch {
      toast.error('Failed to save preferences')
    } finally {
      setSaving(false)
    }
  }

  const handleComplete = async (template) => {
    setSaving(true)
    try {
      if (template) {
        await supabase.from('tasks').insert({
          user_id: user.id,
          title: template.title,
          category: template.category,
          priority: template.priority,
          status: 'pending',
          due_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          estimated_minutes: parseInt(chunkSize || '25', 10),
        })
      }

      await supabase
        .from('profiles')
        .upsert({ id: user.id, has_onboarded: true })

      // Set localStorage so ProtectedRoute lets user through even if the
      // DB column doesn't exist yet (migration pending) or upsert failed
      localStorage.setItem(`sched-onboarded-${user.id}`, '1')
      window.location.replace('/')
    } catch {
      toast.error('Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen overflow-hidden relative bg-gray-50 dark:bg-[#0a0a0f]">
      <AnimatePresence custom={dir} mode="wait">
        {/* ─── STEP 1: Welcome ─── */}
        {step === 1 && (
          <motion.div
            key="step1"
            custom={dir}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
            className="min-h-screen flex flex-col items-center justify-center px-6 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 text-white"
          >
            {/* Ambient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
              <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-white/5 blur-3xl" />
              <div className="absolute bottom-1/4 right-1/4 w-56 h-56 rounded-full bg-indigo-300/10 blur-3xl" />
            </div>

            <div className="relative z-10 text-center w-full max-w-xs">
              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="text-6xl mb-6 select-none"
              >
                ✨
              </motion.div>

              <h1 className="text-3xl font-extrabold mb-3 leading-tight tracking-tight">
                Welcome to<br />Smart Scheduler
              </h1>
              <p className="text-violet-200 text-sm mb-10 leading-relaxed">
                Your personal productivity coach that learns how you work
              </p>

              <div className="space-y-3 mb-10 text-left">
                {[
                  { icon: '🔄', text: 'Auto-reschedules missed tasks' },
                  { icon: '💡', text: 'Captures fleeting ideas instantly' },
                  { icon: '📈', text: 'Coaches you with smart patterns' },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3"
                  >
                    <span className="text-xl">{icon}</span>
                    <span className="text-sm font-medium text-white/90">{text}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => goTo(2)}
                className="w-full bg-white text-violet-700 font-bold rounded-2xl py-4 text-base shadow-xl shadow-black/20 active:scale-[0.98] transition-transform"
              >
                Get Started →
              </button>
            </div>
          </motion.div>
        )}

        {/* ─── STEP 2: Privacy ─── */}
        {step === 2 && (
          <motion.div
            key="step2"
            custom={dir}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
            className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
          >
            <div className="w-full max-w-xs">
              <BackButton onClick={() => goTo(1)} />

              <div className="glass-card rounded-3xl p-6">
                {/* Shield icon */}
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 flex items-center justify-center mx-auto mb-5">
                  <span className="text-3xl">🛡️</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-1">
                  Your data, your control
                </h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center mb-6">
                  We take privacy seriously
                </p>

                <ul className="space-y-3 mb-6">
                  {[
                    'Your tasks and notes are private — only you can see them',
                    'We never sell your data to third parties',
                    'You can export or delete all your data anytime from Settings',
                    'Google Calendar sync is optional and can be disconnected anytime',
                  ].map((point) => (
                    <li key={point} className="flex items-start gap-2.5">
                      <span className="text-emerald-500 mt-0.5 flex-shrink-0 text-base">✅</span>
                      <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{point}</p>
                    </li>
                  ))}
                </ul>

                <Link
                  to="/privacy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-500 hover:text-violet-600 underline block text-center mb-5 transition-colors"
                >
                  Read full Privacy Policy
                </Link>

                <label className="flex items-center gap-3 cursor-pointer mb-6 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:border-violet-300 dark:hover:border-violet-500/40 transition-colors">
                  <input
                    type="checkbox"
                    checked={privacyChecked}
                    onChange={(e) => setPrivacyChecked(e.target.checked)}
                    className="w-4 h-4 accent-violet-600 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 dark:text-slate-300 font-medium">
                    I understand and agree
                  </span>
                </label>

                <button
                  onClick={() => goTo(3)}
                  disabled={!privacyChecked}
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-2xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-violet-500/25"
                >
                  Continue →
                </button>
              </div>

              <ProgressDots current={step} />
            </div>
          </motion.div>
        )}

        {/* ─── STEP 3: Quick Setup ─── */}
        {step === 3 && (
          <motion.div
            key="step3"
            custom={dir}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
            className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
          >
            <div className="w-full max-w-xs">
              <BackButton onClick={() => goTo(2)} />

              <div className="glass-card rounded-3xl p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Quick setup</h2>
                <p className="text-sm text-gray-500 dark:text-slate-400 mb-6">Personalise your experience</p>

                {/* Name */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-1.5 uppercase tracking-wide">
                    What's your name?
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Your first name"
                    autoComplete="given-name"
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 px-4 py-3 text-sm
                      bg-gray-50 dark:bg-white/5 text-gray-900 dark:text-slate-100
                      placeholder-gray-400 dark:placeholder-slate-500
                      focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                  />
                </div>

                {/* Persona */}
                <div className="mb-5">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    I'm primarily a…
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PERSONAS.map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPersona(value)}
                        className={`py-2.5 px-3 rounded-xl text-sm font-medium border transition-all text-left
                          ${
                            persona === value
                              ? 'bg-violet-500/15 border-violet-500/50 text-violet-700 dark:text-violet-300'
                              : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:border-violet-300 dark:hover:border-violet-500/30'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Focus session length */}
                <div className="mb-7">
                  <label className="block text-xs font-semibold text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                    Ideal focus session?
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {CHUNK_OPTIONS.map(({ label, value }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setChunkSize(value)}
                        className={`py-2 px-4 rounded-xl text-sm font-semibold border transition-all
                          ${
                            chunkSize === value
                              ? 'bg-violet-500 text-white border-violet-500 shadow-md shadow-violet-500/30'
                              : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-slate-400 hover:border-violet-300'
                          }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSetupNext}
                  disabled={!displayName.trim() || !persona || !chunkSize || saving}
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-semibold rounded-2xl py-3.5 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-all shadow-lg shadow-violet-500/25"
                >
                  {saving ? 'Saving…' : 'Almost there →'}
                </button>
              </div>

              <ProgressDots current={step} />
            </div>
          </motion.div>
        )}

        {/* ─── STEP 4: Starter Template ─── */}
        {step === 4 && (
          <motion.div
            key="step4"
            custom={dir}
            variants={slideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={slideTransition}
            className="min-h-screen flex flex-col items-center justify-center px-5 py-12"
          >
            <div className="w-full max-w-xs">
              <BackButton onClick={() => goTo(3)} />

              <div className="glass-card rounded-3xl p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl mb-3">🚀</div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                    Let's add your first task
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Tap a quick-start or begin fresh
                  </p>
                </div>

                <div className="space-y-2.5 mb-5">
                  {(PERSONA_TEMPLATES[persona] || PERSONA_TEMPLATES.other).map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => handleComplete(t)}
                      disabled={saving}
                      className="w-full text-left px-4 py-3.5 rounded-2xl border border-gray-200 dark:border-white/10
                        bg-white dark:bg-white/5 hover:border-violet-400 hover:bg-violet-50/60 dark:hover:bg-violet-500/10
                        transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-gray-800 dark:text-slate-200 group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                          {t.title}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 capitalize flex-shrink-0">
                          {t.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleComplete(null)}
                  disabled={saving}
                  className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20
                    text-sm font-medium text-gray-500 dark:text-slate-400
                    hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Setting up…' : 'Start fresh →'}
                </button>
              </div>

              <ProgressDots current={step} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
