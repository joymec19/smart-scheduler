export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 to-indigo-600 p-8 text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Privacy Policy — Smart Scheduler</h1>
        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2>What data we collect</h2>
            <ul>
              <li>Your tasks, notes, and completion history (stored in Supabase)</li>
              <li>Google Calendar events (if sync enabled)</li>
              <li>Anonymous analytics (Mixpanel)</li>
            </ul>
          </section>
          <section>
            <h2>How we use it</h2>
            <p>Only to provide task management, nudges, and analytics. Never sold or shared.</p>
          </section>
          <section>
            <h2>Delete your data</h2>
            <p>Settings → Data Export/Delete removes everything permanently.</p>
          </section>
          <section>
            <h2>Contact</h2>
            <p>joydeepdebnath89@gmail.com</p>
          </section>
        </div>
      </div>
    </div>
  );
}
