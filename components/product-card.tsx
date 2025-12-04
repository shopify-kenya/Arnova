"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/products"
import { useCurrency } from "@/components/currency-provider"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { addToSaved, removeFromSaved, isProductSaved } from "@/lib/saved"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setIsSaved(isProductSaved(product.id))
  }, [product.id])

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error("Please login to save items")
      router.push("/login")
      return
    }

    if (isSaved) {
      removeFromSaved(product.id)
      setIsSaved(false)
      toast.success("Removed from saved")
    } else {
      addToSaved(product)
      setIsSaved(true)
      toast.success("Added to saved")
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!isAuthenticated) {
      toast.error("Please login to add items to cart")
      router.push("/login")
      return
    }

    // If product has multiple sizes or colors, redirect to product page for selection
    if (product.sizes.length > 1 || product.colors.length > 1) {
      router.push(`/product/${product.id}`)
      toast.info("Please select size and color")
      return
    }

    // Add with default size and color
    addItem({
      product,
      quantity: 1,
      selectedSize: product.sizes[0] || "M",
      selectedColor: product.colors[0] || "Black",
    })
    toast.success("Added to cart")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
    >
      <Link href={`/product/${product.id}`}>
        <GlassCard className="group overflow-hidden h-full">
          <div className="relative aspect-square overflow-hidden">
            <Image
              src={product.images[0] || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && (
                <Badge className="bg-primary text-primary-foreground">
                  New
                </Badge>
              )}
              {product.onSale && (
                <Badge className="bg-accent text-accent-foreground">Sale</Badge>
              )}
            </div>
            <div className="absolute top-3 right-3 flex flex-col gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="rounded-full glass-strong"
                onClick={handleSave}
              >
                <Heart
                  className={`h-4 w-4 ${isSaved ? "fill-current text-red-500" : ""}`}
                />
              </Button>
            </div>
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="icon"
                className="rounded-full"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4">
            <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
              {product.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center gap-1 mb-2">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span className="text-sm font-medium">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviews})
              </span>
            </div>

            <div className="flex items-center gap-2">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-lg font-bold text-accent">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
          </div>
        </GlassCard>
      </Link>
    </motion.div>
  )
}
