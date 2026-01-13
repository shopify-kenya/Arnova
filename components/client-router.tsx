"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export function ClientRouter() {
  const router = useRouter()

  useEffect(() => {
    // Check if we have an initial path from the server
    if (typeof window !== "undefined" && (window as any).__INITIAL_PATH__) {
      const initialPath = (window as any).__INITIAL_PATH__
      if (initialPath !== "/" && window.location.pathname === "/") {
        router.push(initialPath)
      }
    }
  }, [router])

  return null
}
