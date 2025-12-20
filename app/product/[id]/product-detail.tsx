"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  Heart,
  ShoppingCart,
  Star,
  ChevronLeft,
  Minus,
  Plus,
  Check,
} from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { products } from "@/lib/products"
import { useCurrency } from "@/components/currency-provider"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { addToSaved, removeFromSaved, isProductSaved } from "@/lib/saved"
import { toast } from "sonner"

export default function ProductDetail({ productId }: { productId: string }) {
  const router = useRouter()
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()

  const product = products.find(p => p.id === productId)

  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || "")
      setSelectedColor(product.colors[0] || "")
      setIsSaved(isProductSaved(product.id))
    }
  }, [product])

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Product not found</h2>
          <Button onClick={() => router.push("/")}>Go back home</Button>
        </GlassCard>
      </div>
    )
  }

  const handleSave = () => {
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

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please login to add items to cart")
      router.push("/login")
      return
    }

    if (!selectedSize || !selectedColor) {
      toast.error("Please select size and color")
      return
    }

    addItem({
      product,
      quantity,
      selectedSize,
      selectedColor,
    })
    toast.success("Added to cart")
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" className="mb-6" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="overflow-hidden mb-4">
              <div className="aspect-square relative">
                <Image
                  src={product.images[selectedImage] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
                {product.isNew && (
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    New
                  </Badge>
                )}
                {product.onSale && (
                  <Badge className="absolute top-4 right-4 bg-accent text-accent-foreground">
                    Sale
                  </Badge>
                )}
              </div>
            </GlassCard>

            {/* Thumbnail Gallery */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? "border-primary scale-95"
                      : "border-transparent hover:border-muted"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${product.name} ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Product Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard className="p-6">
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-current text-yellow-500" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>

              <div className="flex items-center gap-3 mb-6">
                {product.onSale && product.salePrice ? (
                  <>
                    <span className="text-3xl font-bold text-accent">
                      {formatPrice(product.salePrice)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.price)}
                    </span>
                    <Badge className="bg-accent text-accent-foreground">
                      {Math.round(
                        ((product.price - product.salePrice) / product.price) *
                          100
                      )}
                      % OFF
                    </Badge>
                  </>
                ) : (
                  <span className="text-3xl font-bold">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <p className="text-muted-foreground mb-6">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                        selectedColor === color
                          ? "border-primary bg-primary/10"
                          : "border-muted hover:border-primary/50"
                      }`}
                    >
                      {color}
                      {selectedColor === color && <Check className="h-4 w-4" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-xl font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(10, quantity + 1))}
                    disabled={quantity >= 10}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-6">
                <Badge variant={product.inStock ? "default" : "destructive"}>
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </Badge>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" onClick={handleSave}>
                  <Heart
                    className={`h-5 w-5 ${isSaved ? "fill-current text-red-500" : ""}`}
                  />
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
