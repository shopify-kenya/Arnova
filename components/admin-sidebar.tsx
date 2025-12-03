"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { BarChart3, Package, Users, ShoppingCart, Home, LogOut } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth-provider"
import { ThemeToggle } from "@/components/theme-toggle"

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const sidebarLinks = [
    { href: "/admin", label: "Dashboard", icon: BarChart3 },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
    { href: "/admin/users", label: "Users", icon: Users },
    { href: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  ]

  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="fixed left-0 top-0 h-full w-64 z-50"
    >
      <GlassCard className="h-full rounded-none border-r border-l-0 border-t-0 border-b-0 p-6">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 mb-8">
            <img src="/placeholder-logo.png" alt="Arnova" className="h-8 w-8" />
            <h1 className="font-serif text-2xl font-bold text-primary">Arnova</h1>
          </Link>

          {/* User Info */}
          <div className="mb-6 p-3 rounded-lg bg-primary/10">
            <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground">{user?.email}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {sidebarLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={pathname === link.href ? "default" : "ghost"}
                  className="w-full justify-start"
                >
                  <link.icon className="mr-3 h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="space-y-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                <Home className="mr-3 h-4 w-4" />
                Back to Store
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive"
              onClick={logout}
            >
              <LogOut className="mr-3 h-4 w-4" />
              Sign Out
            </Button>
            <div className="flex justify-center pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.aside>
  )
}