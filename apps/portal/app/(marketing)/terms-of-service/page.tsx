import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Terms of Service | Crypto Pay',
  description: 'Terms of Service for Crypto Pay',
}

export default function TermsOfServicePage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-6 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-orange-600">Legal</p>
      <h1 className="font-display mt-3 text-4xl font-semibold text-slate-900">Terms of Service</h1>
      <p className="mt-3 text-sm text-slate-600">Last Updated: February 3, 2026</p>

      <div className="prose prose-slate mt-10 max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">1. Acceptance of Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Welcome to Crypto Pay. By accessing or using our B2B platform for restaurant management 
                and supply ordering (the "Service"), you agree to be bound by these Terms of Service ("Terms"). 
                If you do not agree to these Terms, do not use the Service.
              </p>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms constitute a legally binding agreement between you (the "Customer" or "you") and 
                Crypto Pay ("we," "us," or "our").
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">2. Eligibility</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                To use the Service, you must:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Represent a legitimate business entity</li>
                <li>Have the authority to bind your organization to these Terms</li>
                <li>Provide accurate and complete registration information</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">3. Account Registration</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.1 Account Creation</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You must create an account to use the Service. You agree to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain and update your information</li>
                <li>Keep your login credentials confidential</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">3.2 Account Termination</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account if you violate these Terms or engage in 
                fraudulent, abusive, or illegal activities.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">4. Use of Service</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.1 Permitted Use</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may use the Service for legitimate business purposes, including:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Browsing and ordering restaurant supplies</li>
                <li>Managing restaurant operations</li>
                <li>Communicating with suppliers and support</li>
                <li>Accessing reports and analytics</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">4.2 Prohibited Use</h3>
              <p className="text-slate-700 leading-relaxed mb-4">You agree NOT to:</p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Violate any laws or regulations</li>
                <li>Infringe on intellectual property rights</li>
                <li>Transmit malware, viruses, or harmful code</li>
                <li>Attempt to gain unauthorized access to systems</li>
                <li>Reverse engineer or decompile the Service</li>
                <li>Use automated tools to scrape or harvest data</li>
                <li>Impersonate others or provide false information</li>
                <li>Interfere with the Service's operation</li>
                <li>Resell or redistribute the Service without permission</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">5. Orders and Payments</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.1 Order Placement</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                When you place an order through the Service:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>You are making an offer to purchase the products</li>
                <li>Orders are subject to supplier acceptance and availability</li>
                <li>We reserve the right to refuse or cancel orders</li>
                <li>Prices are subject to change without notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.2 Payment Terms</h3>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Payment is due according to the terms agreed with each supplier</li>
                <li>You are responsible for all applicable taxes and fees</li>
                <li>Late payments may incur interest charges</li>
                <li>We may use third-party payment processors</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">5.3 Cancellations and Refunds</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Cancellation and refund policies are determined by individual suppliers. Contact the supplier 
                directly or use our support system for assistance.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">6. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">6.1 Our Rights</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Service, including all content, features, and functionality, is owned by Crypto Pay 
                and protected by copyright, trademark, and other intellectual property laws.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">6.2 License</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We grant you a limited, non-exclusive, non-transferable license to access and use the Service for 
                your business purposes. This license does not include any resale or commercial use beyond your 
                internal operations.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">6.3 Your Content</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You retain ownership of content you submit to the Service. By submitting content, you grant us a 
                license to use, store, and process it as necessary to provide the Service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">7. Privacy and Data Protection</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                Your use of the Service is also governed by our <Link href="/privacy-policy" className="text-orange-500 hover:text-orange-600 font-medium">Privacy Policy</Link>, 
                which describes how we collect, use, and protect your information.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">8. Third-Party Services</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                The Service may integrate with third-party services (suppliers, payment processors, delivery services). 
                We are not responsible for:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Third-party products, services, or content</li>
                <li>Third-party terms of service or privacy policies</li>
                <li>Availability or performance of third-party services</li>
                <li>Disputes between you and third parties</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">9. Disclaimers and Warranties</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.1 As-Is Service</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, 
                INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND 
                NON-INFRINGEMENT.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">9.2 No Guarantee</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We do not guarantee that:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>The Service will be uninterrupted or error-free</li>
                <li>Defects will be corrected</li>
                <li>The Service is free of viruses or harmful components</li>
                <li>Results from using the Service will meet your requirements</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">10. Limitation of Liability</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RESTAURANT HUB SOLUTION SHALL NOT BE LIABLE FOR:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Indirect, incidental, special, consequential, or punitive damages</li>
                <li>Loss of profits, revenue, data, or use</li>
                <li>Business interruption</li>
                <li>Damages arising from third-party products or services</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim, 
                or $100, whichever is greater.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">11. Indemnification</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                You agree to indemnify, defend, and hold harmless Crypto Pay from any claims, losses, 
                damages, liabilities, and expenses arising from:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any rights of another party</li>
                <li>Your content or activities</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">12. Service Modifications</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We reserve the right to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Modify or discontinue the Service at any time</li>
                <li>Change features, functionality, or pricing</li>
                <li>Perform maintenance and updates</li>
              </ul>
              <p className="text-slate-700 leading-relaxed mb-4">
                We will provide notice of significant changes when feasible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">13. Term and Termination</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">13.1 Term</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms remain in effect while you use the Service.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">13.2 Termination</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Either party may terminate these Terms:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>You may delete your account at any time</li>
                <li>We may suspend or terminate your account for violations</li>
                <li>We may discontinue the Service with notice</li>
              </ul>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">13.3 Effect of Termination</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Upon termination:
              </p>
              <ul className="list-disc pl-6 mb-4 text-slate-700 space-y-2">
                <li>Your right to use the Service ceases immediately</li>
                <li>We may delete your account and data</li>
                <li>Outstanding payment obligations remain</li>
                <li>Provisions that should survive termination will continue (e.g., limitations of liability, indemnification)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">14. Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">14.1 Informal Resolution</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Before filing a claim, contact us at <a href="mailto:support@cryptopay.sale" className="text-orange-500 hover:text-orange-600 font-medium">support@cryptopay.sale</a> to 
                resolve the dispute informally.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">14.2 Governing Law</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">14.3 Arbitration</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Any disputes not resolved informally shall be resolved through binding arbitration, except for claims 
                that may be brought in small claims court.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">15. General Provisions</h2>
              
              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.1 Entire Agreement</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                These Terms, along with our Privacy Policy, constitute the entire agreement between you and us.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.2 Severability</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                If any provision is found unenforceable, the remaining provisions remain in effect.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.3 Waiver</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                Failure to enforce any provision does not constitute a waiver of that provision.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.4 Assignment</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                You may not assign these Terms without our consent. We may assign these Terms to any successor or affiliate.
              </p>

              <h3 className="text-xl font-semibold text-slate-800 mb-3">15.5 Force Majeure</h3>
              <p className="text-slate-700 leading-relaxed mb-4">
                We are not liable for delays or failures caused by events beyond our reasonable control.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">16. Changes to Terms</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                We may update these Terms from time to time. We will notify you of material changes via email or 
                platform notification. Continued use after changes constitutes acceptance of the new Terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">17. Contact Information</h2>
              <p className="text-slate-700 leading-relaxed mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                <p className="text-slate-700 mb-2"><strong>Crypto Pay</strong></p>
                <p className="text-slate-700 mb-2">Email: <a href="mailto:support@cryptopay.sale" className="text-orange-500 hover:text-orange-600 font-medium">support@cryptopay.sale</a></p>
                <p className="text-slate-700">Support: Available through your account dashboard</p>
              </div>
            </section>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-600 text-center">
                By using Crypto Pay, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
              </p>
              <p className="text-sm text-slate-600 text-center mt-2">
                Effective Date: January 27, 2026
              </p>
            </div>
          </div>
    </section>
  )
}
