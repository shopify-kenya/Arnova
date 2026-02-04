"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ShoppingCart, Heart, User, Search, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/components/cart-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/glass-card"

interface BuyerNavbarProps {
  title?: string
  subtitle?: string
  onMenuToggle?: () => void
}

export function BuyerNavbar({
  title = "Arnova",
  subtitle,
  onMenuToggle,
}: BuyerNavbarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { itemCount } = useCart()

  return (
    <motion.header
      className="sticky top-0 z-50 w-full"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <GlassCard className="rounded-none border-x-0 border-t-0" hover={false}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Hamburger Menu & Title */}
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" onClick={onMenuToggle}>
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="font-serif text-xl font-bold text-primary">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-xs text-muted-foreground">{subtitle}</p>
                )}
              </div>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-10 glass"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Search - Mobile */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Saved */}
              <Link href="/saved">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              {/* Cart */}
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {itemCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Profile */}
              <Link href="/profile">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 md:hidden"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    className="pl-10 glass"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </GlassCard>
    </motion.header>
  )
}
