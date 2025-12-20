"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAdmin) return null

  const metrics = [
    {
      title: "Revenue",
      value: "$45,231",
      change: "+12.5%",
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Orders",
      value: "1,234",
      change: "+8.2%",
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Customers",
      value: "892",
      change: "+15.3%",
      icon: Users,
      trend: "up",
    },
    {
      title: "Products",
      value: "156",
      change: "+3.1%",
      icon: Package,
      trend: "up",
    },
    {
      title: "Avg Order Value",
      value: "$36.67",
      change: "+4.8%",
      icon: TrendingUp,
      trend: "up",
    },
    {
      title: "Page Views",
      value: "12,456",
      change: "+22.1%",
      icon: Eye,
      trend: "up",
    },
  ]

  const topProducts = [
    { name: "Premium Cotton T-Shirt", sales: 234, revenue: "$10,530" },
    { name: "Leather Sneakers", sales: 189, revenue: "$24,381" },
    { name: "Slim Fit Jeans", sales: 167, revenue: "$13,193" },
    { name: "Cashmere Sweater", sales: 145, revenue: "$23,055" },
    { name: "Leather Tote Bag", sales: 123, revenue: "$24,477" },
  ]

  const recentOrders = [
    {
      id: "ORD-1234",
      customer: "John Doe",
      amount: "$259.99",
      status: "Completed",
    },
    {
      id: "ORD-1233",
      customer: "Jane Smith",
      amount: "$189.50",
      status: "Processing",
    },
    {
      id: "ORD-1232",
      customer: "Bob Johnson",
      amount: "$449.99",
      status: "Shipped",
    },
    {
      id: "ORD-1231",
      customer: "Alice Williams",
      amount: "$129.99",
      status: "Completed",
    },
  ]

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-8">
              <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Track your business performance
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {metrics.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.4 }}
                >
                  <GlassCard className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <metric.icon className="h-8 w-8 text-primary" />
                      <span className="text-sm font-medium text-green-500">
                        {metric.change}
                      </span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground mb-1">
                      {metric.value}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {metric.title}
                    </p>
                  </GlassCard>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Products */}
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Top Products
                </h2>
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {product.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {product.sales} sales
                        </p>
                      </div>
                      <span className="font-bold text-foreground">
                        {product.revenue}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>

              {/* Recent Orders */}
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Recent Orders
                </h2>
                <div className="space-y-4">
                  {recentOrders.map((order, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between py-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {order.id}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.customer}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-foreground">
                          {order.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {order.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </main>

        <Footer />
      </div>
    </CurrencyProvider>
  )
}
