"use client"


import { motion } from "framer-motion"
import { WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <GlassCard className="max-w-md w-full text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6"
          >
            <WifiOff className="w-10 h-10 text-primary" />
          </motion.div>

          <h1 className="font-podkova text-3xl font-bold mb-4">You're Offline</h1>
          <p className="text-muted-foreground mb-6">
            It looks like you've lost your internet connection. Please check your network and try again.
          </p>

          <Button onClick={() => window.location.reload()} className="w-full">
            Try Again
          </Button>
        </GlassCard>
      </motion.div>
    </div>
  )
}
