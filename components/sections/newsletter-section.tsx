"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function NewsletterSection() {
  return (
    <section className="py-24 bg-gradient-to-r from-accent/10 via-accent/5 to-background">
      <div className="container mx-auto px-4">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Subscribe to the newsletter
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            That gives you the latest Fashion Items & Events
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Button
              asChild
              size="lg"
              className="group rounded-full px-6 sm:px-8 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link href="/register">
                Join Now
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
