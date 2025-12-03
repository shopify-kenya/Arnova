"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
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

          <GlassCard className="p-8">
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <h2>Acceptance of Terms</h2>
              <p>
                By accessing and using this website, you accept and agree to be
                bound by the terms and provision of this agreement.
              </p>

              <h2>Use License</h2>
              <p>
                Permission is granted to temporarily download one copy of the
                materials on Arnova's website for personal, non-commercial
                transitory viewing only.
              </p>

              <h2>Disclaimer</h2>
              <p>
                The materials on Arnova's website are provided on an 'as is'
                basis. Arnova makes no warranties, expressed or implied.
              </p>

              <h2>Limitations</h2>
              <p>
                In no event shall Arnova or its suppliers be liable for any
                damages arising out of the use or inability to use the materials
                on Arnova's website.
              </p>

              <h2>Governing Law</h2>
              <p>
                These terms and conditions are governed by and construed in
                accordance with the laws of the jurisdiction in which Arnova
                operates.
              </p>
            </div>
          </GlassCard>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
