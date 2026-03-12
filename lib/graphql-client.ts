"use client"

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from "./token-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL
const isLocalhost =
  typeof window !== "undefined" &&
  (window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1")
const GRAPHQL_URL =
  isLocalhost || !API_URL ? "/graphql/" : `${API_URL}/graphql/`

type GraphQLResponse<T> = {
  data?: T
  errors?: { message: string }[]
}

async function parseGraphQLResponse<T>(
  response: Response,
  fallbackMessage: string
): Promise<GraphQLResponse<T>> {
  const contentType = response.headers.get("content-type") || ""
  const isJsonResponse = contentType.includes("application/json")

  if (isJsonResponse) {
    return response.json()
  }

  const text = await response.text()
  return {
    errors: [{ message: text || fallbackMessage }],
  }
}

function buildHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
  }

  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`
  }

  return headers
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  const accessToken = getAccessToken()

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    mode: "cors",
    credentials: "include",
    headers: buildHeaders(accessToken || undefined),
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  })

  const payload = await parseGraphQLResponse<T>(
    response,
    "Unexpected server response"
  )

  if (!response.ok && (!payload.errors || payload.errors.length === 0)) {
    throw new Error(`GraphQL request failed with status ${response.status}`)
  }

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
    mode: "cors",
    credentials: "include",
    headers: buildHeaders(),
    body: JSON.stringify({ query, variables: { refreshToken } }),
  })

  const payload = await parseGraphQLResponse<{
    refresh: { accessToken: string; refreshToken: string }
  }>(response, "Unexpected refresh response")

  if (payload.data?.refresh?.accessToken) {
    setTokens(
      payload.data.refresh.accessToken,
      payload.data.refresh.refreshToken
    )
    return true
  }

  clearTokens()
  return false
}
