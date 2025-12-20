"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" disabled>
        <Monitor className="h-5 w-5" />
      </Button>
    )
  }

  const cycleTheme = () => {
    if (theme === "system") {
      setTheme("dark")
    } else if (theme === "dark") {
      setTheme("light")
    } else {
      setTheme("system")
    }
  }

  const getIcon = () => {
    switch (theme) {
      case "dark":
        return <Moon className="h-5 w-5" />
      case "light":
        return <Sun className="h-5 w-5" />
      default:
        return <Monitor className="h-5 w-5" />
    }
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      className="transition-all duration-200 hover:scale-110"
      title={`Current theme: ${theme}. Click to cycle through themes.`}
    >
      {getIcon()}
    </Button>
  )
}
