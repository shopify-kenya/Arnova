"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Heart, ShoppingBag } from "lucide-react"
import { BuyerNavbar } from "@/components/buyer-navbar"
import { BuyerFilterSidebar } from "@/components/buyer-filter-sidebar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { getSavedProducts } from "@/lib/saved"
import type { Product } from "@/lib/products"

export default function SavedPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [savedProducts, setSavedProducts] = useState<Product[]>([])
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    setSavedProducts(getSavedProducts())
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  if (savedProducts.length === 0) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen">
          <BuyerNavbar
            title="Saved Items"
            subtitle="Your wishlist is empty"
            onMenuToggle={() => setIsFilterOpen(true)}
          />
          <BuyerFilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
          <main className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <GlassCard className="p-12" strong>
                <Heart className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
                <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                  No Saved Items
                </h1>
                <p className="text-muted-foreground mb-8">
                  Save your favorite items to view them here
                </p>
                <Link href="/store">
                  <Button size="lg">
                    <ShoppingBag className="mr-2 h-5 w-5" />
                    Start Shopping
                  </Button>
                </Link>
              </GlassCard>
            </motion.div>
          </main>
          <Footer />
        </div>
      </CurrencyProvider>
    )
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        <BuyerNavbar
          title="Saved Items"
          subtitle={`${savedProducts.length} items saved`}
          onMenuToggle={() => setIsFilterOpen(true)}
        />
        <BuyerFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {savedProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  )
}
