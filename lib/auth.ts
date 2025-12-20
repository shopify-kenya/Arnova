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
    firstName: "Admin",
    lastName: "User",
    country: "US",
    phone: "+1234567890",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: "buyer-001",
    email: "buyer@example.com",
    firstName: "John",
    lastName: "Doe",
    country: "US",
    phone: "+1234567890",
    role: "buyer",
    createdAt: new Date().toISOString(),
  },
]

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null
  const userStr = localStorage.getItem("arnova-user")
  if (!userStr) return null
  return JSON.parse(userStr)
}

export function setCurrentUser(user: User | null) {
  if (typeof window === "undefined") return
  if (user) {
    localStorage.setItem("arnova-user", JSON.stringify(user))
  } else {
    localStorage.removeItem("arnova-user")
  }
}

export function login(email: string, password: string): User | null {
  // Mock login - Replace with actual API call
  const user = mockUsers.find(u => u.email === email)
  if (user && password === "password123") {
    setCurrentUser(user)
    return user
  }
  return null
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
}
