"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { useAuth } from "@/components/auth-provider"

const sidebarItems = [
  {
    title: "Profile",
    href: "/profile",
    icon: User,
    description: "Manage your account",
  },
  {
    title: "Orders",
    href: "/profile/orders",
    icon: ShoppingBag,
    description: "View order history",
  },
  {
    title: "Saved Items",
    href: "/saved",
    icon: Heart,
    description: "Your wishlist",
  },
  {
    title: "Addresses",
    href: "/profile/addresses",
    icon: MapPin,
    description: "Shipping addresses",
  },
  {
    title: "Payment Methods",
    href: "/profile/payment",
    icon: CreditCard,
    description: "Manage payments",
  },
  {
    title: "Settings",
    href: "/profile/settings",
    icon: Settings,
    description: "Account preferences",
  },
]

export function BuyerSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { logout, user, isAuthenticated } = useAuth()

  // Don't render sidebar if user is not authenticated
  if (!isAuthenticated || !user) {
    return null
  }

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        className="fixed top-20 left-4 z-50 lg:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed left-0 top-0 h-full w-72 z-50 lg:translate-x-0 lg:static lg:z-auto"
      >
        <GlassCard className="h-full rounded-none lg:rounded-2xl lg:m-4 lg:h-[calc(100vh-2rem)]">
          <div className="p-6">
            {/* User Info */}
            <div className="mb-8 pt-16 lg:pt-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">
                    {user?.firstName || "Guest"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {user?.email || "Not logged in"}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map(item => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-xl transition-all duration-200 group ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <item.icon
                      className={`h-5 w-5 transition-transform group-hover:scale-110 ${
                        isActive ? "text-primary-foreground" : ""
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs opacity-70">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                )
              })}
            </nav>

            {/* Logout Button */}
            <div className="mt-8 pt-6 border-t border-border">
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </GlassCard>
      </motion.aside>

      {/* Spacer for desktop */}
      <div className="hidden lg:block w-80" />
    </>
  )
}
