"use client"


import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CurrencyProvider, useCurrency } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

function AdminOrdersContent() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()
  const { formatPrice } = useCurrency()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAdmin) return null

  const mockOrders = [
    {
      id: "ORD-1234",
      customer: "John Doe",
      email: "john@example.com",
      total: 259.99,
      status: "pending",
      items: 3,
      date: "2024-01-15",
    },
    {
      id: "ORD-1233",
      customer: "Jane Smith",
      email: "jane@example.com",
      total: 189.5,
      status: "processing",
      items: 2,
      date: "2024-01-15",
    },
    {
      id: "ORD-1232",
      customer: "Bob Johnson",
      email: "bob@example.com",
      total: 449.99,
      status: "shipped",
      items: 5,
      date: "2024-01-14",
    },
    {
      id: "ORD-1231",
      customer: "Alice Williams",
      email: "alice@example.com",
      total: 129.99,
      status: "delivered",
      items: 1,
      date: "2024-01-14",
    },
    {
      id: "ORD-1230",
      customer: "Charlie Brown",
      email: "charlie@example.com",
      total: 89.99,
      status: "cancelled",
      items: 1,
      date: "2024-01-13",
    },
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "outline" as const, icon: Clock, color: "text-yellow-500" },
      processing: { variant: "default" as const, icon: Package, color: "text-blue-500" },
      shipped: { variant: "default" as const, icon: Package, color: "text-purple-500" },
      delivered: { variant: "default" as const, icon: CheckCircle, color: "text-green-500" },
      cancelled: { variant: "destructive" as const, icon: XCircle, color: "text-red-500" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1 w-fit">
        <Icon className={`h-3 w-3 ${config.color}`} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-8">
            <h1 className="font-serif text-5xl font-bold text-foreground mb-2">Orders</h1>
            <p className="text-muted-foreground">Manage customer orders</p>
          </div>

          <GlassCard className="overflow-hidden" strong>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-foreground">Order ID</th>
                    <th className="text-left p-4 font-semibold text-foreground">Customer</th>
                    <th className="text-left p-4 font-semibold text-foreground">Date</th>
                    <th className="text-left p-4 font-semibold text-foreground">Items</th>
                    <th className="text-left p-4 font-semibold text-foreground">Total</th>
                    <th className="text-left p-4 font-semibold text-foreground">Status</th>
                    <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockOrders.map((order, index) => (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <p className="font-medium text-foreground">{order.id}</p>
                      </td>
                      <td className="p-4">
                        <div>
                          <p className="font-medium text-foreground">{order.customer}</p>
                          <p className="text-sm text-muted-foreground">{order.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{new Date(order.date).toLocaleDateString()}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-foreground">{order.items} items</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">{formatPrice(order.total)}</p>
                      </td>
                      <td className="p-4">{getStatusBadge(order.status)}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toast.success("View order details coming soon")}
                          >
                            View Details
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

      <Footer />
    </div>
  )
}

export default function AdminOrdersPage() {
  return (
    <CurrencyProvider>
      <AdminOrdersContent />
    </CurrencyProvider>
  )
}
