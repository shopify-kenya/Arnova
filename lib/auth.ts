"use client"

import { graphqlRequest } from "./graphql-client"
import { clearTokens, getAccessToken, setTokens } from "./token-store"

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

export function getCurrentUser(): User | null {
  if (typeof window === "undefined") return null

  const userStr = localStorage.getItem("arnova-user")
  if (!userStr) return null
  return JSON.parse(userStr)
}

export async function checkAuthStatus(): Promise<User | null> {
  try {
    const data = await graphqlRequest<{
      me: {
        id: number
        username: string
        email: string
        role: string
      } | null
    }>(
      `
      query Me {
        me {
          id
          username
          email
          role
        }
      }
      `
    )

    if (!data.me) return null
    const user: User = {
      id: data.me.id.toString(),
      email: data.me.email,
      firstName: data.me.username,
      lastName: "",
      country: "US",
      phone: "",
      role: data.me.role as "admin" | "buyer",
      createdAt: new Date().toISOString(),
    }
    setCurrentUser(user)
    return user
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

export async function login(
  email: string,
  password: string,
  rememberMe: boolean = false
): Promise<User | null> {
  const result = await graphqlRequest<{
    login: {
      accessToken: string
      refreshToken: string
      user: { id: number; username: string; email: string; role: string }
    }
  }>(
    `
    mutation Login($username: String!, $password: String!) {
      login(username: $username, password: $password) {
        accessToken
        refreshToken
        user {
          id
          username
          email
          role
        }
      }
    }
    `,
    { username: email, password }
  )

  if (!result.login) return null
  setTokens(result.login.accessToken, result.login.refreshToken)
  const user: User = {
    id: result.login.user.id.toString(),
    email: result.login.user.email,
    firstName: result.login.user.username,
    lastName: "",
    country: "US",
    phone: "",
    role: result.login.user.role as "admin" | "buyer",
    createdAt: new Date().toISOString(),
  }
  setCurrentUser(user)
  return user
}

export async function register(data: {
  email: string
  password: string
  firstName: string
  lastName: string
  country: string
  phone: string
}): Promise<User | null> {
  const result = await graphqlRequest<{
    register: {
      accessToken: string
      refreshToken: string
      user: { id: number; username: string; email: string; role: string }
    }
  }>(
    `
    mutation Register($username: String!, $email: String!, $password: String!) {
      register(username: $username, email: $email, password: $password) {
        accessToken
        refreshToken
        user {
          id
          username
          email
          role
        }
      }
    }
    `,
    { username: data.email, email: data.email, password: data.password }
  )

  if (!result.register) return null
  setTokens(result.register.accessToken, result.register.refreshToken)
  const user: User = {
    id: result.register.user.id.toString(),
    email: result.register.user.email,
    firstName: result.register.user.username,
    lastName: "",
    country: data.country || "US",
    phone: data.phone || "",
    role: result.register.user.role as "admin" | "buyer",
    createdAt: new Date().toISOString(),
  }
  setCurrentUser(user)
  return user
}

export function logout() {
  setCurrentUser(null)
  clearTokens()
}

export function hasToken(): boolean {
  return !!getAccessToken()
}
