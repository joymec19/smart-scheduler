import { useState } from 'react'
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

export default function Layout() {
  const [noteOpen, setNoteOpen] = useState(false)
  const { pathname } = useLocation()

  // Quick-Note FAB is only relevant on the Notes page.
  // Dashboard has its own multi-action FAB; Tasks has an Add-Task FAB; Analytics needs neither.
  const showGlobalFAB = pathname === '/notes'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20">
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

      {/* Global Quick-Note FAB — visible on all pages except Dashboard */}
      {showGlobalFAB && (
        <>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.88 }}
            onClick={() => setNoteOpen(true)}
            className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 rounded-full shadow-xl flex items-center justify-center text-white"
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
