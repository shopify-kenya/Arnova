"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  MapPin,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { UserLocationsMap } from "@/components/user-locations-map"
import { toast } from "sonner"

interface AnalyticsData {
  total_orders: number
  total_revenue: number
  total_users: number
  total_products: number
  user_locations: Array<{
    user: string
    city: string
    country: string
    lat: number
    lng: number
    orders: number
    last_login: string
  }>
  category_preferences: Array<{
    name: string
    saved_items: number
    orders: number
    popularity_score: number
  }>
  sales_trends: Array<{
    month: string
    sales: number
    orders: number
  }>
  login_activity: Array<{
    date: string
    logins: number
    unique_users: number
  }>
}

export default function AdminAnalyticsPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
      return
    }
    fetchAnalytics()
  }, [isAuthenticated, isAdmin, router])

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics/", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      toast.error("Failed to fetch analytics")
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  if (loading) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading analytics...</p>
          </div>
        </div>
      </CurrencyProvider>
    )
  }

  if (!analytics) return null

  const metrics = [
    {
      title: "Revenue",
      value: `$${analytics.total_revenue.toFixed(2)}`,
      change: "+12.5%",
      icon: DollarSign,
    },
    {
      title: "Orders",
      value: analytics.total_orders.toString(),
      change: "+8.2%",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      value: analytics.total_users.toString(),
      change: "+15.3%",
      icon: Users,
    },
    {
      title: "Products",
      value: analytics.total_products.toString(),
      change: "+3.1%",
      icon: Package,
    },
  ]

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "locations", label: "User Locations", icon: MapPin },
    { id: "categories", label: "Categories", icon: PieChart },
    { id: "trends", label: "Sales Trends", icon: TrendingUp },
    { id: "activity", label: "Login Activity", icon: Activity },
  ]

  return (
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
                Analytics
              </h1>
              <p className="text-muted-foreground">
                Advanced business intelligence and user insights
              </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

            {/* Tab Navigation */}
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map(tab => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "outline"}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex items-center gap-2"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && analytics && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <GlassCard className="p-6" strong>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                    Quick Stats
                  </h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Users</span>
                      <span className="font-bold">{analytics.total_users}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Locations</span>
                      <span className="font-bold">
                        {analytics.user_locations.length}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories</span>
                      <span className="font-bold">
                        {analytics.category_preferences.length}
                      </span>
                    </div>
                  </div>
                </GlassCard>

                <GlassCard className="p-6" strong>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                    Recent Trends
                  </h2>
                  <div className="space-y-4">
                    {analytics.sales_trends.slice(0, 3).map((trend, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{trend.month}</span>
                        <span className="font-bold">
                          ${trend.sales.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>
            )}

            {activeTab === "locations" && analytics && (
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  User Locations Map
                </h2>
                <UserLocationsMap locations={analytics.user_locations} />
              </GlassCard>
            )}

            {activeTab === "categories" && analytics && (
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Category Preferences
                </h2>
                <div className="space-y-4">
                  {analytics.category_preferences?.map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{category.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.saved_items} saved • {category.orders}{" "}
                          orders
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">
                          {category.popularity_score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          popularity
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeTab === "trends" && analytics && (
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Sales Trends
                </h2>
                <div className="space-y-4">
                  {analytics.sales_trends?.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{trend.month}</h3>
                        <p className="text-sm text-muted-foreground">
                          {trend.orders} orders
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-500">
                          ${trend.sales.toLocaleString()}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          revenue
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}

            {activeTab === "activity" && analytics && (
              <GlassCard className="p-6" strong>
                <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                  Login Activity (Last 7 Days)
                </h2>
                <div className="space-y-4">
                  {analytics.login_activity?.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">
                          {new Date(activity.date).toLocaleDateString()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {activity.unique_users} unique users
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-blue-500">
                          {activity.logins}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          total logins
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            )}
          </motion.div>
        </main>
      </div>
    </CurrencyProvider>
  )
}
