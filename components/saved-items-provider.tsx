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
import type { SavedItem } from "@/lib/saved"
import {
  getSavedProductsFromServer,
  addToSaved,
  removeFromSaved,
} from "@/lib/saved"
import { useAuth } from "./auth-provider"

interface SavedItemsContextType {
  savedItems: SavedItem[]
  addSavedItem: (productId: string) => Promise<void>
  removeSavedItem: (productId: string) => Promise<void>
  isProductSaved: (productId: string) => boolean
  isLoading: boolean
  error: string | null
}

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(
  undefined
)

export function SavedItemsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()
  const [savedItems, setSavedItems] = useState<SavedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSavedItems = useCallback(async () => {
    if (!isAuthenticated) {
      setSavedItems([])
      setIsLoading(false)
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      const serverItems = await getSavedProductsFromServer()
      setSavedItems(serverItems)
    } catch {
      setError("Failed to load saved items.")
      toast.error("Failed to load your saved items from the server.")
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    fetchSavedItems()
  }, [fetchSavedItems])

  const addSavedItem = async (productId: string) => {
    try {
      const newItemId = await addToSaved(productId)
      if (newItemId) {
        toast.success("Item saved!")
        await fetchSavedItems() // Refresh list from server
      } else {
        toast.error("Failed to save item.")
      }
    } catch {
      toast.error("Failed to save item.")
    }
  }

  const removeSavedItem = async (productId: string) => {
    const itemToRemove = savedItems.find(item => item.product.id === productId)
    if (!itemToRemove) {
      toast.error("Item not found in saved list.")
      return
    }

    try {
      const success = await removeFromSaved(itemToRemove.id)
      if (success) {
        toast.info("Item removed from saved list.")
        await fetchSavedItems() // Refresh list from server
      } else {
        toast.error("Failed to remove item.")
      }
    } catch {
      toast.error("Failed to remove item.")
    }
  }

  const isProductSaved = (productId: string): boolean => {
    return savedItems.some(item => item.product.id === productId)
  }

  return (
    <SavedItemsContext.Provider
      value={{
        savedItems,
        addSavedItem,
        removeSavedItem,
        isProductSaved,
        isLoading,
        error,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  )
}

export function useSavedItems() {
  const context = useContext(SavedItemsContext)
  if (!context) {
    throw new Error("useSavedItems must be used within a SavedItemsProvider")
  }
  return context
}
