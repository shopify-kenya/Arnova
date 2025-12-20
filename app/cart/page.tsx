"use client"

import { useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProtectedRoute } from "@/components/protected-route"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { CurrencyProvider, useCurrency } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { toast } from "sonner"

function CartPageContent() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const { cart, removeItem, updateQuantity, total, itemCount } = useCart()
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (!isAuthenticated && cart.length > 0) {
      toast.error("Please sign in to continue")
    }
  }, [isAuthenticated, cart.length])

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to checkout")
      router.push("/login")
      return
    }
    router.push("/checkout")
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <GlassCard className="p-12" strong>
              <ShoppingBag className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                Your Cart is Empty
              </h1>
              <p className="text-muted-foreground mb-8">
                Start shopping to add items to your cart
              </p>
              <Link href="/new-arrivals">
                <Button size="lg">
                  Browse Products
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </GlassCard>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
              Shopping Cart
            </h1>
            <p className="text-muted-foreground">
              {itemCount} items in your cart
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, index) => {
                const price =
                  item.product.onSale && item.product.salePrice
                    ? item.product.salePrice
                    : item.product.price
                return (
                  <motion.div
                    key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard className="p-4">
                      <div className="flex gap-4">
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          width={96}
                          height={96}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-1">
                            {item.product.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-2">
                            {item.selectedColor} • {item.selectedSize}
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-transparent"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                              <span className="w-8 text-center font-medium">
                                {item.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-8 w-8 bg-transparent"
                                onClick={() =>
                                  updateQuantity(
                                    item.product.id,
                                    item.selectedSize,
                                    item.selectedColor,
                                    item.quantity + 1
                                  )
                                }
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            <span className="font-bold text-foreground">
                              {formatPrice(price * item.quantity)}
                            </span>
                          </div>
                        </div>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => {
                            removeItem(
                              item.product.id,
                              item.selectedSize,
                              item.selectedColor
                            )
                            toast.success("Removed from cart")
                          }}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </GlassCard>
                  </motion.div>
                )
              })}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <GlassCard className="p-6 sticky top-24" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Order Summary
                </h2>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Shipping</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span>
                    <span>Calculated at checkout</span>
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between text-lg font-bold text-foreground">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>
                </div>
                <Button className="w-full" size="lg" onClick={handleCheckout}>
                  Proceed to Checkout
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Link href="/new-arrivals">
                  <Button
                    variant="outline"
                    className="w-full mt-3 bg-transparent"
                  >
                    Continue Shopping
                  </Button>
                </Link>
              </GlassCard>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default function CartPage() {
  return (
    <ProtectedRoute>
      <CurrencyProvider>
        <CartPageContent />
      </CurrencyProvider>
    </ProtectedRoute>
  )
}
