"use client"

import { graphqlRequest } from "./graphql-client"
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
    const data = await graphqlRequest<{
      cart: { items: CartItem[] }
    }>(`
      query Cart {
        cart {
          items {
            id
            quantity
            selectedSize
            selectedColor
            product {
              id
              name
              price
              images
            }
          }
        }
      }
    `)
    return data.cart.items || []
  } catch {
    return []
  }
}

/**
 * Adds or updates an item in the cart on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function addToCart(item: CartItem): Promise<boolean> {
  try {
    const data = await graphqlRequest<{
      cartAdd: { success: boolean }
    }>(
      `
      mutation AddToCart($input: CartAddInput!) {
        cartAdd(input: $input) {
          success
        }
      }
      `,
      {
        input: {
          productId: Number(item.product.id),
          quantity: item.quantity,
          selectedSize: item.selectedSize,
          selectedColor: item.selectedColor,
        },
      }
    )
    return data.cartAdd.success
  } catch {
    return false
  }
}

/**
 * Removes an item from the cart on the server.
 * @returns {boolean} True if the operation was successful, false otherwise.
 */
export async function removeFromCart(itemId: number): Promise<boolean> {
  try {
    const data = await graphqlRequest<{
      cartRemove: { success: boolean }
    }>(
      `
      mutation RemoveFromCart($itemId: Int!) {
        cartRemove(itemId: $itemId) {
          success
        }
      }
      `,
      { itemId }
    )
    return data.cartRemove.success
  } catch {
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
    const data = await graphqlRequest<{
      cartUpdate: { success: boolean }
    }>(
      `
      mutation UpdateCart($itemId: Int!, $quantity: Int!) {
        cartUpdate(itemId: $itemId, quantity: $quantity) {
          success
        }
      }
      `,
      { itemId, quantity }
    )
    return data.cartUpdate.success
  } catch {
    return false
  }
}

/**
 * Clears all items from the cart on the server.
 * Currently implemented by deleting items one-by-one because there is no
 * dedicated bulk-clear endpoint.
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
  } catch {
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
