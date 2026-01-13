"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import Image from "next/image"
import {
  BarChart3,
  Package,
  Users,
  ShoppingCart,
  Home,
  LogOut,
  Settings,
  Bell,
  Search,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const getNavigationByRole = (role: string) => {
    if (role === "admin") {
      return [
        { href: "/admin", label: "Dashboard", icon: BarChart3 },
        { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
        { href: "/admin/products", label: "Products", icon: Package },
        { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
        { href: "/admin/users", label: "Users", icon: Users },
        { href: "/admin/settings", label: "Settings", icon: Settings },
      ]
    }

    // Regular user accessing admin area (limited access)
    return [
      { href: "/admin", label: "Dashboard", icon: BarChart3 },
      { href: "/admin/orders", label: "My Orders", icon: ShoppingCart },
      { href: "/profile", label: "Profile", icon: Users },
    ]
  }

  const sidebarLinks = getNavigationByRole(user?.role || "user")

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-72 z-50 bg-background/95 backdrop-blur-xl border-r border-border/50 lg:w-72 md:w-64 sm:w-56"
    >
      <div className="flex flex-col h-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
              <Image
                src="/placeholder-logo.png"
                alt="Arnova"
                width={32}
                height={32}
                className="h-8 w-8"
              />
            </div>
            <h1 className="font-bold text-xl">Arnova</h1>
          </Link>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
            <ThemeToggle />
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>

        {/* User Info */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email}
              </p>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
                {user?.role === "admin" ? "Administrator" : "User"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1">
          {sidebarLinks.map((link, index) => {
            const isActive = pathname === link.href
            return (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={link.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`w-full justify-start h-11 px-4 ${
                      isActive
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <link.icon className="mr-3 h-4 w-4" />
                    <span className="font-medium">{link.label}</span>
                  </Button>
                </Link>
              </motion.div>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="space-y-2 pt-4 border-t border-border/50">
          <Link href="/">
            <Button variant="ghost" className="w-full justify-start h-11">
              <Home className="mr-3 h-4 w-4" />
              <span className="font-medium">Back to Store</span>
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full justify-start h-11 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            <span className="font-medium">Sign Out</span>
          </Button>
        </div>
      </div>
    </motion.aside>
  )
}
