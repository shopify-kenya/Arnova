"use client"

import { apiClient } from "./api-client"
import type { Product } from "./products"

// The CartItem interface now includes the server-side ID
export interface CartItem {
  id?: number // Optional because it doesn't exist until saved
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

/**
 * Fetches the user's cart from the backend.
 */
export async function getCartFromServer(): Promise<CartItem[]> {
  try {
    const response = await apiClient.get("/api/cart/")
    if (response.ok) {
      const data = await response.json()
      return data.items || []
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error)
  }
  return []
}

/**
 * Adds or updates an item in the cart on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function addToCart(item: CartItem): Promise<boolean> {
  try {
    const response = await apiClient.post("/api/cart/add/", {
      product_id: parseInt(item.product.id),
      quantity: item.quantity,
      selected_size: item.selectedSize,
      selected_color: item.selectedColor,
    })
    return response.ok
  } catch (error) {
    console.error("Failed to add to cart:", error)
    return false
  }
}

/**
 * Removes an item from the cart on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function removeFromCart(itemId: number): Promise<boolean> {
  try {
    const response = await apiClient.delete(`/api/cart/${itemId}/`)
    return response.ok
  } catch (error) {
    console.error("Failed to remove from cart:", error)
    return false
  }
}

/**
 * Updates the quantity of a specific item in the cart on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function updateCartItemQuantity(
  itemId: number,
  quantity: number
): Promise<boolean> {
  try {
    const response = await apiClient.put(`/api/cart/${itemId}/`, { quantity })
    return response.ok
  } catch (error) {
    console.error("Failed to update cart item quantity:", error)
    return false
  }
}

/**
 * Clears all items from the cart on the server.
 * NOTE: This requires a backend endpoint, which we will assume is POST /api/cart/clear/
 * For now, it will delete items one by one.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function clearCart(cart: CartItem[]): Promise<boolean> {
  try {
    // Perform all delete operations in parallel for efficiency
    const deletePromises = cart
      .filter(item => item.id)
      .map(item => removeFromCart(item.id!))
    const results = await Promise.all(deletePromises)
    // Return true only if all deletions were successful
    return results.every(res => res)
  } catch (error) {
    console.error("Failed to clear cart:", error)
    return false
  }
}

/**
 * Calculates the total price of the cart items.
 * This remains a synchronous utility function.
 */
export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    const price =
      item.product.onSale && item.product.salePrice
        ? item.product.salePrice
        : item.product.price
    return total + price * item.quantity
  }, 0)
}
