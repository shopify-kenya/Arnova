"use client"
import React from 'react'
import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight, Sparkles, TrendingUp, Tag } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { CurrencyProvider } from "@/components/currency-provider"
import { useLanguage } from "@/components/language-provider"

export default function HomePage() {
  const { t } = useLanguage()

  const categories = [
    {
      title: t("nav.clothing"),
      href: "/clothing",
      image: "/premium-cotton-t-shirt.png",
      icon: Sparkles,
    },
    {
      title: t("nav.shoes"),
      href: "/shoes",
      image: "/premium-leather-sneakers.jpg",
      icon: TrendingUp,
    },
    {
      title: t("nav.bags"),
      href: "/bags",
      image: "/leather-tote-bag.png",
      icon: Tag,
    },
  ]

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        <Navbar />

        <main>
          {/* Hero Section */}
          <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
            <div
              className="absolute inset-0 z-0"
              style={{
                backgroundImage: "url(/soft-cashmere-sweater.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background/80 z-10" />

            <div className="container mx-auto px-4 z-20 text-center">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                <GlassCard className="inline-block px-8 py-16 max-w-4xl" strong>
                  <motion.h1
                    className="font-serif text-6xl md:text-8xl font-bold text-foreground mb-6 text-balance"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.8 }}
                  >
                    Elevate Your Style
                  </motion.h1>
                  <motion.p
                    className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed text-pretty"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                  >
                    Discover premium fashion that defines sophistication and timeless elegance
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                  >
                    <Link href="/new-arrivals">
                      <Button size="lg" className="text-lg px-8 py-6 rounded-xl">
                        {t("nav.newArrivals")}
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </GlassCard>
              </motion.div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="container mx-auto px-4 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <h2 className="font-serif text-5xl font-bold text-foreground mb-4 text-balance">Shop by Category</h2>
              <p className="text-lg text-muted-foreground text-pretty">
                Explore our curated collections of premium fashion
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {categories.map((category, index) => (
                <motion.div
                  key={category.href}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                >
                  <Link href={category.href}>
                    <GlassCard className="group overflow-hidden h-[400px] relative">
                      <img
                        src={category.image}
                        alt={category.title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <category.icon className="h-8 w-8 text-primary mb-3" />
                        <h3 className="font-serif text-3xl font-bold text-foreground mb-2">{category.title}</h3>
                        <p className="text-muted-foreground flex items-center">
                          Explore Collection
                          <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-2" />
                        </p>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Featured Banner */}
          <section className="container mx-auto px-4 py-20">
            <GlassCard className="relative overflow-hidden h-[400px]" strong>
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: "url(/slim-fit-denim-jeans.jpg)",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-background/95 to-transparent" />
              <div className="relative h-full flex items-center">
                <div className="max-w-xl px-12">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="font-serif text-5xl font-bold text-foreground mb-4 text-balance">Summer Sale</h2>
                    <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
                      Up to 50% off on selected items. Limited time offer.
                    </p>
                    <Link href="/sale">
                      <Button size="lg" variant="default" className="rounded-xl">
                        Shop Sale
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </motion.div>
                </div>
              </div>
            </GlassCard>
          </section>
        </main>

        <Footer />
      </div>
    </CurrencyProvider>
  )
}
