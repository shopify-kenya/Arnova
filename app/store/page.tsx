"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import useSWR from "swr"
import { motion } from "framer-motion"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Search, SlidersHorizontal } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ProductCard } from "@/components/product-card"
import {
  ProductGridEmpty,
  ProductGridSkeleton,
} from "@/components/product-grid-state"
import type { Product } from "@/lib/products"
import { fetchProducts } from "@/lib/products"

const CATEGORIES = ["all", "clothing", "shoes", "bags", "accessories"]
const PRICE_RANGES = [
  { label: "All Prices", min: 0, max: Infinity },
  { label: "Under $100", min: 0, max: 100 },
  { label: "$100 - $300", min: 100, max: 300 },
  { label: "$300 - $500", min: 300, max: 500 },
  { label: "$500+", min: 500, max: Infinity },
]

export default function StorePage() {
  const searchParams = useSearchParams()
  const categoryParam = searchParams.get("category") || "all"
  const filterParam = searchParams.get("filter")

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState(categoryParam)
  const [selectedPrice, setSelectedPrice] = useState(0)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setSelectedCategory(categoryParam)
  }, [categoryParam])

  const { data, error, isLoading } = useSWR("graphql:products", fetchProducts, {
    revalidateOnMount: true,
    fallbackData: [],
  })

  const products = data || []

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory
    const matchesFilter =
      !filterParam ||
      (filterParam === "new" && product.isNew) ||
      (filterParam === "sale" && product.onSale)
    const range = PRICE_RANGES[selectedPrice]
    const price =
      product.onSale && product.salePrice ? product.salePrice : product.price
    const matchesPrice = price >= range.min && price < range.max
    return matchesSearch && matchesCategory && matchesFilter && matchesPrice
  })

  const title =
    filterParam === "new"
      ? "New Arrivals"
      : filterParam === "sale"
        ? "Deals"
        : selectedCategory !== "all"
          ? selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)
          : "All Products"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 pt-28 pb-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{title}</h1>
            <p className="text-muted-foreground mt-1">
              Showing {filteredProducts.length} results
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2 lg:hidden"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filter
            </Button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters */}
          <aside
            className={`w-56 flex-shrink-0 space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}
          >
            {/* Categories */}
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">
                Categories
              </h3>
              <div className="space-y-1">
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === cat
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <h3 className="font-semibold text-sm text-foreground mb-3 uppercase tracking-wide">
                Price Range
              </h3>
              <div className="space-y-1">
                {PRICE_RANGES.map((range, idx) => (
                  <button
                    key={range.label}
                    onClick={() => setSelectedPrice(idx)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedPrice === idx
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {isLoading ? (
              <ProductGridSkeleton count={8} />
            ) : error ? (
              <ProductGridEmpty
                title="Unable to load products"
                description="Please try again shortly."
              />
            ) : filteredProducts.length === 0 ? (
              <ProductGridEmpty
                title="No products found"
                description="Try updating your search or filters."
              />
            ) : (
              <motion.div
                className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
              >
                {filteredProducts.map((product: Product, index: number) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    index={index}
                  />
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
