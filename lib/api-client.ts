// Arnova E-commerce API Client
// Frontend integration for Django REST API

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api"

// ============================================================================
// Types
// ============================================================================

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  details?: Record<string, string[]>
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface Product {
  id: number
  name: string
  slug: string
  description: string
  category: string
  price: string
  compare_at_price?: string
  is_on_sale: boolean
  sale_percentage?: number
  stock_quantity: number
  images: ProductImage[]
  variants: ProductVariant[]
  avg_rating: number
  review_count: number
}

export interface ProductImage {
  id: number
  image_url: string
  alt_text: string
  is_primary: boolean
}

export interface ProductVariant {
  id: number
  size: string
  color: string
  color_hex: string
  stock_quantity: number
  is_available: boolean
}

export interface CartItem {
  id: number
  product: {
    id: number
    name: string
    slug: string
    price: string
    image: string
  }
  variant?: {
    id: number
    size: string
    color: string
  }
  quantity: number
  price: string
  total: string
}

export interface Cart {
  id: number
  items: CartItem[]
  subtotal: string
  total_items: number
}

export interface Order {
  id: number
  order_number: string
  status: string
  payment_status: string
  total: string
  currency: string
  items: OrderItem[]
  shipping_address: Address
  created_at: string
}

export interface OrderItem {
  id: number
  product_name: string
  product_sku: string
  quantity: number
  unit_price: string
  total_price: string
}

export interface Address {
  name: string
  email: string
  phone: string
  address_line1: string
  address_line2?: string
  city: string
  state?: string
  postal_code: string
  country: string
}

export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  profile: UserProfile
}

export interface UserProfile {
  phone_number: string
  country_code: string
  country_name: string
  preferred_currency: string
  preferred_language: string
  avatar_url?: string
}

// Payment types
export interface PaymentData {
  payment_method: "card" | "paypal" | "mpesa"
  amount: number
  card_data?: {
    cardNumber: string
    cardExpiry: string
    cardCvc: string
    cardName: string
  }
  phone_number?: string
  order_data: {
    items: Array<{
      product_id: string
      quantity: number
      size: string
      color: string
      price: number
    }>
    shipping_address: {
      firstName: string
      lastName: string
      email: string
      phone: string
      address: string
      city: string
      state: string
      zipCode: string
      country: string
    }
    billing_address?: {
      firstName: string
      lastName: string
      email: string
      phone: string
      address: string
      city: string
      state: string
      zipCode: string
      country: string
    }
  }
}

export interface PaymentResult {
  success: boolean
  transaction_id?: string
  message?: string
  error?: string
  redirect_url?: string
  checkout_request_id?: string
  merchant_request_id?: string
}

