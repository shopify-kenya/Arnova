"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FinalCTASection() {
  return (
    <section className="py-24 bg-gradient-to-br from-background via-muted/10 to-background">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Futuristic designs inspired by technology
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join the creative community and discover premium fashion that
            defines the future
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              asChild
              size="lg"
              className="group bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link href="/clothing">
                Explore Collection
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/about">Our Story</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
