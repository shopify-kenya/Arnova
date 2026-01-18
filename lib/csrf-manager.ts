import { apiFetch } from "./api"

class CSRFTokenManager {
  private static instance: CSRFTokenManager
  private token: string = ""
  private refreshPromise: Promise<string> | null = null
  private lastFetch: number = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  static getInstance(): CSRFTokenManager {
    if (!CSRFTokenManager.instance) {
      CSRFTokenManager.instance = new CSRFTokenManager()
    }
    return CSRFTokenManager.instance
  }

  async getToken(): Promise<string> {
    const now = Date.now()

    // Return cached token if still valid
    if (this.token && now - this.lastFetch < this.CACHE_DURATION) {
      return this.token
    }

    // Prevent multiple simultaneous requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.fetchToken()
    try {
      this.token = await this.refreshPromise
      this.lastFetch = now
      return this.token
    } finally {
      this.refreshPromise = null
    }
  }

  private async fetchToken(): Promise<string> {
    const response = await apiFetch("api/csrf-token/")

    if (!response.ok) {
      throw new Error(`CSRF token fetch failed: ${response.status}`)
    }

    const data = await response.json()
    return data.csrfToken
  }

  // Force refresh token (useful after login/logout)
  async refreshToken(): Promise<string> {
    this.token = ""
    this.lastFetch = 0
    return this.getToken()
  }

  // Clear token (useful on logout)
  clearToken(): void {
    this.token = ""
    this.lastFetch = 0
  }
}

export const csrfManager = CSRFTokenManager.getInstance()
