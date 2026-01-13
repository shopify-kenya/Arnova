"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="text-muted-foreground">
              How we use cookies and similar technologies
            </p>
          </div>

          <GlassCard className="p-8 space-y-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  1. What Are Cookies?
                </h2>
                <p className="mb-4">
                  Cookies are small text files that are placed on your device
                  when you visit our website. They are widely used to make
                  websites work more efficiently and provide information to
                  website owners about how users interact with their sites.
                </p>
                <p>
                  Cookies can be &quot;persistent&quot; or &quot;session&quot;
                  cookies. Persistent cookies remain on your device when you go
                  offline, while session cookies are deleted as soon as you
                  close your web browser.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  2. Types of Cookies We Use
                </h2>

                <h3 className="text-lg font-semibold mb-3">
                  Essential Cookies
                </h3>
                <p className="mb-4">
                  These cookies are necessary for the website to function
                  properly. They enable core functionality such as security,
                  network management, and accessibility.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Authentication cookies</li>
                  <li>Security cookies</li>
                  <li>Shopping cart cookies</li>
                  <li>Load balancing cookies</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">
                  Performance Cookies
                </h3>
                <p className="mb-4">
                  These cookies collect information about how visitors use our
                  website, such as which pages are visited most often and if
                  users get error messages.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Google Analytics cookies</li>
                  <li>Page load time tracking</li>
                  <li>Error reporting cookies</li>
                  <li>A/B testing cookies</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">
                  Functionality Cookies
                </h3>
                <p className="mb-4">
                  These cookies allow the website to remember choices you make
                  and provide enhanced, more personal features.
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Language preference cookies</li>
                  <li>Currency selection cookies</li>
                  <li>Theme preference cookies</li>
                  <li>Recently viewed items</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  3. Managing Your Cookie Preferences
                </h2>
                <p className="mb-4">
                  You have several options for managing cookies:
                </p>

                <h3 className="text-lg font-semibold mb-3">Browser Settings</h3>
                <p className="mb-4">
                  Most web browsers allow you to control cookies through their
                  settings:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete cookies when you close your browser</li>
                  <li>Allow cookies from specific websites</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4 text-primary">
                  4. Contact Us
                </h2>
                <p className="mb-4">
                  If you have any questions about our use of cookies, please
                  contact us:
                </p>
                <div className="bg-muted/20 p-4 rounded-lg">
                  <p>
                    <strong>Email:</strong> cookies@arnova.com
                  </p>
                  <p>
                    <strong>Privacy Team:</strong> privacy@arnova.com
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
