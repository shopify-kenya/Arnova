"use client"

import { motion } from "framer-motion"
import { RotateCcw, Shield, Clock } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ReturnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Returns & Exchanges</h1>
            <p className="text-muted-foreground">Easy returns within 30 days</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">30 Days</h3>
              <p className="text-muted-foreground">Return window</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <RotateCcw className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Free Returns</h3>
              <p className="text-muted-foreground">No return shipping fees</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Quality Guarantee</h3>
              <p className="text-muted-foreground">100% satisfaction</p>
            </GlassCard>
          </div>

          <GlassCard className="p-8">
            <h2 className="font-semibold text-2xl mb-6">Return Policy</h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <p>We want you to be completely satisfied with your purchase. If you're not happy with your order, you can return it within 30 days of delivery.</p>
              
              <h3>Return Conditions</h3>
              <ul>
                <li>Items must be in original condition with tags attached</li>
                <li>Items must be unworn and unwashed</li>
                <li>Original packaging must be included</li>
                <li>Return must be initiated within 30 days of delivery</li>
              </ul>

              <h3>How to Return</h3>
              <ol>
                <li>Contact our customer service team</li>
                <li>Receive your return authorization and prepaid label</li>
                <li>Package your items securely</li>
                <li>Drop off at any authorized shipping location</li>
              </ol>

              <h3>Refund Processing</h3>
              <p>Refunds are processed within 5-7 business days after we receive your return. The refund will be credited to your original payment method.</p>
            </div>
          </GlassCard>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}