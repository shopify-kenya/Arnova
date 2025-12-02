"use client"

import { motion } from "framer-motion"
import { Truck, Clock, Globe } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function ShippingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Shipping Information</h1>
            <p className="text-muted-foreground">Fast and reliable delivery worldwide</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <GlassCard className="p-6 text-center">
              <Truck className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Free Shipping</h3>
              <p className="text-muted-foreground">On orders over $100</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <Clock className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Fast Delivery</h3>
              <p className="text-muted-foreground">2-5 business days</p>
            </GlassCard>
            <GlassCard className="p-6 text-center">
              <Globe className="w-12 h-12 text-primary mx-auto mb-4" />
              <h3 className="font-semibold text-xl mb-2">Worldwide</h3>
              <p className="text-muted-foreground">International shipping available</p>
            </GlassCard>
          </div>

          <GlassCard className="p-8">
            <h2 className="font-semibold text-2xl mb-6">Shipping Rates & Times</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <h3 className="font-medium">Standard Shipping</h3>
                  <p className="text-sm text-muted-foreground">5-7 business days</p>
                </div>
                <span className="font-semibold">$5.99</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-border">
                <div>
                  <h3 className="font-medium">Express Shipping</h3>
                  <p className="text-sm text-muted-foreground">2-3 business days</p>
                </div>
                <span className="font-semibold">$12.99</span>
              </div>
              <div className="flex justify-between items-center py-3">
                <div>
                  <h3 className="font-medium">Overnight Shipping</h3>
                  <p className="text-sm text-muted-foreground">1 business day</p>
                </div>
                <span className="font-semibold">$24.99</span>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}