"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">
              Privacy Policy
            </h1>
            <p className="text-muted-foreground">
              How we protect your information
            </p>
          </div>

          <GlassCard className="p-8 space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  1. Introduction
                </h2>
                <p className="mb-4">
                  At Arnova, we are committed to protecting your privacy and
                  ensuring the security of your personal information. This
                  Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website or use
                  our services.
                </p>
                <p>
                  By using our Service, you agree to the collection and use of
                  information in accordance with this policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  2. Information We Collect
                </h2>
                <h3 className="text-lg font-semibold mb-3">
                  Personal Information
                </h3>
                <p className="mb-4">
                  We may collect the following personal information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Name, email address, and contact information</li>
                  <li>Billing and shipping addresses</li>
                  <li>
                    Payment information (processed securely by third-party
                    providers)
                  </li>
                  <li>Account credentials and preferences</li>
                  <li>Purchase history and order information</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">
                  Automatically Collected Information
                </h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Pages visited and time spent on our site</li>
                  <li>Referring website information</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  3. How We Use Your Information
                </h2>
                <p className="mb-4">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Processing and fulfilling your orders</li>
                  <li>
                    Providing customer support and responding to inquiries
                  </li>
                  <li>Personalizing your shopping experience</li>
                  <li>Sending marketing communications (with your consent)</li>
                  <li>Improving our website and services</li>
                  <li>Preventing fraud and ensuring security</li>
                  <li>Complying with legal obligations</li>
                  <li>Analyzing usage patterns and trends</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  4. Information Sharing and Disclosure
                </h2>
                <p className="mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    <strong>Service Providers:</strong> Third-party companies
                    that help us operate our business
                  </li>
                  <li>
                    <strong>Payment Processors:</strong> Secure payment
                    processing services
                  </li>
                  <li>
                    <strong>Shipping Partners:</strong> Delivery and logistics
                    companies
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> When required by law or
                    to protect our rights
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In connection with
                    mergers or acquisitions
                  </li>
                  <li>
                    <strong>Consent:</strong> When you have given explicit
                    permission
                  </li>
                </ul>
                <p>
                  We do not sell your personal information to third parties for
                  marketing purposes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  5. Cookies and Tracking Technologies
                </h2>
                <p className="mb-4">
                  We use cookies and similar technologies to:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Remember your preferences and settings</li>
                  <li>Analyze website traffic and usage patterns</li>
                  <li>Provide personalized content and advertisements</li>
                  <li>Improve website functionality and user experience</li>
                  <li>Prevent fraud and enhance security</li>
                </ul>
                <p>
                  You can control cookie settings through your browser
                  preferences. See our Cookie Policy for more details.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  6. Data Security
                </h2>
                <p className="mb-4">
                  We implement comprehensive security measures to protect your
                  information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>SSL encryption for data transmission</li>
                  <li>Secure servers and databases</li>
                  <li>Regular security audits and updates</li>
                  <li>Access controls and authentication</li>
                  <li>Employee training on data protection</li>
                  <li>Incident response procedures</li>
                </ul>
                <p>
                  However, no method of transmission over the internet is 100%
                  secure, and we cannot guarantee absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  7. Your Rights and Choices
                </h2>
                <p className="mb-4">
                  You have the following rights regarding your personal
                  information:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    <strong>Access:</strong> Request a copy of your personal
                    information
                  </li>
                  <li>
                    <strong>Correction:</strong> Update or correct inaccurate
                    information
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal
                    information
                  </li>
                  <li>
                    <strong>Portability:</strong> Receive your data in a
                    portable format
                  </li>
                  <li>
                    <strong>Opt-out:</strong> Unsubscribe from marketing
                    communications
                  </li>
                  <li>
                    <strong>Restriction:</strong> Limit how we process your
                    information
                  </li>
                </ul>
                <p>
                  To exercise these rights, please contact us at
                  privacy@arnova.com.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  8. Data Retention
                </h2>
                <p className="mb-4">
                  We retain your personal information for as long as necessary
                  to fulfill the purposes outlined in this policy, unless a
                  longer retention period is required by law. Factors we
                  consider include:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>The nature of the information collected</li>
                  <li>Legal and regulatory requirements</li>
                  <li>Business and operational needs</li>
                  <li>Your relationship with us</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  9. International Data Transfers
                </h2>
                <p className="mb-4">
                  Your information may be transferred to and processed in
                  countries other than your own. We ensure appropriate
                  safeguards are in place to protect your information during
                  international transfers, including:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Standard contractual clauses</li>
                  <li>Binding corporate rules</li>
                  <li>Certification schemes</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  10. Children's Privacy
                </h2>
                <p className="mb-4">
                  Our services are not intended for children under 13 years of
                  age. We do not knowingly collect personal information from
                  children under 13. If we become aware that we have collected
                  personal information from a child under 13, we will take steps
                  to delete such information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  11. Third-Party Links
                </h2>
                <p className="mb-4">
                  Our website may contain links to third-party websites. We are
                  not responsible for the privacy practices of these external
                  sites. We encourage you to review the privacy policies of any
                  third-party sites you visit.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  12. Changes to This Policy
                </h2>
                <p className="mb-4">
                  We may update this Privacy Policy from time to time. We will
                  notify you of any material changes by posting the new policy
                  on this page and updating the "Last Updated" date. We
                  encourage you to review this policy periodically.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  13. Contact Information
                </h2>
                <p className="mb-4">
                  If you have questions about this Privacy Policy, please
                  contact us:
                </p>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> privacy@arnova.com
                  </p>
                  <p>
                    <strong>Address:</strong> Arnova Privacy Officer
                  </p>
                  <p>
                    <strong>Phone:</strong> +254 710 973221
                  </p>
                  <p>
                    <strong>Data Protection Officer:</strong> dpo@arnova.com
                  </p>
                </div>
              </section>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  <strong>Last updated:</strong> December 2024
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
