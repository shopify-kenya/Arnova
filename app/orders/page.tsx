"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { Package, Calendar, MapPin, CreditCard, Eye } from "lucide-react"
import { BuyerNavbar } from "@/components/buyer-navbar"
import { BuyerFilterSidebar } from "@/components/buyer-filter-sidebar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CurrencyProvider, useCurrency } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled"
  total: number
  items: {
    name: string
    quantity: number
    price: number
    image: string
  }[]
  shippingAddress: {
    name: string
    address: string
    city: string
    country: string
  }
  paymentMethod: string
}

function OrdersPageContent() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { formatPrice } = useCurrency()
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    const fetchOrders = async () => {
      try {
        const { graphqlRequest } = await import("@/lib/graphql-client")
        const data = await graphqlRequest<{
          orders: {
            id: number
            orderId: string
            totalAmount: number
            status: string
            createdAt: string
            items: { productName: string; quantity: number; price: number }[]
          }[]
        }>(`
          query Orders {
            orders {
              id
              orderId
              totalAmount
              status
              createdAt
              items {
                productName
                quantity
                price
              }
            }
          }
        `)

        const mapped = (data.orders || []).map(order => ({
          id: order.id.toString(),
          date: order.createdAt,
          status: order.status as Order["status"],
          total: order.totalAmount,
          items: order.items.map(item => ({
            name: item.productName,
            quantity: item.quantity,
            price: item.price,
            image: "/placeholder.svg",
          })),
          shippingAddress: {
            name: user?.firstName || "Customer",
            address: "N/A",
            city: "N/A",
            country: "N/A",
          },
          paymentMethod: "card",
        }))
        setOrders(mapped)
      } catch (error) {
        toast.error("An error occurred while fetching orders.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated, router])

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300"
      case "processing":
        return "bg-blue-500/20 text-blue-700 dark:text-blue-300"
      case "shipped":
        return "bg-purple-500/20 text-purple-700 dark:text-purple-300"
      case "delivered":
        return "bg-green-500/20 text-green-700 dark:text-green-300"
      case "cancelled":
        return "bg-red-500/20 text-red-700 dark:text-red-300"
      default:
        return "bg-gray-500/20 text-gray-700 dark:text-gray-300"
    }
  }

  if (!isAuthenticated) return null

  if (isLoading) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen">
          <BuyerNavbar
            title="Order History"
            subtitle="Loading your orders..."
            onMenuToggle={() => setIsFilterOpen(true)}
          />
          <BuyerFilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
          <main className="container mx-auto px-4 py-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted rounded-lg h-32 mb-4"></div>
                </div>
              ))}
            </div>
          </main>
          <Footer />
        </div>
      </CurrencyProvider>
    )
  }

  if (orders.length === 0) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen">
          <BuyerNavbar
            title="Order History"
            subtitle="No orders found"
            onMenuToggle={() => setIsFilterOpen(true)}
          />
          <BuyerFilterSidebar
            isOpen={isFilterOpen}
            onClose={() => setIsFilterOpen(false)}
          />
          <main className="container mx-auto px-4 py-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl mx-auto text-center"
            >
              <GlassCard className="p-12" strong>
                <Package className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
                <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                  No Orders Yet
                </h1>
                <p className="text-muted-foreground mb-8">
                  You haven't placed any orders yet. Start shopping to see your
                  order history here.
                </p>
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={() => router.push("/store")}
                >
                  Start Shopping
                </Button>
              </GlassCard>
            </motion.div>
          </main>
          <Footer />
        </div>
      </CurrencyProvider>
    )
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        <BuyerNavbar
          title="Order History"
          subtitle={`${orders.length} orders found`}
          onMenuToggle={() => setIsFilterOpen(true)}
        />
        <BuyerFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            {orders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-4">
                    <div className="flex items-center gap-4 mb-4 lg:mb-0">
                      <div>
                        <h3 className="font-semibold text-foreground text-lg">
                          Order #{order.id}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(order.status)}>
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                      <h4 className="font-medium text-foreground mb-3">
                        Items Ordered
                      </h4>
                      <div className="space-y-3">
                        {order.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1">
                              <p className="font-medium text-foreground text-sm">
                                {item.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Qty: {item.quantity} × {formatPrice(item.price)}
                              </p>
                            </div>
                            <p className="font-semibold text-foreground">
                              {formatPrice(item.quantity * item.price)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div>
                      <h4 className="font-medium text-foreground mb-3">
                        Order Summary
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-foreground">
                              {order.shippingAddress.name}
                            </p>
                            <p className="text-muted-foreground">
                              {order.shippingAddress.address},{" "}
                              {order.shippingAddress.city}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            {order.paymentMethod}
                          </p>
                        </div>
                        <div className="pt-3 border-t border-border">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-foreground">
                              Total
                            </span>
                            <span className="font-bold text-lg text-foreground">
                              {formatPrice(order.total)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </motion.div>
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  )
}

export default function OrdersPage() {
  return <OrdersPageContent />
}
