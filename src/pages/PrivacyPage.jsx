import { Link } from 'react-router-dom'

const sections = [
  {
    title: 'What we collect',
    body: 'We collect your email address (for login), the tasks, notes, and nudges you create, and anonymised usage events (e.g. task completed, note created). We do not collect sensitive personal information beyond what you explicitly enter.',
  },
  {
    title: "How it's used",
    body: 'Your data is used solely to provide the Smart Scheduler service — scheduling, rescheduling, nudge generation, and analytics shown only to you. Anonymised, aggregated usage events may be used to improve the product.',
  },
  {
    title: 'Google Calendar',
    body: 'Google Calendar sync is entirely optional. If enabled, we store OAuth tokens to read and write calendar events on your behalf. You can disconnect at any time from Settings, which immediately revokes access and deletes stored tokens.',
  },
  {
    title: 'Data deletion',
    body: 'You can request full deletion of your account and all associated data from the Profile page → "Delete Account". We will permanently delete all your data within 7 days of the request.',
  },
  {
    title: 'Third parties',
    body: 'We never sell your data. We use Supabase (data storage), Mixpanel (anonymised analytics events), and Vercel (hosting). Each vendor is bound by their own privacy policies.',
  },
  {
    title: 'Contact',
    body: null,
    contact: true,
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0f] px-5 py-10 transition-colors duration-300">
      <div className="max-w-lg mx-auto">
        <Link
          to="/"
          className="text-sm text-violet-500 hover:text-violet-600 mb-6 inline-flex items-center gap-1 transition-colors"
        >
          ← Back
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Privacy Policy</h1>
        <p className="text-sm text-gray-400 dark:text-slate-500 mb-8">Last updated: February 2026</p>

        <div className="space-y-8">
          {sections.map(({ title, body, contact }) => (
            <section key={title}>
              <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
              {contact ? (
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">
                  Questions or requests? Email us at{' '}
                  <a
                    href="mailto:privacy@smartscheduler.app"
                    className="text-violet-500 hover:text-violet-600 underline transition-colors"
                  >
                    privacy@smartscheduler.app
                  </a>
                </p>
              ) : (
                <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed">{body}</p>
              )}
            </section>
          ))}
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 mt-12 text-center">
          Smart Scheduler · All rights reserved
        </p>
      </div>
    </div>
  )
}
