"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { User } from "@/lib/auth"
import {
  getCurrentUser,
  setCurrentUser as saveUser,
  logout as performLogout,
  checkAuthStatus,
  hasToken,
} from "@/lib/auth"

interface AuthContextType {
  user: User | null
  setUser: (user: User | null) => void
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // First check localStorage
    const currentUser = getCurrentUser()
    if (currentUser) {
      setUserState(currentUser)
      return
    }
    if (hasToken()) {
      checkAuthStatus().then(sessionUser => {
        if (sessionUser) {
          setUserState(sessionUser)
        }
      })
    }
  }, [])

  const setUser = (user: User | null) => {
    setUserState(user)
    saveUser(user)
  }

  const logout = () => {
    performLogout()
    setUserState(null)
    window.location.href = "/"
  }

  if (!mounted) {
    return null
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
