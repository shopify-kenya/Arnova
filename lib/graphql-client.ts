"use client"

import { getAccessToken, getRefreshToken, setTokens, clearTokens } from "./token-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const GRAPHQL_URL = `${API_URL}/graphql/`

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string }[]
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const accessToken = getAccessToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  })

  const payload: GraphQLResponse<T> = await response.json()

  if (payload.errors && payload.errors.length > 0) {
    const authError = payload.errors.find(err =>
      err.message.toLowerCase().includes("authentication")
    )
    if (authError) {
      const refreshed = await tryRefreshToken()
      if (refreshed) {
        return graphqlRequest(query, variables)
      }
    }
    throw new Error(payload.errors[0].message)
  }

  if (!payload.data) {
    throw new Error("No data returned from GraphQL")
  }

  return payload.data
}

async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) return false

  const query = `
    mutation Refresh($refreshToken: String!) {
      refresh(refreshToken: $refreshToken) {
        accessToken
        refreshToken
      }
    }
  `

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables: { refreshToken } }),
  })

  const payload: GraphQLResponse<{
    refresh: { accessToken: string; refreshToken: string }
  }> = await response.json()

  if (payload.data?.refresh?.accessToken) {
    setTokens(payload.data.refresh.accessToken, payload.data.refresh.refreshToken)
    return true
  }

  clearTokens()
  return false
}
