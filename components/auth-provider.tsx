"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"
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
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    return getCurrentUser()
  })
  const router = useRouter()

  useEffect(() => {
    if (user) return
    if (hasToken()) {
      checkAuthStatus().then(sessionUser => {
        if (sessionUser) setUserState(sessionUser)
      })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const setUser = (newUser: User | null) => {
    setUserState(newUser)
    saveUser(newUser)
  }

  const logout = useCallback(() => {
    performLogout()
    setUserState(null)
    router.push("/")
  }, [router])

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
