"use client"

import { motion } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { GlassCard } from "@/components/glass-card"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    )
  }

  const faqs = [
    {
      question: "What is your return policy?",
      answer:
        "We offer a 30-day return policy for all items in original condition with tags attached.",
    },
    {
      question: "How long does shipping take?",
      answer:
        "Standard shipping takes 5-7 business days, express shipping takes 2-3 business days.",
    },
    {
      question: "Do you ship internationally?",
      answer:
        "Yes, we ship worldwide. International shipping rates and times vary by location.",
    },
    {
      question: "How can I track my order?",
      answer:
        "You'll receive a tracking number via email once your order ships. You can track it on our website or the carrier's site.",
    },
    {
      question: "What payment methods do you accept?",
      answer:
        "We accept all major credit cards, PayPal, Apple Pay, and Google Pay.",
    },
  ]

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
              Frequently Asked Questions
            </h1>
            <p className="text-muted-foreground">
              Find answers to common questions
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <GlassCard key={index} className="overflow-hidden">
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full p-6 text-left flex justify-between items-center hover:bg-accent/50 transition-colors"
                >
                  <h3 className="font-semibold text-lg">{faq.question}</h3>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${openItems.includes(index) ? "rotate-180" : ""}`}
                  />
                </button>
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-6 pb-6"
                  >
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </motion.div>
                )}
              </GlassCard>
            ))}
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}
