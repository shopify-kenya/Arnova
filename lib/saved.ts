"use client"

import { graphqlRequest } from "./graphql-client"
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
    const data = await graphqlRequest<{
      saved: { items: SavedItem[] }
    }>(`
      query SavedItems {
        saved {
          items {
            id
            product {
              id
              name
              description
              price
              salePrice
              currency
              baseCurrency
              category
              sizes
              colors
              images
              inStock
              isNew
              onSale
              rating
              reviews
            }
          }
        }
      }
    `)
    return data.saved.items || []
  } catch {
    return []
  }
}

/**
 * Adds a product to the saved items list on the server.
 * @returns {Promise<number | null>} The ID of the new saved item, or null on failure.
 */
export async function addToSaved(productId: string): Promise<number | null> {
  try {
    const data = await graphqlRequest<{
      savedAdd: { success: boolean; itemId: number | null }
    }>(
      `
      mutation SavedAdd($productId: Int!) {
        savedAdd(productId: $productId) {
          success
          itemId
        }
      }
      `,
      { productId: Number(productId) }
    )
    return data.savedAdd.itemId || null
  } catch {
    return null
  }
}

/**
 * Removes an item from the saved list on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function removeFromSaved(itemId: number): Promise<boolean> {
  try {
    const data = await graphqlRequest<{
      savedRemove: { success: boolean }
    }>(
      `
      mutation SavedRemove($itemId: Int!) {
        savedRemove(itemId: $itemId) {
          success
        }
      }
      `,
      { itemId }
    )
    return data.savedRemove.success
  } catch {
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
