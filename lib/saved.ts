"use client"

import type { Product } from "./products"

export function getSavedProducts(): Product[] {
  if (typeof window === "undefined") return []
  const savedStr = localStorage.getItem("arnova-saved")
  if (!savedStr) return []
  return JSON.parse(savedStr)
}

export function saveSavedProducts(products: Product[]) {
  if (typeof window === "undefined") return
  localStorage.setItem("arnova-saved", JSON.stringify(products))
}

export function addToSaved(product: Product) {
  const saved = getSavedProducts()
  if (!saved.find((p) => p.id === product.id)) {
    saved.push(product)
    saveSavedProducts(saved)
  }
}

export function removeFromSaved(productId: string) {
  const saved = getSavedProducts()
  const filtered = saved.filter((p) => p.id !== productId)
  saveSavedProducts(filtered)
}

export function isProductSaved(productId: string): boolean {
  const saved = getSavedProducts()
  return saved.some((p) => p.id === productId)
}
