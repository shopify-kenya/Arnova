"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GlassCard } from "@/components/glass-card"
import { useCurrency } from "@/components/currency-provider"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useSavedItems } from "@/components/saved-items-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/products"
import { graphqlRequest } from "@/lib/graphql-client"
import { ProductReviews } from "@/components/product-reviews"

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState("")
  const [selectedColor, setSelectedColor] = useState("")
  const { formatPrice } = useCurrency()
  const { addItem } = useCart()
  const { isAuthenticated } = useAuth()
  const { addSavedItem, removeSavedItem, isProductSaved } = useSavedItems()
  const router = useRouter()

  const fetchReviews = () => {
    graphqlRequest<{
      productReviews: {
        reviews: any[]
      }
    }>(
      `
      query ProductReviews($id: Int!) {
        productReviews(id: $id) {
          reviews {
            id
            user
            rating
            comment
            createdAt
          }
        }
      }
      `,
      { id: Number(params.id) }
    )
      .then(data => setReviews(data.productReviews.reviews || []))
      .catch(() => {})
  }

  useEffect(() => {
    graphqlRequest<{
      product: Product
    }>(
      `
      query Product($id: Int!) {
        product(id: $id) {
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
      `,
      { id: Number(params.id) }
    )
      .then(data => {
        setProduct(data.product)
        setSelectedSize(data.product.sizes[0] || "")
        setSelectedColor(data.product.colors[0] || "")
      })
      .catch(() => toast.error("Failed to load product"))

    fetchReviews()
  }, [params.id])

  if (!product) return <div className="container py-20">Loading...</div>

  const isSaved = isProductSaved(product.id)

  const handleSave = async () => {
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
    addItem({ product, quantity: 1, selectedSize, selectedColor })
  }

  return (
    <div className="container py-20">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <GlassCard className="mb-4 overflow-hidden">
            <div className="relative aspect-square">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </GlassCard>
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImage(idx)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 ${
                  selectedImage === idx
                    ? "border-primary"
                    : "border-transparent"
                }`}
              >
                <Image
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-current text-yellow-500" />
                  <span className="font-medium">{product.rating}</span>
                </div>
                <span className="text-muted-foreground">
                  ({product.reviews} reviews)
                </span>
              </div>
            </div>
            <Button size="icon" variant="outline" onClick={handleSave}>
              <Heart
                className={`h-5 w-5 ${isSaved ? "fill-current text-red-500" : ""}`}
              />
            </Button>
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
              </>
            ) : (
              <span className="text-3xl font-bold">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <div className="flex gap-2 mb-6">
            {product.isNew && <Badge>New</Badge>}
            {product.onSale && <Badge variant="secondary">Sale</Badge>}
            {product.inStock ? (
              <Badge variant="outline" className="text-green-600">
                In Stock
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600">
                Out of Stock
              </Badge>
            )}
          </div>

          <p className="text-muted-foreground mb-6">{product.description}</p>

          {product.colors.length > 0 && (
            <div className="mb-6">
              <label className="block font-medium mb-2">Color</label>
              <div className="flex gap-2">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      selectedColor === color
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes.length > 0 && (
            <div className="mb-6">
              <label className="block font-medium mb-2">Size</label>
              <div className="flex gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded-lg border-2 ${
                      selectedSize === size
                        ? "border-primary bg-primary/10"
                        : "border-border"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="gradient"
            size="lg"
            className="w-full"
            onClick={handleAddToCart}
            disabled={!product.inStock}
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
        </div>
      </div>

      <div className="mt-12">
        <ProductReviews
          productId={params.id as string}
          reviews={reviews}
          averageRating={product.rating || 0}
          isAuthenticated={isAuthenticated}
          onReviewAdded={fetchReviews}
        />
      </div>
    </div>
  )
}
