"use client"

import { motion } from "framer-motion"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import Link from "next/link"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-background/95 to-primary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="max-w-lg w-full text-center p-8" strong>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-primary/10 mb-6"
          >
            <WifiOff className="w-12 h-12 text-primary" />
          </motion.div>

          <h1 className="font-serif text-4xl font-bold mb-4 text-foreground">
            You&apos;re Offline
          </h1>
          <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
            Your internet connection seems to be unavailable. Don&apos;t worry -
            you can still browse some cached content or try reconnecting.
          </p>

          <div className="space-y-4">
            <Button
              variant="default"
              onClick={() => window.location.reload()}
              className="w-full flex items-center gap-2"
              size="lg"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </Button>

            <Link href="/" className="block">
              <Button
                variant="outline"
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              <strong>Arnova</strong> - Premium Fashion E-commerce
            </p>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  )
}
