import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'smart_scheduler_onboarded'
const CARD_WIDTH = 240  // px — narrow enough to sit neatly above a tab

const STEPS = [
  {
    targetId: 'tour-tasks',
    emoji: '✅',
    title: 'Create a task',
    body: 'Tap Tasks to add tasks with priorities, categories, and due dates. Swipe right to complete, left to reschedule.',
  },
  {
    targetId: 'tour-notes',
    emoji: '📝',
    title: 'Capture notes',
    body: 'Tap Notes to save quick thoughts and ideas — organized by category and searchable by tag.',
  },
  {
    targetId: 'tour-analytics',
    emoji: '📊',
    title: 'Check analytics',
    body: 'Tap Analytics to see your completion rate, time accuracy, and personalized coaching insights.',
  },
  {
    targetId: 'tour-fab',
    emoji: '➕',
    title: 'Quick actions',
    body: 'Tap + to instantly start a new task or capture a quick note — right from the Dashboard.',
  },
]

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  // Computed layout: card left edge, card bottom edge, arrow x within card
  const [pos, setPos] = useState(null)

  /** Measure the target element and derive tooltip position */
  const measure = useCallback((targetId) => {
    const el = document.querySelector(`[data-tour-id="${targetId}"]`)
    if (!el) return

    const rect = el.getBoundingClientRect()
    const vw = window.innerWidth
    const vh = window.innerHeight

    // Horizontal centre of the target in screen coords
    const cx = rect.left + rect.width / 2

    // Centre the card over the target; clamp so it stays within the viewport
    const cardLeft = Math.max(8, Math.min(cx - CARD_WIDTH / 2, vw - CARD_WIDTH - 8))

    // Arrow x within the card — points to the target centre
    const arrowX = cx - cardLeft

    // Card sits 12 px above the target's top edge
    const cardBottom = vh - rect.top + 12

    setPos({ cardLeft, cardBottom, arrowX })
  }, [])

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      // Wait for the layout to settle before measuring
      const t = setTimeout(() => setVisible(true), 700)
      return () => clearTimeout(t)
    }
  }, [])

  // Re-measure whenever the step or visibility changes
  useEffect(() => {
    if (visible) measure(STEPS[step].targetId)
  }, [step, visible, measure])

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }

  // Don't render until we have a measured position
  if (!visible || !pos) return null

  const current = STEPS[step]

  // Clamp arrow so it stays inside the card (arrow is w-4 = 16 px)
  const arrowLeft = Math.max(12, Math.min(pos.arrowX - 8, CARD_WIDTH - 28))

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <>
          {/* Semi-transparent backdrop — tap to skip */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] bg-black/50"
            onClick={finish}
          />

          {/* Tooltip card — pinned precisely above the target element */}
          <motion.div
            key={step}
            initial={{ opacity: 0, scale: 0.88, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 8 }}
            transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            style={{
              position: 'fixed',
              left: pos.cardLeft,
              bottom: pos.cardBottom,
              width: CARD_WIDTH,
              zIndex: 100,
            }}
            className="bg-white rounded-2xl shadow-2xl p-4"
          >
            {/* Step header */}
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="text-2xl">{current.emoji}</span>
              <h3 className="font-bold text-gray-900 text-sm leading-tight">{current.title}</h3>
            </div>

            <p className="text-gray-500 text-xs leading-relaxed mb-3">{current.body}</p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-3">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'bg-purple-500 w-4'
                      : i < step
                      ? 'bg-purple-300 w-1.5'
                      : 'bg-gray-200 w-1.5'
                  }`}
                />
              ))}
              <span className="ml-auto text-[10px] text-gray-400 font-medium">
                {step + 1} / {STEPS.length}
              </span>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={finish}
                className="flex-1 text-gray-400 text-xs py-2 rounded-xl font-medium"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl py-2 text-xs font-semibold shadow-sm active:scale-95 transition-transform"
              >
                {step < STEPS.length - 1 ? 'Next →' : 'Done!'}
              </button>
            </div>

            {/* Down-pointing arrow that aligns with the target's centre */}
            <div
              className="absolute -bottom-2 w-4 h-4 bg-white rotate-45 shadow-md"
              style={{ left: arrowLeft }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
