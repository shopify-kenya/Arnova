/**
 * API utility for making requests to Django backend
 * Handles both client-side and server-side requests
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Get the full API URL for a given path
 */
export function getApiUrl(path: string): string {
  // Remove leading slash if present
  const cleanPath = path.startsWith("/") ? path.slice(1) : path
  return `${API_URL}/${cleanPath}`
}

/**
 * Fetch wrapper that automatically uses the correct API URL
 */
export async function apiFetch(path: string, options?: RequestInit) {
  const url = getApiUrl(path)

  const defaultOptions: RequestInit = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  }

  return fetch(url, { ...defaultOptions, ...options })
}

export default apiFetch
