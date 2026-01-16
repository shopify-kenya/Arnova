"use client"

import { apiClient } from "./api-client"
import type { Product } from "./products"

// The SavedItem interface now includes the server-side ID
export interface SavedItem {
  id: number
  product: Product
}

/**
 * Fetches the user's saved items from the backend.
 */
export async function getSavedProductsFromServer(): Promise<SavedItem[]> {
  try {
    const response = await apiClient.get("/api/saved/")
    if (response.ok) {
      const data = await response.json()
      return data.items || []
    }
  } catch (error) {
    console.error("Failed to fetch saved items:", error)
  }
  return []
}

/**
 * Adds a product to the saved items list on the server.
 * @returns {Promise<number | null>} The ID of the new saved item, or null on failure.
 */
export async function addToSaved(productId: string): Promise<number | null> {
  try {
    const response = await apiClient.post("/api/saved/add/", {
      product_id: productId,
    })
    if (response.ok) {
      const data = await response.json()
      return data.item_id
    }
  } catch (error) {
    console.error("Failed to add to saved items:", error)
  }
  return null
}

/**
 * Removes an item from the saved list on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function removeFromSaved(itemId: number): Promise<boolean> {
  try {
    const response = await apiClient.delete(`/api/saved/${itemId}/`)
    return response.ok
  } catch (error) {
    console.error("Failed to remove from saved items:", error)
    return false
  }
}

/**
 * Checks if a product is in the saved items list.
 * This remains a synchronous utility function that operates on the client-side state.
 */
export function isProductSaved(
  productId: string,
  savedItems: SavedItem[]
): boolean {
  return savedItems.some(item => item.product.id === productId)
}
