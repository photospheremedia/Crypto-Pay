import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | Crypto Pay',
  description: 'Privacy Policy for Crypto Pay',
}

export default function PrivacyPolicyPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Legal</p>
      <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">Privacy Policy</h1>
      <p className="mt-3 text-sm text-slate-600">Last Updated: February 3, 2026</p>

      <div className="prose prose-slate mt-10 max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Introduction</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Welcome to Crypto Pay ("we," "our," or "us"). We are committed to protecting your personal 
                information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and 
                safeguard your information when you use our B2B platform for business management and supply ordering.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Account Information:</strong> Name, email address, company name, phone number</li>
                <li><strong>Business Information:</strong> Business details, business type, tax ID, billing information</li>
                <li><strong>Order Information:</strong> Purchase orders, quotes, delivery preferences</li>
                <li><strong>Communication Data:</strong> Support tickets, messages, feedback</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">2.2 Automatically Collected Information</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Usage Data:</strong> Pages visited, features used, time spent on platform</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system</li>
                <li><strong>Cookies:</strong> Session cookies, preference cookies, analytics cookies</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Provide, maintain, and improve our services</li>
                <li>Process your orders and manage your account</li>
                <li>Send you order confirmations, invoices, and updates</li>
                <li>Respond to your support requests and communications</li>
                <li>Send marketing communications (with your consent)</li>
                <li>Analyze usage patterns to improve our platform</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Information Sharing and Disclosure</h2>
              <p className="text-slate-700 leading-relaxed mb-4">We may share your information with:</p>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Service Providers</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We work with third-party service providers for hosting (Vercel), authentication (Supabase), 
                payment processing, analytics, and customer support. These providers have access only to information 
                needed to perform their services.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Business Transfers</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                In the event of a merger, acquisition, or sale of assets, your information may be transferred to 
                the acquiring entity.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.3 Legal Requirements</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may disclose your information if required by law, court order, or to protect our rights, 
                property, or safety.
              </p>

              <p className="text-slate-700 leading-relaxed mb-4">
                <strong>We do not sell your personal information to third parties.</strong>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Data Security</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We implement industry-standard security measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Data encryption in transit (SSL/TLS) and at rest</li>
                <li>Secure authentication with OAuth 2.0</li>
                <li>Regular security audits and monitoring</li>
                <li>Access controls and role-based permissions</li>
                <li>Secure cloud infrastructure (Vercel, Supabase)</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                However, no method of transmission over the internet is 100% secure. While we strive to protect 
                your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-slate-700 leading-relaxed mb-4">You have the right to:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and data</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Data Portability:</strong> Request your data in a structured format</li>
                <li><strong>Restrict Processing:</strong> Limit how we use your information</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                To exercise these rights, contact us at <a href="mailto:support@cryptopay.sale" className="text-orange-500 hover:text-orange-600 font-medium">support@cryptopay.sale</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Data Retention</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We retain your information for as long as your account is active or as needed to provide services. 
                After account deletion, we may retain certain information for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Legal compliance (tax records, transaction history)</li>
                <li>Fraud prevention and security</li>
                <li>Dispute resolution</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                Retention periods vary by data type and legal requirements.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Cookies and Tracking</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li><strong>Essential Cookies:</strong> Required for platform functionality</li>
                <li><strong>Preference Cookies:</strong> Remember your settings</li>
                <li><strong>Analytics Cookies:</strong> Understand usage patterns</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                You can control cookies through your browser settings, but disabling them may affect functionality.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Third-Party Links</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our platform may contain links to third-party websites (suppliers, partners). We are not responsible 
                for their privacy practices. Please review their privacy policies separately.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Children's Privacy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our services are designed for businesses and are not intended for individuals under 18. We do not 
                knowingly collect information from children.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. International Data Transfers</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your information may be transferred to and processed in countries other than your own. We ensure 
                appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Changes to This Policy</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update this Privacy Policy from time to time. We will notify you of significant changes via 
                email or platform notification. Continued use of our services after changes constitutes acceptance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Contact Us</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you have questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-700 mb-2"><strong>Crypto Pay</strong></p>
                <p className="text-slate-700 mb-2">Email: <a href="mailto:support@cryptopay.sale" className="text-orange-500 hover:text-orange-600 font-medium">support@cryptopay.sale</a></p>
                <p className="text-slate-700">Support: Available through your account dashboard</p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. California Privacy Rights (CCPA)</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are a California resident, you have additional rights under the California Consumer Privacy Act (CCPA):
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Right to know what personal information is collected</li>
                <li>Right to know if personal information is sold or disclosed</li>
                <li>Right to opt-out of the sale of personal information</li>
                <li>Right to deletion</li>
                <li>Right to non-discrimination for exercising your rights</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. GDPR Compliance (EU/EEA)</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                If you are located in the European Union or European Economic Area, you have rights under the 
                General Data Protection Regulation (GDPR):
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Legal basis for processing (contract performance, legitimate interests, consent)</li>
                <li>Right to lodge a complaint with a supervisory authority</li>
                <li>Right to object to processing</li>
                <li>Automated decision-making and profiling information</li>
              </ul>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-600 text-center">
                This Privacy Policy is effective as of January 27, 2026
              </p>
            </div>
          </div>
    </section>
  )
}
