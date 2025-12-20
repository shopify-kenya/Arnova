"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductFilters, type FilterState } from "@/components/product-filters"
import { CurrencyProvider } from "@/components/currency-provider"
import { getProductsByCategory } from "@/lib/products"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function ShoesPage() {
  const [sortBy, setSortBy] = useState("newest")
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    inStock: false,
    onSale: false,
    isNew: false,
  })

  let products = getProductsByCategory("shoes")

  products = products.filter(product => {
    if (filters.inStock && !product.inStock) return false
    if (filters.onSale && !product.onSale) return false
    if (filters.isNew && !product.isNew) return false
    if (
      filters.sizes.length > 0 &&
      !product.sizes.some(s => filters.sizes.includes(s))
    )
      return false
    if (
      filters.colors.length > 0 &&
      !product.colors.some(c => filters.colors.includes(c))
    )
      return false
    const price =
      product.onSale && product.salePrice ? product.salePrice : product.price
    if (price < filters.priceRange[0] || price > filters.priceRange[1])
      return false
    return true
  })

  products = [...products].sort((a, b) => {
    switch (sortBy) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "rating":
        return b.rating - a.rating
      default:
        return 0
    }
  })

  return (
    <CurrencyProvider>
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
                Shoes
              </h1>
              <p className="text-muted-foreground">
                Step into style and comfort
              </p>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
              <div className="lg:w-64 flex-shrink-0">
                <ProductFilters onFilterChange={setFilters} />
              </div>

              <div className="flex-1">
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">
                    {products.length} products
                  </p>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px] glass">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="glass-strong">
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price-low">
                        Price: Low to High
                      </SelectItem>
                      <SelectItem value="price-high">
                        Price: High to Low
                      </SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, index) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      index={index}
                    />
                  ))}
                </div>

                {products.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      No products found matching your filters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </CurrencyProvider>
  )
}