// ============================================================================
// API Client Class
// ============================================================================

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  // Get access token from localStorage
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
  }

  // Get refresh token from localStorage
  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("refresh_token")
  }

  // Set tokens in localStorage
  private setTokens(access: string, refresh: string) {
    if (typeof window === "undefined") return
    localStorage.setItem("access_token", access)
    localStorage.setItem("refresh_token", refresh)
  }

  // Clear tokens from localStorage
  private clearTokens() {
    if (typeof window === "undefined") return
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
  }

  // Refresh access token
  private async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("access_token", data.access)
        return true
      }
    } catch (error) {
      console.error("Token refresh failed:", error)
    }

    return false
  }

  // Make API request
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = this.getAccessToken()

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    }

    try {
      let response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers,
      })

      // Handle 401 - try to refresh token
      if (response.status === 401) {
        const refreshed = await this.refreshAccessToken()
        if (refreshed) {
          // Retry request with new token
          const newToken = this.getAccessToken()
          const updatedHeaders = {
            ...headers,
            Authorization: `Bearer ${newToken}`,
          }
          response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: updatedHeaders,
          })
        } else {
          // Redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login"
          }
          return { error: { code: "UNAUTHORIZED", message: "Please log in" } }
        }
      }

      if (!response.ok) {
        const error = await response.json()
        return { error }
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return { data: undefined as T }
      }

      const data = await response.json()
      return { data }
    } catch (error) {
      console.error("API request failed:", error)
      return {
        error: {
          code: "NETWORK_ERROR",
          message: "Network error occurred",
        },
      }
    }
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  async register(data: {
    username: string
    email: string
    password: string
    first_name: string
    last_name: string
    profile: Partial<UserProfile>
  }): Promise<
    ApiResponse<{ user: User; tokens: { access: string; refresh: string } }>
  > {
    const response = await this.request<{
      user: User
      tokens: { access: string; refresh: string }
    }>("/auth/register/", {
      method: "POST",
      body: JSON.stringify(data),
    })

    if (response.data) {
      this.setTokens(response.data.tokens.access, response.data.tokens.refresh)
    }

    return response
  }

  async login(
    username: string,
    password: string
  ): Promise<ApiResponse<{ user: User; access: string; refresh: string }>> {
    const response = await this.request<{
      user: User
      access: string
      refresh: string
    }>("/auth/login/", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    })

    if (response.data) {
      this.setTokens(response.data.access, response.data.refresh)
    }

    return response
  }

  async logout(): Promise<void> {
    this.clearTokens()
  }

  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/profile/")
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>("/auth/profile/", {
      method: "PUT",
      body: JSON.stringify(data),
    })
  }

  // ============================================================================
  // Products
  // ============================================================================

  async getProducts(params?: {
    category?: string
    min_price?: number
    max_price?: number
    size?: string
    color?: string
    is_on_sale?: boolean
    is_featured?: boolean
    is_new_arrival?: boolean
    sort?: string
    search?: string
    page?: number
    page_size?: number
  }): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : ""
    return this.request<PaginatedResponse<Product>>(`/products/${queryString}`)
  }

  async getProduct(id: number): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/products/${id}/`)
  }

  async searchProducts(
    query: string,
    category?: string
  ): Promise<ApiResponse<PaginatedResponse<Product>>> {
    const params = new URLSearchParams({ q: query })
    if (category) params.append("category", category)
    return this.request<PaginatedResponse<Product>>(
      `/products/search/?${params}`
    )
  }

  // ============================================================================
  // Cart
  // ============================================================================

  async getCart(): Promise<ApiResponse<Cart>> {
    return this.request<Cart>("/cart/")
  }

  async addToCart(
    productId: number,
    variantId?: number,
    quantity = 1
  ): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>("/cart/items/", {
      method: "POST",
      body: JSON.stringify({
        product_id: productId,
        variant_id: variantId,
        quantity,
      }),
    })
  }

  async updateCartItem(
    itemId: number,
    quantity: number
  ): Promise<ApiResponse<CartItem>> {
    return this.request<CartItem>(`/cart/items/${itemId}/`, {
      method: "PUT",
      body: JSON.stringify({ quantity }),
    })
  }

  async removeFromCart(itemId: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/cart/items/${itemId}/`, {
      method: "DELETE",
    })
  }

  async clearCart(): Promise<ApiResponse<void>> {
    return this.request<void>("/cart/clear/", {
      method: "DELETE",
    })
  }

  // ============================================================================
  // Saved Items
  // ============================================================================

  async getSavedItems(): Promise<
    ApiResponse<PaginatedResponse<{ id: number; product: Product }>>
  > {
    return this.request<PaginatedResponse<{ id: number; product: Product }>>(
      "/saved/"
    )
  }

  async addToSaved(
    productId: number
  ): Promise<ApiResponse<{ id: number; product: Product }>> {
    return this.request<{ id: number; product: Product }>("/saved/", {
      method: "POST",
      body: JSON.stringify({ product_id: productId }),
    })
  }

  async removeFromSaved(id: number): Promise<ApiResponse<void>> {
    return this.request<void>(`/saved/${id}/`, {
      method: "DELETE",
    })
  }

  // ============================================================================
  // Orders
  // ============================================================================

  async getOrders(params?: {
    status?: string
    page?: number
  }): Promise<ApiResponse<PaginatedResponse<Order>>> {
    const queryString = params
      ? "?" + new URLSearchParams(params as Record<string, string>).toString()
      : ""
    return this.request<PaginatedResponse<Order>>(`/orders/${queryString}`)
  }

  async getOrder(id: number): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/`)
  }

  async createOrder(data: {
    shipping_address: Address
    billing_same_as_shipping: boolean
    billing_address?: Address
    payment_method: string
    payment_id: string
    customer_notes?: string
  }): Promise<ApiResponse<Order>> {
    return this.request<Order>("/orders/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async cancelOrder(id: number, reason: string): Promise<ApiResponse<Order>> {
    return this.request<Order>(`/orders/${id}/cancel/`, {
      method: "PUT",
      body: JSON.stringify({ cancellation_reason: reason }),
    })
  }

  async trackOrder(id: number): Promise<
    ApiResponse<{
      order_number: string
      status: string
      tracking_number: string
      carrier: string
      history: Array<{ status: string; comment: string; created_at: string }>
    }>
  > {
    return this.request(`/orders/${id}/track/`)
  }

  // ============================================================================
  // Payment
  // ============================================================================

  async processPayment(data: PaymentData): Promise<ApiResponse<PaymentResult>> {
    return this.request("/payment/process/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async processMpesaPayment(data: {
    phone_number: string
    amount: number
    order_data: PaymentData["order_data"]
  }): Promise<ApiResponse<PaymentResult>> {
    return this.request("/payment/mpesa/stk-push/", {
      method: "POST",
      body: JSON.stringify(data),
    })
  }

  async checkMpesaStatus(checkoutRequestId: string): Promise<
    ApiResponse<{
      status: string
      result_code: string
      result_desc: string
      transaction_id?: string
    }>
  > {
    return this.request(`/payment/mpesa/status/${checkoutRequestId}/`)
  }

  async validateCard(
    cardNumber: string
  ): Promise<
    ApiResponse<{ valid: boolean; card_type: string; error?: string }>
  > {
    return this.request("/payment/validate-card/", {
      method: "POST",
      body: JSON.stringify({ card_number: cardNumber }),
    })
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================

export const api = new ApiClient()

// ============================================================================
// React Hooks (Optional)
// ============================================================================

export function useApi() {
  return api
}
