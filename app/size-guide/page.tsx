"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function SizeGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold mb-4">Size Guide</h1>
            <p className="text-muted-foreground">Find your perfect fit</p>
          </div>

          <div className="space-y-8">
            <GlassCard className="p-8">
              <h2 className="font-semibold text-2xl mb-6">Clothing Sizes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">Size</th>
                      <th className="text-left py-2">Chest (inches)</th>
                      <th className="text-left py-2">Waist (inches)</th>
                      <th className="text-left py-2">Hip (inches)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">XS</td>
                      <td className="py-2">32-34</td>
                      <td className="py-2">26-28</td>
                      <td className="py-2">34-36</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">S</td>
                      <td className="py-2">34-36</td>
                      <td className="py-2">28-30</td>
                      <td className="py-2">36-38</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">M</td>
                      <td className="py-2">36-38</td>
                      <td className="py-2">30-32</td>
                      <td className="py-2">38-40</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">L</td>
                      <td className="py-2">38-40</td>
                      <td className="py-2">32-34</td>
                      <td className="py-2">40-42</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">XL</td>
                      <td className="py-2">40-42</td>
                      <td className="py-2">34-36</td>
                      <td className="py-2">42-44</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>

            <GlassCard className="p-8">
              <h2 className="font-semibold text-2xl mb-6">Shoe Sizes</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2">US</th>
                      <th className="text-left py-2">UK</th>
                      <th className="text-left py-2">EU</th>
                      <th className="text-left py-2">Length (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">6</td>
                      <td className="py-2">5.5</td>
                      <td className="py-2">39</td>
                      <td className="py-2">24.1</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">7</td>
                      <td className="py-2">6.5</td>
                      <td className="py-2">40</td>
                      <td className="py-2">24.8</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">8</td>
                      <td className="py-2">7.5</td>
                      <td className="py-2">41</td>
                      <td className="py-2">25.4</td>
                    </tr>
                    <tr className="border-b border-border/50">
                      <td className="py-2 font-medium">9</td>
                      <td className="py-2">8.5</td>
                      <td className="py-2">42</td>
                      <td className="py-2">26.0</td>
                    </tr>
                    <tr>
                      <td className="py-2 font-medium">10</td>
                      <td className="py-2">9.5</td>
                      <td className="py-2">43</td>
                      <td className="py-2">26.7</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}