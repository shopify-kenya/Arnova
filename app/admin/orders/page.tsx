"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Eye, Search } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface Order {
  id: number
  order_id: string
  user: string
  total_amount: number
  status: string
  created_at: string
}

export default function AdminOrdersPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
      return
    }
    fetchOrders()
  }, [isAuthenticated, isAdmin, router])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders/")
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
      }
    } catch (error) {
      toast.error("Failed to fetch orders")
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin) return null

  const filteredOrders = orders.filter(
    order =>
      order.order_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading orders...</p>
          </div>
        </div>
      </CurrencyProvider>
    )
  }

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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
                  Orders
                </h1>
                <p className="text-muted-foreground">Manage customer orders</p>
              </div>
            </div>

            <GlassCard className="p-6 mb-6" strong>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 glass"
                />
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden" strong>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Order ID
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Customer
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Amount
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Status
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Date
                      </th>
                      <th className="text-right p-4 font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, index) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <p className="font-medium text-foreground">
                            {order.order_id}
                          </p>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">{order.user}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium text-foreground">
                            ${order.total_amount.toFixed(2)}
                          </p>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{order.status}</Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() =>
                                toast.success("View functionality coming soon")
                              }
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        </main>
      </div>
    </CurrencyProvider>
  )
}
