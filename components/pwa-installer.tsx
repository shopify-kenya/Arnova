"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)

  useEffect(() => {
    const handler = (e: Event) => {
      // Prevent the default browser install prompt
      e.preventDefault()
      // Store the event for later use
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handler)

    return () => window.removeEventListener("beforeinstallprompt", handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      if (outcome === "accepted") {
        console.log("PWA installation accepted")
      } else {
        console.log("PWA installation dismissed")
      }
    } catch (error) {
      console.log("PWA installation error:", error)
    }

    // Clean up
    setDeferredPrompt(null)
    setShowInstallPrompt(false)
  }

  // Only show the install button when we have a deferred prompt
  if (!showInstallPrompt || !deferredPrompt) return null

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleInstall}
      className="relative"
      title="Install App"
    >
      <Download className="h-5 w-5" />
    </Button>
  )
}
