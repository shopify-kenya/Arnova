/**
 * CSRF Token Utilities for Arnova E-commerce
 * Handles CSRF token management for secure API requests
 */

class CSRFManager {
  constructor() {
    this.token = null
    this.tokenName = "csrftoken"
  }

  /**
   * Get CSRF token from cookie
   */
  getTokenFromCookie() {
    const cookies = document.cookie.split(";")
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=")
      if (name === this.tokenName) {
        return decodeURIComponent(value)
      }
    }
    return null
  }

  /**
   * Fetch CSRF token from server
   */
  async fetchToken() {
    try {
      const response = await fetch("/api/csrf-token/", {
        method: "GET",
        credentials: "same-origin",
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        this.token = data.csrfToken
        return this.token
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token:", error)
    }
    return null
  }

  /**
   * Get current CSRF token (from cookie or fetch from server)
   */
  async getToken() {
    // Try to get from cookie first
    let token = this.getTokenFromCookie()

    if (!token) {
      // If not in cookie, fetch from server
      token = await this.fetchToken()
    }

    this.token = token
    return token
  }

  /**
   * Get headers object with CSRF token
   */
  async getHeaders(additionalHeaders = {}) {
    const token = await this.getToken()
    return {
      "X-CSRFToken": token,
      "Content-Type": "application/json",
      ...additionalHeaders,
    }
  }

  /**
   * Make authenticated API request with CSRF token
   */
  async apiRequest(url, options = {}) {
    const headers = await this.getHeaders(options.headers)

    return fetch(url, {
      credentials: "same-origin",
      ...options,
      headers,
    })
  }

  /**
   * POST request with CSRF token
   */
  async post(url, data, options = {}) {
    return this.apiRequest(url, {
      method: "POST",
      body: JSON.stringify(data),
      ...options,
    })
  }

  /**
   * PUT request with CSRF token
   */
  async put(url, data, options = {}) {
    return this.apiRequest(url, {
      method: "PUT",
      body: JSON.stringify(data),
      ...options,
    })
  }

  /**
   * DELETE request with CSRF token
   */
  async delete(url, options = {}) {
    return this.apiRequest(url, {
      method: "DELETE",
      ...options,
    })
  }
}

// Create global instance
window.csrfManager = new CSRFManager()

// Export for module usage
if (typeof module !== "undefined" && module.exports) {
  module.exports = CSRFManager
}
