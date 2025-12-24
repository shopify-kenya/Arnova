import { csrfManager } from "./csrf-manager"

interface ApiOptions extends RequestInit {
  skipCSRF?: boolean
  retries?: number
}

class ApiClient {
  private static instance: ApiClient

  static getInstance(): ApiClient {
    if (!ApiClient.instance) {
      ApiClient.instance = new ApiClient()
    }
    return ApiClient.instance
  }

  async request(url: string, options: ApiOptions = {}): Promise<Response> {
    const { skipCSRF = false, retries = 1, ...fetchOptions } = options

    // Prepare headers
    const headers = new Headers(fetchOptions.headers)
    headers.set("Content-Type", "application/json")

    // Add CSRF token for non-GET requests
    if (!skipCSRF && fetchOptions.method !== "GET") {
      try {
        const token = await csrfManager.getToken()
        headers.set("X-CSRFToken", token)
      } catch (error) {
        console.error("Failed to get CSRF token:", error)
        throw new Error("Authentication setup failed")
      }
    }

    // Make request
    const response = await fetch(url, {
      ...fetchOptions,
      credentials: "include",
      headers,
    })

    // Handle CSRF token expiry
    if (response.status === 403 && retries > 0) {
      console.log("CSRF token expired, refreshing...")
      await csrfManager.refreshToken()
      return this.request(url, { ...options, retries: retries - 1 })
    }

    return response
  }

  // Convenience methods
  async get(url: string, options: ApiOptions = {}): Promise<Response> {
    return this.request(url, { ...options, method: "GET" })
  }

  async post(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<Response> {
    return this.request(url, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put(
    url: string,
    data?: any,
    options: ApiOptions = {}
  ): Promise<Response> {
    return this.request(url, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete(url: string, options: ApiOptions = {}): Promise<Response> {
    return this.request(url, { ...options, method: "DELETE" })
  }
}

export const apiClient = ApiClient.getInstance()
