import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const STORAGE_KEY = 'smart_scheduler_onboarded'

/**
 * Tab layout: 5 tabs in justify-around → centers at 10%, 30%, 50%, 70%, 90% of screen.
 * Card spans left:16px … right:16px (full width minus 32px).
 * Arrow left% within card = (tabCenter_screenPct * screenW - 16) / (screenW - 32)
 * For a 375px screen this gives Tasks≈28%, Notes≈50%, Analytics≈72%.
 * These values are screen-width stable (< 1% drift from 320px → 428px).
 */
const STEPS = [
  {
    emoji: '✅',
    title: 'Create a task',
    body: 'Tap the + button on the Tasks screen to add tasks with priorities, categories, and due dates. Swipe right to complete, left to reschedule.',
    tabLabel: 'Tasks tab ↓',
    // Tasks = 2nd tab of 5 → center at 30% of screen → ≈ 28% within the card
    arrowPct: 28,
  },
  {
    emoji: '📝',
    title: 'Capture notes',
    body: 'Tap Notes to save quick thoughts and ideas — organized by category and searchable by tag.',
    tabLabel: 'Notes tab ↓',
    // Notes = 3rd tab of 5 → center at 50% → card is centered so arrow is at 50%
    arrowPct: 50,
  },
  {
    emoji: '📊',
    title: 'Check analytics',
    body: 'See your completion rate, time accuracy, and personalized coaching insights to improve every week.',
    tabLabel: 'Analytics tab ↓',
    // Analytics = 4th tab of 5 → center at 70% → ≈ 72% within the card
    arrowPct: 72,
  },
]

export default function OnboardingTour() {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      const t = setTimeout(() => setVisible(true), 700)
      return () => clearTimeout(t)
    }
  }, [])

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  function next() {
    if (step < STEPS.length - 1) setStep((s) => s + 1)
    else finish()
  }

  const current = STEPS[step]

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Dimmed backdrop — tap outside to skip */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] bg-black/50"
            onClick={finish}
          />

          {/*
            Card sits just above the bottom nav (h-16 = 64px + 8px gap = bottom: 72px).
            It stretches edge-to-edge with 16px margin on each side.
            The down-pointing arrow is positioned at arrowPct% of card width,
            which aligns with the corresponding nav tab.
          */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            style={{ bottom: '72px', left: '16px', right: '16px' }}
            className="fixed z-[100] bg-white rounded-2xl shadow-2xl p-5"
          >
            {/* Step header */}
            <div className="flex items-center gap-3 mb-1.5">
              <span className="text-3xl">{current.emoji}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-base leading-tight">{current.title}</h3>
                <span className="text-[10px] text-purple-500 font-semibold">{current.tabLabel}</span>
              </div>
            </div>

            <p className="text-gray-500 text-sm leading-relaxed mb-4">{current.body}</p>

            {/* Progress dots */}
            <div className="flex items-center gap-1.5 mb-4">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step
                      ? 'bg-purple-500 w-5'
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

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                onClick={finish}
                className="flex-1 text-gray-400 text-sm py-2.5 rounded-xl font-medium"
              >
                Skip
              </button>
              <button
                onClick={next}
                className="flex-1 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl py-2.5 text-sm font-semibold shadow-sm active:scale-95 transition-transform"
              >
                {step < STEPS.length - 1 ? 'Next →' : 'Done!'}
              </button>
            </div>

            {/* Down-pointing arrow that tracks the target tab */}
            <div
              className="absolute -bottom-2.5 w-5 h-5 bg-white rotate-45 rounded-sm shadow"
              style={{ left: `${current.arrowPct}%`, transform: 'translateX(-50%) rotate(45deg)' }}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
