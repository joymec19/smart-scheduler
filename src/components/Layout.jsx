import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import BottomNav from './BottomNav'
import QuickCaptureModal from './notes/QuickCaptureModal'

export default function Layout() {
  const [noteOpen, setNoteOpen] = useState(false)
  const { pathname } = useLocation()

  // Dashboard has its own FAB that includes Quick Note — hide global FAB there
  const showGlobalFAB = pathname !== '/'

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 pb-20">
      <main className="flex-1">
        <Outlet />
      </main>
      <BottomNav />

      {/* Global Quick-Note FAB — visible on all pages except Dashboard */}
      {showGlobalFAB && (
        <>
          <motion.button
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
