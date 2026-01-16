"use client"

import type React from "react"
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react"
import { toast } from "sonner"
import type { CartItem } from "@/lib/cart"
import {
  getCartFromServer,
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  clearCart as clearCartFromServer,
  getCartTotal,
} from "@/lib/cart"
import { useAuth } from "./auth-provider"

interface CartContextType {
  cart: CartItem[]
  addItem: (item: CartItem) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  clearCart: () => Promise<void>
  total: number
  itemCount: number
  isLoading: boolean
  error: string | null
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const serverCart = await getCartFromServer()
      setCart(serverCart)
    } catch (e) {
      setError("Failed to load cart.")
      toast.error("Failed to load your cart from the server.")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchCart()
  }, [fetchCart])

  const performCartAction = async (
    action: Promise<boolean>,
    successMessage: string,
    errorMessage: string
  ) => {
    try {
      const success = await action
      if (success) {
        toast.success(successMessage)
        await fetchCart() // Refresh cart from server
      } else {
        toast.error(errorMessage)
      }
    } catch {
      toast.error(errorMessage)
    }
  }

  const addItem = async (item: CartItem) => {
    await performCartAction(
      addToCart(item),
      "Item added to cart!",
      "Failed to add item to cart."
    )
  }

  const removeItem = async (itemId: number) => {
    await performCartAction(
      removeFromCart(itemId),
      "Item removed from cart.",
      "Failed to remove item from cart."
    )
  }

  const updateQuantity = async (itemId: number, quantity: number) => {
    if (quantity < 1) {
      await removeItem(itemId)
      return
    }
    await performCartAction(
      updateCartItemQuantity(itemId, quantity),
      "Cart updated.",
      "Failed to update cart."
    )
  }

  const clearCart = async () => {
    await performCartAction(
      clearCartFromServer(cart),
      "Cart cleared.",
      "Failed to clear cart."
    )
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total: getCartTotal(cart),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
        isLoading,
        error,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
