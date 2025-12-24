"use client"

// Mock authentication - Replace with actual backend API calls
export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  country: string
  phone: string
  role: "admin" | "buyer"
  createdAt: string
}

export const mockUsers: User[] = [
  {
    id: "admin-001",
    email: "admin@arnova.com",
    firstName: "Arnova",
    lastName: "Admin",
    country: "US",
    phone: "+1234567890",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "buyer-001",
    email: "buyer@arnova.com",
    firstName: "Arno",
    lastName: "Buyer",
    country: "US",
    phone: "+1234567890",
    role: "buyer",
    createdAt: new Date().toISOString(),
  },
]

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  // Check if user session has expired
  const expiryStr = localStorage.getItem("arnova-user-expiry")
  if (expiryStr) {
    const expiryDate = new Date(expiryStr)
    if (new Date() > expiryDate) {
      // Session expired, clear user data
      localStorage.removeItem("arnova-user")
      localStorage.removeItem("arnova-user-expiry")
      return null
    }
  }

  const userStr = localStorage.getItem("arnova-user")
  if (!userStr) return null
  return JSON.parse(userStr)
}

export async function checkAuthStatus(): Promise<User | null> {
  try {
    const response = await fetch("/api/auth/status/", {
      credentials: "include",
    })
    const data = await response.json()

    if (data.authenticated && data.user) {
      const user: User = {
        id: data.user.id.toString(),
        email: data.user.email,
        firstName: data.user.username,
        lastName: "",
        country: "US",
        phone: "",
        role: data.user.role,
        createdAt: new Date().toISOString(),
      }
      setCurrentUser(user)
      return user
    }
    return null
  } catch (error) {
    return null
  }
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("arnova-user", JSON.stringify(user))
  } else {
    localStorage.removeItem("arnova-user")
  }
}

export function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): User | null {
  // Use Django API for authentication
  fetch("/api/auth/login/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": getCsrfToken(),
    },
    credentials: "include",
    body: JSON.stringify({ email, password }),
  })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        const user: User = {
          id: data.user.id.toString(),
          email: data.user.email,
          firstName: data.user.username,
          lastName: "",
          country: "US",
          phone: "",
          role: data.user.role,
          createdAt: new Date().toISOString(),
        }
        setCurrentUser(user)
        if (rememberMe && typeof window !== "undefined") {
          const expirationDate = new Date()
          expirationDate.setDate(expirationDate.getDate() + 30)
          localStorage.setItem(
            "arnova-user-expiry",
            expirationDate.toISOString()
          )
        }
        return user
      }
      return null
    })
    .catch(() => null)

  // Fallback to mock for now
  const user = mockUsers.find(u => u.email === email)
  if (user && (password === "Arnova@010126" || password === "Buyer@010126")) {
    setCurrentUser(user)
    if (rememberMe && typeof window !== "undefined") {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 30)
      localStorage.setItem("arnova-user-expiry", expirationDate.toISOString())
    }
    return user
  }
  return null
}

function getCsrfToken(): string {
  const cookies = document.cookie.split(";")
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=")
    if (name === "csrftoken") {
      return value
    }
  }
  return ""
}

export function register(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  country: string
  phone: string
}): User {
  // Mock registration - Replace with actual API call
  const newUser: User = {
    id: `user-${Date.now()}`,
    email: data.email,
    firstName: data.firstName,
    lastName: data.lastName,
    country: data.country,
    phone: data.phone,
    role: "buyer",
    createdAt: new Date().toISOString(),
  }
  setCurrentUser(newUser)
  return newUser
}

export function logout() {
  setCurrentUser(null)
  if (typeof window !== "undefined") {
    localStorage.removeItem("arnova-user-expiry")
  }
}
