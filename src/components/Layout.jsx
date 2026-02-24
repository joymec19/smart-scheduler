import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import BottomNav from './BottomNav'
import QuickCaptureModal from './notes/QuickCaptureModal'
import OnboardingTour from './OnboardingTour'
import ErrorBoundary from './ErrorBoundary'

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
}

function MoonIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="4" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  )
}

export default function Layout() {
  const [noteOpen, setNoteOpen] = useState(false)
  const { pathname } = useLocation()

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme')
    if (saved) return saved === 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
    localStorage.setItem('theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Quick-Note FAB is only relevant on the Notes page.
  const showGlobalFAB = pathname === '/notes'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0a0f] pb-20 transition-colors duration-300">
      {/* ── Dark / Light mode toggle — fixed top-right ── */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsDark((v) => !v)}
        className="fixed top-4 right-4 z-50 w-9 h-9 flex items-center justify-center rounded-full glass-float text-gray-500 dark:text-slate-400 shadow-md hover:shadow-lg transition-all"
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {isDark ? <SunIcon /> : <MoonIcon />}
      </motion.button>

      <main className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </motion.div>
        </AnimatePresence>
      </main>

      <BottomNav />

      {/* Onboarding tooltip tour — shown once to new users */}
      <OnboardingTour />

      {/* Global Quick-Note FAB — visible on Notes page */}
      {showGlobalFAB && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setNoteOpen(true)}
            className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-r from-violet-500 to-indigo-600 rounded-full shadow-xl shadow-violet-500/30 flex items-center justify-center text-white"
            aria-label="Quick note"
          >
            <span className="text-xl leading-none">📝</span>
          </motion.button>

          <QuickCaptureModal
            open={noteOpen}
            onClose={() => setNoteOpen(false)}
          />
        </>
      )}
    </div>
  )
}
