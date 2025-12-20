"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, Database, Shield, Globe } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

export default function AdminSettingsPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router])

  if (!isAdmin) return null

  const settingsCategories = [
    {
      title: "General Settings",
      description: "Basic platform configuration",
      icon: Settings,
      items: [
        "Site Name",
        "Site Description",
        "Contact Information",
        "Business Hours",
      ],
    },
    {
      title: "Database Management",
      description: "Database operations and maintenance",
      icon: Database,
      items: ["Backup Database", "Clear Cache", "Data Export", "System Logs"],
    },
    {
      title: "Security Settings",
      description: "User access and security configuration",
      icon: Shield,
      items: [
        "User Permissions",
        "Session Management",
        "API Keys",
        "Security Logs",
      ],
    },
    {
      title: "Localization",
      description: "Language and regional settings",
      icon: Globe,
      items: [
        "Default Currency",
        "Supported Languages",
        "Time Zone",
        "Date Format",
      ],
    },
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
                Settings
              </h1>
              <p className="text-muted-foreground">
                Configure platform settings and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {settingsCategories.map((category, index) => (
                <motion.div
                  key={category.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                  <GlassCard className="p-6 h-full">
                    <div className="flex items-center gap-4 mb-4">
                      <category.icon className="h-8 w-8 text-primary" />
                      <div>
                        <h3 className="text-xl font-bold text-foreground">
                          {category.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {category.items.map((item, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                        >
                          <span className="text-foreground">{item}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toast.success(`${item} configuration opened`)
                            }
                          >
                            Configure
                          </Button>
                        </div>
                      ))}
                    </div>
                  </GlassCard>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </CurrencyProvider>
  )
}
