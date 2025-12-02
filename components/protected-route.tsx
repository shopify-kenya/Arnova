"use client"

import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { motion } from "framer-motion"
import { Lock } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
  redirectTo?: string
}

export function ProtectedRoute({ children, requireAdmin = false, redirectTo = "/login" }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push(redirectTo)
      return
    }

    if (requireAdmin && !isAdmin) {
      router.push("/")
      return
    }
  }, [isAuthenticated, isAdmin, requireAdmin, router, redirectTo])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="max-w-md w-full text-center p-8">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-4">Authentication Required</h1>
            <p className="text-muted-foreground mb-6">Please log in to access this page.</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Go to Login
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <GlassCard className="max-w-md w-full text-center p-8">
            <Lock className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="font-serif text-2xl font-bold mb-4">Admin Access Required</h1>
            <p className="text-muted-foreground mb-6">You don't have permission to access this page.</p>
            <Button onClick={() => router.push("/")} className="w-full">
              Go Home
            </Button>
          </GlassCard>
        </motion.div>
      </div>
    )
  }

  return <>{children}</>
}