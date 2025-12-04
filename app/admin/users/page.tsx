"use client"
import { motion } from "framer-motion"
import { Shield, User } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { mockUsers } from "@/lib/auth"
import { toast } from "sonner"

export default function AdminUsersPage() {
  const { isAdmin, isAuthenticated } = useAuth()

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Access denied. Admin privileges required.</p>
      </div>
    )
  }

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
                Users
              </h1>
              <p className="text-muted-foreground">Manage customer accounts</p>
            </div>
            <GlassCard className="overflow-hidden" strong>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">
                        User
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Email
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Country
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Role
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Joined
                      </th>
                      <th className="text-right p-4 font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                              {user.role === "admin" ? (
                                <Shield className="h-5 w-5 text-primary" />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.firstName} {user.lastName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                ID: {user.id}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">{user.country}</p>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              user.role === "admin" ? "default" : "outline"
                            }
                          >
                            {user.role === "admin"
                              ? "Administrator"
                              : "Customer"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                toast.success("View user details coming soon")
                              }
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
    </CurrencyProvider>
  )
}
