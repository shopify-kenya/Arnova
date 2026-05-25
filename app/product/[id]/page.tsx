"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import Image from "next/image"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/components/currency-provider"
import { useCart } from "@/components/cart-provider"
import { useAuth } from "@/components/auth-provider"
import { useSavedItems } from "@/components/saved-items-provider"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import type { Product } from "@/lib/products"
import { graphqlRequest } from "@/lib/graphql-client"
import { ProductReviews } from "@/components/product-reviews"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

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
    graphqlRequest<{ productReviews: { reviews: any[] } }>(
      `query ProductReviews($id: Int!) {
        productReviews(id: $id) { reviews { id user rating comment createdAt } }
      }`,
      { id: Number(params.id) }
    )
      .then(data => setReviews(data.productReviews.reviews || []))
      .catch(() => {})
  }

  useEffect(() => {
    graphqlRequest<{ product: Product }>(
      `query Product($id: Int!) {
        product(id: $id) {
          id name description price salePrice currency baseCurrency
          category sizes colors images inStock isNew onSale rating reviews
        }
      }`,
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

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container pt-28 pb-12">
          <div className="animate-pulse grid md:grid-cols-2 gap-10">
            <div className="aspect-[4/5] bg-muted rounded-2xl" />
            <div className="space-y-4 pt-8">
              <div className="h-8 bg-muted rounded w-2/3" />
              <div className="h-6 bg-muted rounded w-1/3" />
              <div className="h-20 bg-muted rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const isSaved = isProductSaved(product.id)

  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please login to save items")
      router.push("/login")
      return
    }
    if (isSaved) await removeSavedItem(product.id)
    else await addSavedItem(product.id)
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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
          {/* Images */}
          <div>
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-muted">
              <Image
                src={product.images[selectedImage] || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                      selectedImage === idx
                        ? "border-accent"
                        : "border-transparent hover:border-border"
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
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col pt-2">
            <div className="flex items-start justify-between">
              <h1 className="text-3xl lg:text-4xl font-bold text-foreground">
                {product.name}
              </h1>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-full"
                onClick={handleSave}
              >
                <Heart
                  className={`h-5 w-5 ${isSaved ? "fill-current text-red-500" : "text-muted-foreground"}`}
                />
              </Button>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-2">
              <Star className="h-4 w-4 fill-current text-amber-500" />
              <span className="font-medium text-sm">{product.rating}</span>
              <span className="text-sm text-muted-foreground">
                ({product.reviews} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-6">
              {product.onSale && product.salePrice ? (
                <>
                  <span className="text-3xl font-bold text-foreground">
                    {formatPrice(product.salePrice)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold text-foreground">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>

            {/* Badges */}
            <div className="flex gap-2 mt-4">
              {product.onSale && (
                <Badge className="bg-foreground text-background">Sale</Badge>
              )}
              {product.inStock ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-600/30"
                >
                  In Stock
                </Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="text-red-600 border-red-600/30"
                >
                  Out of Stock
                </Badge>
              )}
            </div>

            {/* Description */}
            <p className="text-muted-foreground mt-6 leading-relaxed">
              {product.description}
            </p>

            {/* Color */}
            {product.colors.length > 0 && (
              <div className="mt-8">
                <label className="block font-semibold text-sm mb-3">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                        selectedColor === color
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            {product.sizes.length > 0 && (
              <div className="mt-6">
                <label className="block font-semibold text-sm mb-3">Size</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-12 rounded-lg border text-sm font-medium transition-all flex items-center justify-center ${
                        selectedSize === size
                          ? "border-accent bg-accent/10 text-foreground"
                          : "border-border text-muted-foreground hover:border-foreground/30"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Cart */}
            <Button
              size="lg"
              className="w-full mt-8 bg-accent hover:bg-accent/90 text-accent-foreground font-semibold rounded-xl h-14 text-base"
              onClick={handleAddToCart}
              disabled={!product.inStock}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
          </div>
        </div>

        {/* Reviews */}
        <div className="mt-16">
          <ProductReviews
            productId={params.id as string}
            reviews={reviews}
            averageRating={product.rating || 0}
            isAuthenticated={isAuthenticated}
            onReviewAdded={fetchReviews}
          />
        </div>
      </main>

      <Footer />
    </div>
  )
}
