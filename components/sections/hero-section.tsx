"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState, useEffect } from "react"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

function TypewriterText({ texts }: { texts: string[] }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [currentCharIndex, setCurrentCharIndex] = useState(0)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentText = texts[currentTextIndex]

    if (!isDeleting && currentCharIndex < currentText.length) {
      const timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, currentCharIndex + 1))
        setCurrentCharIndex(currentCharIndex + 1)
      }, 50)
      return () => clearTimeout(timer)
    } else if (!isDeleting && currentCharIndex === currentText.length) {
      const timer = setTimeout(() => setIsDeleting(true), 1500)
      return () => clearTimeout(timer)
    } else if (isDeleting && currentCharIndex > 0) {
      const timer = setTimeout(() => {
        setDisplayText(currentText.slice(0, currentCharIndex - 1))
        setCurrentCharIndex(currentCharIndex - 1)
      }, 30)
      return () => clearTimeout(timer)
    } else if (isDeleting && currentCharIndex === 0) {
      setIsDeleting(false)
      setCurrentTextIndex((currentTextIndex + 1) % texts.length)
    }
  }, [currentCharIndex, currentTextIndex, texts, isDeleting])

  return (
    <span className="bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  )
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="absolute inset-0 bg-[url('/premium-clothing-fashion.jpg')] bg-cover bg-center opacity-10" />
      <div className="container mx-auto px-4 z-10">
        <motion.div
          className="text-center max-w-5xl mx-auto"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          <motion.div variants={fadeInUp}>
            <Badge
              variant="secondary"
              className="mb-6 text-sm font-medium px-4 py-2"
            >
              ✨ Contemporary and urban energy
            </Badge>
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight"
            variants={fadeInUp}
          >
            <TypewriterText
              texts={[
                "Street Vibes",
                "Urban Edge",
                "Fresh Drops",
                "Style Goals",
                "Next Level",
                "Pure Fire",
              ]}
            />
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
            variants={fadeInUp}
          >
            Discover the choice of creative people. Premium fashion with
            eco-friendly materials and futuristic designs inspired by
            technology.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            variants={fadeInUp}
          >
            <Button
              asChild
              size="lg"
              className="group px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <Link href="/store">
                Shop Now
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg rounded-full"
            >
              <Link href="/clothing">View All</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
