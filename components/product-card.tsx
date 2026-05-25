"use client"

import type React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/products"
import { useCurrency } from "@/components/currency-provider"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useSavedItems } from "@/components/saved-items-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { getProductImageUrl } from "@/lib/image-utils"

interface ProductCardProps {
  product: Product
  index?: number
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { addSavedItem, removeSavedItem, isProductSaved } = useSavedItems()
  const router = useRouter()

  const isSaved = isProductSaved(product.id)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isAuthenticated) {
      toast.error("Please login to save items")
      router.push("/login")
      return
    }
    if (isSaved) {
      await removeSavedItem(product.id)
    } else {
      await addSavedItem(product.id)
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
    if (product.sizes.length > 1 || product.colors.length > 1) {
      router.push(`/product/${product.id}`)
      toast.info("Please select size and color")
      return
    }
    addItem({
      product,
      quantity: 1,
      selectedSize: product.sizes[0] || "M",
      selectedColor: product.colors[0] || "Black",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.3 }}
    >
      <Link href={`/product/${product.id}`} className="group block">
        {/* Image */}
        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted mb-3">
          <Image
            src={getProductImageUrl(product.images[0])}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {/* Hover actions */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm shadow-sm"
              onClick={handleSave}
            >
              <Heart
                className={`h-3.5 w-3.5 ${isSaved ? "fill-current text-red-500" : "text-foreground"}`}
              />
            </Button>
            <Button
              size="icon"
              variant="secondary"
              className="h-8 w-8 rounded-full bg-card/90 backdrop-blur-sm shadow-sm"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="h-3.5 w-3.5 text-foreground" />
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-foreground line-clamp-1">
            {product.name}
          </h3>
          <div className="flex items-center gap-2">
            {product.onSale && product.salePrice ? (
              <>
                <span className="font-bold text-foreground">
                  {formatPrice(product.salePrice)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              </>
            ) : (
              <span className="font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
