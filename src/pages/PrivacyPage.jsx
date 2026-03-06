import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 p-8">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Smart Scheduler — Last updated March 5, 2026
          </p>
        </div>

        <div className="space-y-8 text-lg leading-relaxed text-white/95">
          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">1. Data We Collect</h2>
            <ul className="list-disc pl-8 space-y-2">
              <li>Your tasks, notes, and productivity data (stored securely in Supabase)</li>
              <li>Google Calendar events (if sync enabled — read/write access)</li>
              <li>Anonymous usage analytics (Mixpanel — no personal data)</li>
              <li>Account info (email, display name)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">2. How We Use It</h2>
            <p className="mb-4">
              Only to power Smart Scheduler features:
            </p>
            <ul className="list-disc pl-8 space-y-2">
              <li>AI-powered task rescheduling and nudges</li>
              <li>Note capture and organization</li>
              <li>Calendar sync and conflict detection</li>
              <li>Personalized productivity insights</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">3. Data Sharing</h2>
            <p className="mb-4">We never sell, rent, or share your data with third parties.</p>
            <p>Google Calendar sync data stays between you and Google APIs only.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">4. Your Rights</h2>
            <ul className="list-disc pl-8 space-y-2">
              <li><strong>Export:</strong> Settings → Data Export (JSON download)</li>
              <li><strong>Delete:</strong> Settings → Delete Account (permanent, irreversible)</li>
              <li><strong>Disconnect:</strong> Google Calendar → Settings → Disconnect</li>
            </ul>
          </section>

          <section className="pt-8 border-t border-white/20">
            <h2 className="text-3xl font-bold mb-4 text-white">5. Contact</h2>
            <p className="text-xl">
              Questions? Email <a href="mailto:business@pragya.ltd" className="underline hover:text-emerald-300">business@pragya.ltd</a>
            </p>
          </section>
        </div>

        <div className="mt-12 text-center">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl rounded-2xl border border-white/30 transition-all duration-300 text-white font-semibold text-lg"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
