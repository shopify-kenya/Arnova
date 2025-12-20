"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { CartItem } from "@/lib/cart"
import { getCart, saveCart, getCartTotal } from "@/lib/cart"

interface CartContextType {
  cart: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: string, size: string, color: string) => void
  updateQuantity: (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => void
  clearCart: () => void
  total: number
  itemCount: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setCart(getCart())
  }, [])

  const addItem = (item: CartItem) => {
    const existingIndex = cart.findIndex(
      i =>
        i.product.id === item.product.id &&
        i.selectedSize === item.selectedSize &&
        i.selectedColor === item.selectedColor
    )

    let newCart: CartItem[]
    if (existingIndex >= 0) {
      newCart = [...cart]
      newCart[existingIndex].quantity += item.quantity
    } else {
      newCart = [...cart, item]
    }

    setCart(newCart)
    saveCart(newCart)
  }

  const removeItem = (productId: string, size: string, color: string) => {
    const newCart = cart.filter(
      item =>
        !(
          item.product.id === productId &&
          item.selectedSize === size &&
          item.selectedColor === color
        )
    )
    setCart(newCart)
    saveCart(newCart)
  }

  const updateQuantity = (
    productId: string,
    size: string,
    color: string,
    quantity: number
  ) => {
    const newCart = cart.map(item => {
      if (
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
      ) {
        return { ...item, quantity }
      }
      return item
    })
    setCart(newCart)
    saveCart(newCart)
  }

  const clearCartFn = () => {
    setCart([])
    saveCart([])
  }

  if (!mounted) return null

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        updateQuantity,
        clearCart: clearCartFn,
        total: getCartTotal(cart),
        itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within CartProvider")
  }
  return context
}
