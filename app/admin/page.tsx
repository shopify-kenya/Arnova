"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  DollarSign,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlassCard } from "@/components/glass-card"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"

export default function AdminDashboardPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAdmin) return null

  const stats = [
    {
      title: "Total Revenue",
      value: "$45,231",
      change: "+12.5%",
      icon: DollarSign,
      color: "text-green-500",
    },
    {
      title: "Total Orders",
      value: "1,234",
      change: "+8.2%",
      icon: ShoppingCart,
      color: "text-blue-500",
    },
    {
      title: "Total Products",
      value: "156",
      change: "+3.1%",
      icon: Package,
      color: "text-purple-500",
    },
    {
      title: "Total Customers",
      value: "892",
      change: "+15.3%",
      icon: Users,
      color: "text-orange-500",
    },
  ]

  const quickActions = [
    {
      title: "Manage Products",
      description: "Add, edit, or remove products",
      href: "/admin/products",
      icon: Package,
    },
    {
      title: "View Orders",
      description: "Process and manage orders",
      href: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      title: "Manage Users",
      description: "View and manage customers",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "Analytics",
      description: "View detailed analytics",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
  ]

  return (
    <ProtectedRoute requireAdmin>
      <CurrencyProvider>
        <div className="min-h-screen flex">
          <AdminSidebar />

          <main className="flex-1 ml-72 lg:ml-72 md:ml-64 sm:ml-56 p-4 md:p-6 lg:p-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Manage your e-commerce platform
                </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <GlassCard className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <stat.icon className={`h-8 w-8 ${stat.color}`} />
                        <span className="text-sm font-medium text-green-500">
                          {stat.change}
                        </span>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">
                        {stat.value}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {stat.title}
                      </p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h2 className="font-serif text-3xl font-bold text-foreground mb-6">
                  Quick Actions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {quickActions.map((action, index) => (
                    <motion.div
                      key={action.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                    >
                      <Link href={action.href}>
                        <GlassCard className="p-6 h-full group cursor-pointer">
                          <action.icon className="h-10 w-10 text-primary mb-4 transition-transform group-hover:scale-110" />
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            {action.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                        </GlassCard>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Recent Activity */}
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Recent Activity
                </h2>
                <div className="space-y-4">
                  {[
                    {
                      action: "New order placed",
                      details: "Order #1234 - $129.99",
                      time: "5 minutes ago",
                    },
                    {
                      action: "Product updated",
                      details: "Premium Cotton T-Shirt",
                      time: "1 hour ago",
                    },
                    {
                      action: "New customer registered",
                      details: "john.doe@example.com",
                      time: "2 hours ago",
                    },
                    {
                      action: "Order shipped",
                      details: "Order #1230 - $89.99",
                      time: "3 hours ago",
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {activity.action}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {activity.details}
                        </p>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {activity.time}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </main>
        </div>
      </CurrencyProvider>
    </ProtectedRoute>
  )
}
