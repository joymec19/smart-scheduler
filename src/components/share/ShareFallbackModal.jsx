import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { buildWhatsAppLink, buildGmailLink } from '../../lib/share'
import { trackTaskShared, trackNoteShared } from '../../lib/analytics-tracking'

export default function ShareFallbackModal({ open, onClose, shareContent }) {
  const [copied, setCopied] = useState(false)

  if (!shareContent) return null

  const { title, text, category, type } = shareContent

  function track(method) {
    if (type === 'task') trackTaskShared({ method, category })
    else trackNoteShared({ method, note_category: category })
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      track('clipboard')
      toast('Copied!', { icon: '📋' })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Could not copy')
    }
  }

  function handleGmail() {
    window.open(buildGmailLink(title, text), '_blank')
    track('gmail')
  }

  function handleWhatsApp() {
    window.open(buildWhatsAppLink(text), '_blank')
    track('whatsapp')
  }

  async function handleMore() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text, url: window.location.origin })
        track('native')
      } catch {}
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 380 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-lg"
          >
            <div className="bg-white dark:bg-[#13131a] rounded-t-3xl px-5 pt-4 pb-10 shadow-2xl border-t border-gray-100 dark:border-white/10">
              {/* Drag handle */}
              <div className="w-10 h-1 bg-gray-200 dark:bg-white/20 rounded-full mx-auto mb-5" />

              {/* Heading + close */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-gray-900 dark:text-slate-100">Share this</h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 dark:text-slate-500 dark:hover:text-slate-300 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Close"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Copyable preview */}
              <div className="relative mb-4">
                <textarea
                  readOnly
                  value={text}
                  rows={4}
                  className="w-full text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-[#1a1a28] border border-gray-200 dark:border-white/10 rounded-xl px-3 py-2.5 resize-none focus:outline-none leading-relaxed"
                />
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-violet-500/10 text-violet-500 hover:bg-violet-500/20 transition-colors"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>

              {/* Option buttons */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  onClick={handleGmail}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/15 active:bg-red-500/20 transition-colors text-left"
                >
                  <span className="text-xl leading-none">📧</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">Gmail</p>
                    <p className="text-[10px] text-slate-400">Open in Gmail</p>
                  </div>
                </button>

                <button
                  onClick={handleWhatsApp}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/15 active:bg-green-500/20 transition-colors text-left"
                >
                  <span className="text-xl leading-none">💬</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">WhatsApp</p>
                    <p className="text-[10px] text-slate-400">Send via WhatsApp</p>
                  </div>
                </button>

                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-violet-500/10 hover:bg-violet-500/15 active:bg-violet-500/20 transition-colors text-left"
                >
                  <span className="text-xl leading-none">📋</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">
                      {copied ? 'Copied!' : 'Copy text'}
                    </p>
                    <p className="text-[10px] text-slate-400">Copy to clipboard</p>
                  </div>
                </button>

                <button
                  onClick={handleMore}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-500/10 hover:bg-slate-500/15 active:bg-slate-500/20 transition-colors text-left"
                >
                  <span className="text-xl leading-none">📱</span>
                  <div>
                    <p className="text-xs font-semibold text-gray-800 dark:text-slate-100">More options</p>
                    <p className="text-[10px] text-slate-400">System share sheet</p>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
