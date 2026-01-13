"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="text-muted-foreground">
              Terms and conditions for using our service
            </p>
          </div>

          <GlassCard className="p-8 space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  1. Acceptance of Terms
                </h2>
                <p className="mb-4">
                  By accessing and using the Arnova website ("Service"), you
                  accept and agree to be bound by the terms and provision of
                  this agreement. If you do not agree to abide by the above,
                  please do not use this service.
                </p>
                <p>
                  These Terms of Service ("Terms") govern your use of our
                  website located at arnova.com (the "Service") operated by
                  Arnova ("us", "we", or "our").
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  2. Description of Service
                </h2>
                <p className="mb-4">
                  Arnova is an e-commerce platform specializing in premium
                  fashion, clothing, shoes, bags, and accessories. We provide a
                  digital marketplace where users can browse, purchase, and
                  receive fashion items.
                </p>
                <p>
                  Our services include but are not limited to: product catalog
                  browsing, secure payment processing, order management,
                  customer support, and delivery coordination.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  3. User Accounts
                </h2>
                <p className="mb-4">
                  To access certain features of our Service, you must register
                  for an account. You are responsible for maintaining the
                  confidentiality of your account credentials and for all
                  activities that occur under your account.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    You must provide accurate and complete information when
                    creating an account
                  </li>
                  <li>
                    You must be at least 18 years old to create an account
                  </li>
                  <li>You are responsible for keeping your password secure</li>
                  <li>
                    You must notify us immediately of any unauthorized use of
                    your account
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  4. Orders and Payments
                </h2>
                <p className="mb-4">
                  When you place an order through our Service, you are making an
                  offer to purchase products at the listed price. We reserve the
                  right to accept or decline your order for any reason.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>All prices are subject to change without notice</li>
                  <li>Payment must be received before order processing</li>
                  <li>
                    We accept major credit cards and secure payment methods
                  </li>
                  <li>Orders are subject to product availability</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  5. Shipping and Delivery
                </h2>
                <p className="mb-4">
                  We will make every effort to deliver products within the
                  estimated timeframe. However, delivery times are estimates and
                  not guaranteed.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Shipping costs are calculated at checkout</li>
                  <li>
                    International shipping may be subject to customs duties
                  </li>
                  <li>Risk of loss passes to you upon delivery</li>
                  <li>
                    We are not responsible for delays caused by shipping
                    carriers
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  6. Returns and Refunds
                </h2>
                <p className="mb-4">
                  We want you to be completely satisfied with your purchase.
                  Items may be returned within 30 days of delivery for a full
                  refund, subject to our return policy.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    Items must be in original condition with tags attached
                  </li>
                  <li>Custom or personalized items cannot be returned</li>
                  <li>
                    Return shipping costs are the responsibility of the customer
                  </li>
                  <li>Refunds will be processed within 5-10 business days</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  7. Intellectual Property
                </h2>
                <p className="mb-4">
                  The Service and its original content, features, and
                  functionality are and will remain the exclusive property of
                  Arnova and its licensors. The Service is protected by
                  copyright, trademark, and other laws.
                </p>
                <p>
                  You may not reproduce, distribute, modify, create derivative
                  works of, publicly display, publicly perform, republish,
                  download, store, or transmit any of the material on our
                  Service without prior written consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  8. User Conduct
                </h2>
                <p className="mb-4">You agree not to use the Service to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Violate any applicable laws or regulations</li>
                  <li>
                    Transmit any harmful, threatening, or offensive content
                  </li>
                  <li>Impersonate any person or entity</li>
                  <li>Interfere with or disrupt the Service or servers</li>
                  <li>
                    Attempt to gain unauthorized access to any part of the
                    Service
                  </li>
                  <li>
                    Use the Service for any commercial purpose without our
                    consent
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  9. Privacy Policy
                </h2>
                <p className="mb-4">
                  Your privacy is important to us. Our Privacy Policy explains
                  how we collect, use, and protect your information when you use
                  our Service. By using our Service, you agree to the collection
                  and use of information in accordance with our Privacy Policy.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  10. Disclaimers
                </h2>
                <p className="mb-4">
                  The information on this website is provided on an "as-is"
                  basis. To the fullest extent permitted by law, Arnova excludes
                  all representations, warranties, conditions, and terms.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>
                    We do not warrant that the Service will be uninterrupted or
                    error-free
                  </li>
                  <li>
                    We do not warrant the accuracy or completeness of product
                    information
                  </li>
                  <li>We disclaim all warranties, express or implied</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  11. Limitation of Liability
                </h2>
                <p className="mb-4">
                  In no event shall Arnova, its directors, employees, partners,
                  agents, suppliers, or affiliates be liable for any indirect,
                  incidental, special, consequential, or punitive damages,
                  including without limitation, loss of profits, data, use,
                  goodwill, or other intangible losses.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  12. Indemnification
                </h2>
                <p className="mb-4">
                  You agree to defend, indemnify, and hold harmless Arnova and
                  its licensee and licensors, and their employees, contractors,
                  agents, officers and directors, from and against any and all
                  claims, damages, obligations, losses, liabilities, costs or
                  debt, and expenses (including but not limited to attorney's
                  fees).
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  13. Termination
                </h2>
                <p className="mb-4">
                  We may terminate or suspend your account and bar access to the
                  Service immediately, without prior notice or liability, under
                  our sole discretion, for any reason whatsoever and without
                  limitation, including but not limited to a breach of the
                  Terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  14. Governing Law
                </h2>
                <p className="mb-4">
                  These Terms shall be interpreted and governed by the laws of
                  the jurisdiction in which Arnova operates, without regard to
                  its conflict of law provisions. Our failure to enforce any
                  right or provision of these Terms will not be considered a
                  waiver of those rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  15. Changes to Terms
                </h2>
                <p className="mb-4">
                  We reserve the right, at our sole discretion, to modify or
                  replace these Terms at any time. If a revision is material, we
                  will provide at least 30 days notice prior to any new terms
                  taking effect.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  16. Contact Information
                </h2>
                <p className="mb-4">
                  If you have any questions about these Terms of Service, please
                  contact us at:
                </p>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> legal@arnova.com
                  </p>
                  <p>
                    <strong>Address:</strong> Arnova Legal Department
                  </p>
                  <p>
                    <strong>Phone:</strong> +254 710 973221
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
