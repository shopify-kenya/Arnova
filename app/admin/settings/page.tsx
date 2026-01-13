"use client"

import { useEffect, useState } from "react"
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
  const [activeCategory, setActiveCategory] = useState(0)

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

  const currentCategory = settingsCategories[activeCategory]

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

            {/* Category Switch Bar */}
            <div className="flex flex-wrap gap-2 mb-8">
              {settingsCategories.map((category, index) => (
                <Button
                  key={index}
                  variant={activeCategory === index ? "default" : "outline"}
                  onClick={() => setActiveCategory(index)}
                  className="flex items-center gap-2"
                >
                  <category.icon className="h-4 w-4" />
                  {category.title}
                </Button>
              ))}
            </div>

            {/* Active Category Card */}
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl"
            >
              <GlassCard className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <currentCategory.icon className="h-10 w-10 text-primary" />
                  <div>
                    <h2 className="text-3xl font-bold text-foreground">
                      {currentCategory.title}
                    </h2>
                    <p className="text-muted-foreground">
                      {currentCategory.description}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {currentCategory.items.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: itemIndex * 0.1, duration: 0.3 }}
                      className="flex items-center justify-between p-4 bg-muted/20 rounded-lg hover:bg-muted/30 transition-colors"
                    >
                      <div>
                        <span className="text-foreground font-medium">
                          {item}
                        </span>
                        <p className="text-sm text-muted-foreground mt-1">
                          Configure {item.toLowerCase()} settings
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        onClick={() =>
                          toast.success(`${item} configuration opened`)
                        }
                      >
                        Configure
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </CurrencyProvider>
  )
}
