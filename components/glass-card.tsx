"use client"


import type React from "react"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface GlassCardProps {
  children: React.ReactNode
  className?: string
  hover?: boolean
  strong?: boolean
}

export function GlassCard({ children, className, hover = true, strong = false }: GlassCardProps) {
  return (
    <motion.div
      className={cn(
        "rounded-2xl",
        strong ? "glass-strong" : "glass",
        hover && "transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}
