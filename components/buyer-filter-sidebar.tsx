"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  X,
  Home,
  Package,
  Tag,
  Sparkles,
  User,
  ShoppingBag,
  Heart,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { useAuth } from "@/components/auth-provider"

const navigationLinks = [
  {
    href: "/store",
    label: "Store",
    icon: Home,
    description: "Browse all products",
  },
  {
    href: "/new-arrivals",
    label: "New Arrivals",
    icon: Sparkles,
    description: "Latest products",
  },
  {
    href: "/clothing",
    label: "Categories",
    icon: Package,
    description: "Browse by category",
  },
  { href: "/sale", label: "Deals", icon: Tag, description: "Special offers" },
  {
    href: "/profile",
    label: "Profile",
    icon: User,
    description: "Manage account",
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ShoppingBag,
    description: "Order history",
  },
  {
    href: "/saved",
    label: "Saved Items",
    icon: Heart,
    description: "Your wishlist",
  },
]

interface BuyerFilterSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function BuyerFilterSidebar({
  isOpen,
  onClose,
}: BuyerFilterSidebarProps) {
  const pathname = usePathname()
  const { user } = useAuth()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 z-50"
          >
            <GlassCard className="h-full rounded-none">
              <div className="p-6">
                {/* Header with Logo */}
                <div className="flex items-center justify-between mb-6">
                  <Link
                    href="/store"
                    className="flex items-center space-x-3"
                    onClick={onClose}
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">A</span>
                    </div>
                    <div>
                      <h2 className="font-serif text-xl font-bold text-primary">
                        Arnova
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Premium Fashion
                      </p>
                    </div>
                  </Link>
                  <Button variant="ghost" size="icon" onClick={onClose}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* User Info */}
                {user && (
                  <div className="mb-6 p-4 bg-primary/10 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <nav className="space-y-2">
                  {navigationLinks.map(link => {
                    const isActive = pathname === link.href
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={onClose}
                        className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <link.icon
                          className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                            isActive ? "text-primary-foreground" : ""
                          }`}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{link.label}</div>
                          <div className="text-xs opacity-70">
                            {link.description}
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </nav>

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link href="/cart" onClick={onClose}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start"
                      >
                        <ShoppingBag className="h-4 w-4 mr-2" />
                        View Cart
                      </Button>
                    </Link>
                    <Link href="/checkout" onClick={onClose}>
                      <Button size="sm" className="w-full justify-start">
                        <Package className="h-4 w-4 mr-2" />
                        Checkout
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
