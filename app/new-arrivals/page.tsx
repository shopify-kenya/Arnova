"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { BuyerNavbar } from "@/components/buyer-navbar"
import { BuyerFilterSidebar } from "@/components/buyer-filter-sidebar"
import { Footer } from "@/components/footer"
import { ProductCard } from "@/components/product-card"
import { ProductFilters, type FilterState } from "@/components/product-filters"
import { CurrencyProvider } from "@/components/currency-provider"
import { fetchProducts, filterNewArrivals } from "@/lib/products"
import {
  ProductGridEmpty,
  ProductGridSkeleton,
} from "@/components/product-grid-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function NewArrivalsPage() {
  const [sortBy, setSortBy] = useState("newest")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    inStock: false,
    onSale: false,
    isNew: false,
  })

  const { data: allProducts = [], isLoading } = useSWR(
    "graphql:products",
    fetchProducts
  )

  let products = filterNewArrivals(allProducts)

  // Apply filters
  products = products.filter(product => {
    if (filters.inStock && !product.inStock) return false
    if (filters.onSale && !product.onSale) return false
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

  // Apply sorting
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
        <BuyerNavbar
          title="New Arrivals"
          subtitle="Latest fashion trends"
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
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Filters Sidebar - Desktop */}
              <div className="lg:w-64 flex-shrink-0 hidden lg:block">
                <ProductFilters onFilterChange={setFilters} />
              </div>

              {/* Products Grid */}
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

                {isLoading ? (
                  <ProductGridSkeleton />
                ) : products.length === 0 ? (
                  <ProductGridEmpty
                    title="No new arrivals yet"
                    description="We couldn't find any new arrivals matching your filters."
                  />
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        index={index}
                      />
                    ))}
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
