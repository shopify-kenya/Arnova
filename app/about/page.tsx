"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function AboutPage() {
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
            <h1 className="font-serif text-4xl font-bold mb-4">About Arnova</h1>
            <p className="text-muted-foreground">Premium fashion for the modern individual</p>
          </div>

          <GlassCard className="p-8 mb-8">
            <h2 className="font-semibold text-2xl mb-4">Our Story</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Founded with a passion for quality and style, Arnova represents the perfect blend of contemporary fashion and timeless elegance. We believe that great style should be accessible to everyone, which is why we carefully curate our collections to offer premium pieces at fair prices.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              From our carefully selected fabrics to our attention to detail in every stitch, we're committed to delivering exceptional quality that stands the test of time.
            </p>
          </GlassCard>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlassCard className="p-6 text-center">
              <h3 className="font-semibold text-xl mb-2">Quality First</h3>
              <p className="text-muted-foreground">Premium materials and craftsmanship in every piece</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <h3 className="font-semibold text-xl mb-2">Sustainable</h3>
              <p className="text-muted-foreground">Committed to ethical and sustainable fashion practices</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <h3 className="font-semibold text-xl mb-2">Customer Focus</h3>
              <p className="text-muted-foreground">Exceptional service and satisfaction guaranteed</p>
            </GlassCard>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}