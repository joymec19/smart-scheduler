import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-500 via-indigo-500 to-purple-600 p-8">
      <div className="max-w-3xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl p-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-slate-200 bg-clip-text text-transparent mb-4">
            Terms and Conditions
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Smart Scheduler — Last Updated: March 6, 2026
          </p>
        </div>

        <div className="space-y-8 text-lg leading-relaxed text-white/95">

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">1. Introduction</h2>
            <p className="mb-3">Welcome to <strong>Smart Scheduler</strong> (the "Service").</p>
            <p className="mb-3">
              These Terms and Conditions ("Terms") govern your access to and use of the Smart Scheduler web application available at{' '}
              <a href="https://smart-scheduler-mu.vercel.app/" className="underline hover:text-emerald-300">
                https://smart-scheduler-mu.vercel.app/
              </a>{' '}
              (the "Website").
            </p>
            <p>
              By accessing or using the Website or the Service, you acknowledge that you have read, understood, and agree to be bound by these Terms and by our Privacy Policy. If you do not agree with these Terms, you must not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">2. Definitions</h2>
            <p className="mb-3">
              The following terminology applies to these Terms and Conditions, the Privacy Policy, and all related agreements: "Client", "You" and "Your" refer to you, the user accessing this Website or Service and agreeing to comply with these Terms. "Smart Scheduler", "The Website", "We", "Our" and "Us" refer to the Smart Scheduler web application and its owner, Joydeep Debnath. "Party" refers to either the Client or Ourselves, and "Parties" refers to both the Client and Ourselves together.
            </p>
            <h3 className="text-xl font-semibold mb-2 text-white/90">Eligibility and Acceptance</h3>
            <p className="mb-3">
              You must be at least 18 years old to use the Service. If you are under 18, you may use the Service only with the consent and supervision of a parent or legal guardian, who will be deemed to have accepted these Terms on your behalf.
            </p>
            <p className="mb-3">By creating an account or using the Service, you confirm that:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>You have the legal capacity to enter into a binding agreement.</li>
              <li>All information you provide is accurate and complete.</li>
            </ul>
            <p>We reserve the right to update or revise these Terms at any time. Continued use of the Service after such changes constitutes your acceptance of the updated Terms.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">3. Description of the Service</h2>
            <p className="mb-3">Smart Scheduler is a free web application that helps you:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Create and manage calendar events</li>
              <li>Organize tasks and to-do items</li>
              <li>Set reminders</li>
              <li>Use future features such as calendar integrations and enhancements as and when they are introduced</li>
            </ul>
            <p>We may modify, improve, suspend, or discontinue any part of the Service at any time, with or without notice. The Service is provided as-is and as available, without any guarantee of uptime, availability, or fitness for a particular purpose.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">4. Accounts and Security</h2>
            <p className="mb-3">To use certain features, you may be required to create an account. When you create an account, you agree to:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Provide a valid email address and set a secure password</li>
              <li>Keep your login credentials confidential</li>
              <li>Be responsible for all activities that occur under your account</li>
              <li>Notify us immediately at <a href="mailto:business@pragya.ltd" className="underline hover:text-emerald-300">business@pragya.ltd</a> if you suspect any unauthorized access or security breach</li>
            </ul>
            <p className="mb-3">You agree that you will not:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Share your account with others</li>
              <li>Use false or misleading information</li>
              <li>Create multiple accounts for abuse, fraud, or other prohibited purposes</li>
            </ul>
            <p>We reserve the right to suspend or terminate your account, without prior notice, if we believe you have violated these Terms or engaged in suspicious or unlawful activity.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">5. Acceptable Use</h2>
            <p className="mb-3">You agree to use the Service only for lawful purposes and in accordance with these Terms. You must not:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Use the Service for any illegal, harmful, or fraudulent activity</li>
              <li>Upload, distribute, or transmit any malware, viruses, or harmful code</li>
              <li>Attempt to hack, probe, or gain unauthorized access to any part of the Service, our servers, or related systems</li>
              <li>Scrape, data-mine, or use bots or automated tools except as explicitly permitted</li>
              <li>Harass, threaten, defame, impersonate, or abuse any person or entity</li>
              <li>Collect or process other users' personal data without their explicit consent</li>
              <li>Infringe or violate any intellectual property or other rights of any third party</li>
            </ul>
            <p>We may, at our sole discretion, restrict, suspend, or terminate your access to the Service for any violation of this Acceptable Use section and may also take appropriate legal action where required.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">6. Your Content and Data Ownership</h2>
            <p className="mb-3">You retain ownership of the calendar events, tasks, reminders, and other content you create through the Service ("Your Content").</p>
            <h3 className="text-xl font-semibold mb-2 text-white/90">License to Us</h3>
            <p className="mb-3">
              By using the Service, you grant us a limited, non-exclusive, royalty-free license to store, display, process, and transmit Your Content solely for the purpose of operating, maintaining, and improving the Service. We do not claim ownership over Your Content.
            </p>
            <p className="mb-3">You are responsible for ensuring that Your Content:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Does not infringe any third-party rights (including copyright, trademark, or privacy rights)</li>
              <li>Does not contain defamatory, obscene, or otherwise unlawful material</li>
              <li>Does not advocate or promote any criminal activity</li>
            </ul>
            <p>We reserve the right (but have no obligation) to remove or disable access to any content that we reasonably believe violates these Terms or applicable law.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">7. Privacy and Data Protection</h2>
            <p className="mb-3">We process your personal data in accordance with India's <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and other applicable laws.</p>
            <h3 className="text-xl font-semibold mb-2 text-white/90">Data We May Collect</h3>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Identification data (e.g., email, name)</li>
              <li>Usage data (e.g., device info, IP address, interaction logs)</li>
              <li>Calendar and task information necessary to provide the Service</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 text-white/90">Role as Data Fiduciary</h3>
            <p className="mb-3">We act as a <strong>Data Fiduciary</strong> under the DPDP Act. We collect and use your data:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Only for legitimate purposes related to providing and improving the Service</li>
              <li>Based on your consent or other lawful grounds as applicable</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 text-white/90">Cross-Border Data Transfers</h3>
            <p>
              Your data may be stored or processed on third-party infrastructure (e.g., Vercel, Supabase) located outside India (such as the US or Singapore). We implement reasonable safeguards such as encryption and secure contracts with service providers to protect your data. For more details, please refer to our{' '}
              <Link to="/privacy" className="underline hover:text-emerald-300">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">8. Intellectual Property</h2>
            <h3 className="text-xl font-semibold mb-2 text-white/90">Our Intellectual Property</h3>
            <p className="mb-3">
              The Service, including but not limited to the underlying code, design, logo, branding, and all related materials, is owned by <strong>Smart Scheduler / Joydeep Debnath</strong> and is protected by copyright and other intellectual property laws.
            </p>
            <p className="mb-3">
              Subject to your compliance with these Terms, we grant you a personal, limited, non-exclusive, non-transferable, revocable license to access and use the Service for your own non-commercial purposes.
            </p>
            <p className="mb-3">You must not, without our prior written consent:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Copy, reproduce, modify, or create derivative works of the Service</li>
              <li>Reverse-engineer, decompile, or attempt to extract the source code</li>
              <li>Sell, rent, sub-license, or commercially exploit any part of the Service</li>
            </ul>
            <h3 className="text-xl font-semibold mb-2 text-white/90">Your Intellectual Property</h3>
            <p>You retain ownership of Your Content. Except as needed to operate the Service, we will not use Your Content for any unrelated commercial purpose.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">9. Disclaimers</h2>
            <p className="mb-3">
              To the maximum extent permitted by applicable law, the Service is provided <strong>"as-is"</strong> and <strong>"as available"</strong>, without any warranties of any kind, whether express or implied.
            </p>
            <p className="mb-3">We do not warrant that:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>The Service will be uninterrupted, timely, secure, or error-free</li>
              <li>The Service will meet your specific requirements or expectations</li>
              <li>Any data, content, or information will be accurate, reliable, or free from loss or corruption</li>
              <li>The Service is free of viruses, vulnerabilities, or other harmful components</li>
            </ul>
            <p>Your use of the Service is at your <strong>own risk</strong>. You are solely responsible for backing up your data and for any damage to your devices or loss of data that may result from your use of the Service.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">10. Limitation of Liability</h2>
            <p className="mb-3">To the fullest extent permitted by law, we (including our contributors, affiliates, and service providers) shall not be liable for any:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of data, loss of profits, loss of revenue, or business interruption</li>
              <li>Damages arising from bugs, security breaches, service outages, or interruptions in availability</li>
            </ul>
            <p className="mb-3">
              Our total aggregate liability for any claims arising out of or relating to the Service or these Terms shall be limited to the amount, if any, you have paid for using the Service in the 3 months immediately preceding the claim; since the Service is currently free, this will typically be zero.
            </p>
            <p>Nothing in these Terms is intended to exclude or limit liability where such exclusion or limitation is not permitted under applicable law.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">11. Links, Third-Party Content, and Hyperlinking</h2>
            <p className="mb-3">
              The Website may contain links to third-party websites or services that are not owned or controlled by us. We are not responsible for the content, policies, or practices of any third-party websites. Your use of such sites is at your own risk and subject to their terms and policies.
            </p>
            <p className="mb-3">You may link to our home page or public pages of the Website provided that such link:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>Is not deceptive or misleading</li>
              <li>Does not falsely imply sponsorship, endorsement, or approval</li>
              <li>Does not appear on any website that is libelous, obscene, or criminal, or which infringes or advocates the infringement of any third-party rights</li>
            </ul>
            <p>We reserve the right to request the removal of any link to our Website at our sole discretion, and you agree to remove such links immediately upon request.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">12. Your Rights Under DPDP Act</h2>
            <p className="mb-3">As a <strong>Data Principal</strong> under the DPDP Act, you have the right to:</p>
            <ol className="list-decimal pl-8 space-y-2 mb-3">
              <li><strong>Access</strong> your personal data processed by us</li>
              <li><strong>Correct</strong> inaccurate or incomplete data</li>
              <li><strong>Delete</strong> your personal data, subject to legal or operational requirements</li>
              <li><strong>Withdraw consent</strong> for data processing (which may affect some features)</li>
              <li><strong>File grievances</strong> if you are dissatisfied with how we handle your data</li>
            </ol>
            <p>
              To exercise these rights, you may contact us at{' '}
              <a href="mailto:business@pragya.ltd" className="underline hover:text-emerald-300">business@pragya.ltd</a>{' '}
              or use in-app settings (where available). We will respond within 7–15 days, as required by applicable rules.
            </p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">13. Termination</h2>
            <p className="mb-3">You may stop using Smart Scheduler at any time by ceasing access to the Website or by requesting account deletion via app settings or email.</p>
            <p className="mb-3">We may suspend or terminate your access to the Service, with or without notice, if:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li>You violate these Terms or applicable law</li>
              <li>Your account remains inactive for an extended period</li>
              <li>We decide, in our discretion, to discontinue the Service</li>
            </ul>
            <p className="mb-3">Upon termination:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>Your right to use the Service will cease immediately</li>
              <li>We will delete or anonymize your personal data within a reasonable period (typically within 30 days), except where retention is required by law</li>
              <li>Certain provisions (including those on intellectual property, limitation of liability, and dispute resolution) will survive termination</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">14. Compliance with Indian Law</h2>
            <p className="mb-3">Smart Scheduler operates in accordance with applicable Indian laws, including:</p>
            <ul className="list-disc pl-8 space-y-2 mb-3">
              <li><strong>Information Technology Act, 2000</strong>, and associated rules</li>
              <li><strong>Digital Personal Data Protection Act, 2023</strong></li>
            </ul>
            <p className="mb-3">
              As an "intermediary" under the IT Act, we may remove or disable access to unlawful content when we become aware of it or upon receiving a valid government or court order.
            </p>
            <p>As a <strong>Data Fiduciary</strong> under the DPDP Act, we implement reasonable security safeguards, provide notice of material data breaches where required, and respect your Data Principal rights.</p>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">15. Governing Law and Jurisdiction</h2>
            <p className="mb-3">These Terms shall be governed by and construed in accordance with the laws of <strong>India</strong>.</p>
            <p className="mb-3">In case of any dispute:</p>
            <ol className="list-decimal pl-8 space-y-2">
              <li>We will first attempt to resolve the issue amicably; you may write to us at <a href="mailto:business@pragya.ltd" className="underline hover:text-emerald-300">business@pragya.ltd</a>.</li>
              <li>If informal resolution fails, all disputes shall be subject to the exclusive jurisdiction of the courts of <strong>New Delhi, India</strong>.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">16. Miscellaneous</h2>
            <ul className="list-disc pl-8 space-y-3">
              <li><strong>Entire Agreement:</strong> These Terms together with our Privacy Policy constitute the entire agreement between you and us regarding the Service.</li>
              <li><strong>Severability:</strong> If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</li>
              <li><strong>No Waiver:</strong> Our failure to enforce any right or provision of these Terms will not be deemed a waiver of that right or provision.</li>
              <li><strong>Assignment:</strong> You may not assign or transfer your rights or obligations under these Terms without our prior written consent. We may assign these Terms in connection with a merger, acquisition, or sale of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-3xl font-bold mb-4 text-white">17. Contact and Grievance Officer</h2>
            <p className="mb-4">If you have any questions, concerns, or complaints about these Terms or the Service, you may contact:</p>
            <div className="bg-white/10 rounded-2xl p-6 border border-white/20 space-y-1">
              <p className="font-semibold text-white">Grievance Officer (IT Act &amp; DPDP Act)</p>
              <p>Name: <strong>Joydeep Debnath</strong></p>
              <p>Email: <a href="mailto:business@pragya.ltd" className="underline hover:text-emerald-300">business@pragya.ltd</a></p>
            </div>
            <p className="mt-4">We will acknowledge complaints within 24 hours and aim to resolve them within 15 days, in line with applicable legal requirements.</p>
          </section>

          <section className="pt-8 border-t border-white/20">
            <h2 className="text-3xl font-bold mb-4 text-white">18. Acknowledgment</h2>
            <p className="mb-3">By clicking "I Agree", creating an account, or using Smart Scheduler, you confirm that:</p>
            <ul className="list-disc pl-8 space-y-2">
              <li>You have read and understood these Terms</li>
              <li>You agree to be bound by them</li>
              <li>You consent to the processing of your data as described</li>
              <li>You are 18+ or have valid parental/guardian consent</li>
            </ul>
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
