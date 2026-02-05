"use client"

import { useState } from "react"
import useSWR from "swr"
import { motion } from "framer-motion"
import { BuyerNavbar } from "@/components/buyer-navbar"
import { BuyerFilterSidebar } from "@/components/buyer-filter-sidebar"
import { Search, Filter, Grid, List } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ProductCard } from "@/components/product-card"
import {
  ProductGridEmpty,
  ProductGridSkeleton,
} from "@/components/product-grid-state"
import type { Product } from "@/lib/products"
import { fetchProducts } from "@/lib/products"

export default function StorePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const categories = ["all", "clothing", "accessories", "shoes", "bags"]

  // Fetch products with SWR for auto-refresh
  const { data, isLoading } = useSWR(
    "graphql:products",
    fetchProducts,
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 10000,
      revalidateOnMount: true,
      fallbackData: [],
    }
  )

  const products = data || []

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <BuyerNavbar
        title="Store"
        subtitle="Browse all products"
        onMenuToggle={() => setIsFilterOpen(true)}
      />

      <BuyerFilterSidebar
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Search and Filters */}
          <GlassCard className="p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="pl-10 glass"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                {/* Category Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-muted-foreground" />
                  <label htmlFor="category-filter" className="sr-only">
                    Filter by category
                  </label>
                  <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="bg-background/50 border border-border rounded-md px-3 py-2 text-sm"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center gap-1 bg-background/50 rounded-md p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Products Grid */}
          {isLoading ? (
            <ProductGridSkeleton count={viewMode === "grid" ? 8 : 4} />
          ) : filteredProducts.length === 0 ? (
            <ProductGridEmpty
              title="No products found"
              description="Try updating your search or filters."
            />
          ) : (
            <motion.div
              className={`grid gap-6 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                  : "grid-cols-1"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              {filteredProducts.map((product: Product, index: number) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} index={index} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
