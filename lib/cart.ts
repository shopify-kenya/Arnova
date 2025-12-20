"use client"

import type { Product } from "./products"

export interface CartItem {
  product: Product
  quantity: number
  selectedSize: string
  selectedColor: string
}

export function getCart(): CartItem[] {
  if (typeof window === "undefined") return []
  const cartStr = localStorage.getItem("arnova-cart")
  if (!cartStr) return []
  return JSON.parse(cartStr)
}

export function saveCart(cart: CartItem[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("arnova-cart", JSON.stringify(cart))
}

export function addToCart(item: CartItem) {
  const cart = getCart()
  const existingIndex = cart.findIndex(
    i =>
      i.product.id === item.product.id &&
      i.selectedSize === item.selectedSize &&
      i.selectedColor === item.selectedColor
  )

  if (existingIndex >= 0) {
    cart[existingIndex].quantity += item.quantity
  } else {
    cart.push(item)
  }

  saveCart(cart)
}

export function removeFromCart(productId: string, size: string, color: string) {
  const cart = getCart()
  const filtered = cart.filter(
    item =>
      !(
        item.product.id === productId &&
        item.selectedSize === size &&
        item.selectedColor === color
      )
  )
  saveCart(filtered)
}

export function updateCartItemQuantity(
  productId: string,
  size: string,
  color: string,
  quantity: number
) {
  const cart = getCart()
  const item = cart.find(
    i =>
      i.product.id === productId &&
      i.selectedSize === size &&
      i.selectedColor === color
  )
  if (item) {
    item.quantity = quantity
    saveCart(cart)
  }
}

export function clearCart() {
  if (typeof window === "undefined") return
  localStorage.removeItem("arnova-cart")
}

export function getCartTotal(cart: CartItem[]): number {
  return cart.reduce((total, item) => {
    const price =
      item.product.onSale && item.product.salePrice
        ? item.product.salePrice
        : item.product.price
    return total + price * item.quantity
  }, 0)
}
