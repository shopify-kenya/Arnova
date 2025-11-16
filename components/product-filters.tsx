"use client"


import { useState } from "react"
import { SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { GlassCard } from "@/components/glass-card"

interface ProductFiltersProps {
  onFilterChange: (filters: FilterState) => void
}

export interface FilterState {
  priceRange: [number, number]
  sizes: string[]
  colors: string[]
  inStock: boolean
  onSale: boolean
  isNew: boolean
}

const sizes = ["XS", "S", "M", "L", "XL", "XXL", "7", "8", "9", "10", "11", "12"]
const colors = ["Black", "White", "Navy", "Gray", "Brown", "Tan", "Cream", "Camel"]

export function ProductFilters({ onFilterChange }: ProductFiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
    sizes: [],
    colors: [],
    inStock: false,
    onSale: false,
    isNew: false,
  })

  const updateFilters = (updates: Partial<FilterState>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const clearFilters = () => {
    const defaultFilters: FilterState = {
      priceRange: [0, 500],
      sizes: [],
      colors: [],
      inStock: false,
      onSale: false,
      isNew: false,
    }
    setFilters(defaultFilters)
    onFilterChange(defaultFilters)
  }

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            Clear All
          </Button>
        </div>
      </div>

      {/* Price Range */}
      <div>
        <Label className="mb-3 block">Price Range</Label>
        <Slider
          value={filters.priceRange}
          onValueChange={(value) => updateFilters({ priceRange: value as [number, number] })}
          max={500}
          step={10}
          className="mb-2"
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${filters.priceRange[0]}</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="space-y-3">
        <Label>Quick Filters</Label>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="inStock"
              checked={filters.inStock}
              onCheckedChange={(checked) => updateFilters({ inStock: checked as boolean })}
            />
            <Label htmlFor="inStock" className="cursor-pointer">
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="onSale"
              checked={filters.onSale}
              onCheckedChange={(checked) => updateFilters({ onSale: checked as boolean })}
            />
            <Label htmlFor="onSale" className="cursor-pointer">
              On Sale
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="isNew"
              checked={filters.isNew}
              onCheckedChange={(checked) => updateFilters({ isNew: checked as boolean })}
            />
            <Label htmlFor="isNew" className="cursor-pointer">
              New Arrivals
            </Label>
          </div>
        </div>
      </div>

      {/* Sizes */}
      <div>
        <Label className="mb-3 block">Sizes</Label>
        <div className="grid grid-cols-4 gap-2">
          {sizes.map((size) => (
            <Button
              key={size}
              variant={filters.sizes.includes(size) ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const newSizes = filters.sizes.includes(size)
                  ? filters.sizes.filter((s) => s !== size)
                  : [...filters.sizes, size]
                updateFilters({ sizes: newSizes })
              }}
            >
              {size}
            </Button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <Label className="mb-3 block">Colors</Label>
        <div className="grid grid-cols-2 gap-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center space-x-2">
              <Checkbox
                id={color}
                checked={filters.colors.includes(color)}
                onCheckedChange={(checked) => {
                  const newColors = checked ? [...filters.colors, color] : filters.colors.filter((c) => c !== color)
                  updateFilters({ colors: newColors })
                }}
              />
              <Label htmlFor={color} className="cursor-pointer">
                {color}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block">
        <GlassCard className="p-6 sticky top-24">
          <FilterContent />
        </GlassCard>
      </div>

      {/* Mobile Filters */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full glass bg-transparent">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Filters
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="glass-strong overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Filters</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
