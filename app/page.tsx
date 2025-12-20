"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  ArrowRight,
  Star,
  Truck,
  Shield,
  Headphones,
  Heart,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const featuredProducts = [
  {
    id: "lace-enigma-skirt",
    name: "Lace Enigma Skirt",
    price: "$89",
    image: "/premium-cotton-t-shirt.png",
    badge: "New",
  },
  {
    id: "sapphire-serenade",
    name: "Sapphire Serenade",
    price: "$129",
    image: "/soft-cashmere-sweater.png",
    badge: "Popular",
  },
  {
    id: "champagne-cascade",
    name: "Champagne Cascade",
    price: "$159",
    image: "/cozy-wool-scarf.png",
    badge: "Limited",
  },
  {
    id: "zebra-stylist",
    name: "ZEBRA Stylist",
    price: "$199",
    image: "/premium-sunglasses.png",
    badge: "Trending",
  },
]

const categories = [
  { name: "New Arrivals", href: "/new-arrivals", count: "120+ items" },
  { name: "Clothing", href: "/clothing", count: "500+ items" },
  { name: "Shoes", href: "/shoes", count: "200+ items" },
  { name: "Bags", href: "/bags", count: "150+ items" },
  { name: "Accessories", href: "/accessories", count: "300+ items" },
  { name: "Sale", href: "/sale", count: "50% off" },
]

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="absolute inset-0 bg-[url('/premium-clothing-fashion.jpg')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-4 z-10">
          <motion.div
            className="text-center max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            <motion.div variants={fadeInUp}>
              <Badge
                variant="secondary"
                className="mb-6 text-sm font-medium px-4 py-2"
              >
                ✨ Contemporary and urban energy
              </Badge>
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-tight"
              variants={fadeInUp}
            >
              <span className="block">Contemporary</span>
              <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                and urban energy
              </span>
            </motion.h1>

            <motion.p
              className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed"
              variants={fadeInUp}
            >
              Discover the choice of creative people. Premium fashion with
              eco-friendly materials and futuristic designs inspired by
              technology.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
              variants={fadeInUp}
            >
              <Button
                asChild
                size="lg"
                className="group px-8 py-6 text-lg rounded-full"
              >
                <Link href="/new-arrivals">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="px-8 py-6 text-lg rounded-full"
              >
                <Link href="/clothing">View All</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Details with eco-friendly materials
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              2024 Collections featuring sustainable fashion and contemporary
              designs
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {featuredProducts.map((product, index) => (
              <motion.div key={product.id} variants={fadeInUp}>
                <Link href={`/product/${product.id}`} className="group block">
                  <div className="relative overflow-hidden rounded-3xl bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-border/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <div className="relative aspect-square overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40" />
                      <div className="absolute top-4 left-4">
                        <Badge variant="secondary" className="text-xs">
                          {product.badge}
                        </Badge>
                      </div>
                      <div className="absolute top-4 right-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40"
                        >
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                        {product.name}
                      </h3>
                      <p className="text-2xl font-bold text-primary">
                        {product.price}
                      </p>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Shop by Category
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our curated collections designed for the modern lifestyle
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {categories.map(category => (
              <motion.div key={category.name} variants={fadeInUp}>
                <Link href={category.href} className="group block">
                  <div className="relative overflow-hidden rounded-2xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-white/80 dark:hover:bg-gray-900/80">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                      <ShoppingBag className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-sm mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {category.count}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Brand Partners */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-muted-foreground mb-8">
              We work with known brands
            </p>
            <div className="flex justify-center items-center space-x-12 opacity-60">
              <div className="text-2xl font-bold">adidas</div>
              <div className="text-2xl font-bold">ZARA</div>
              <div className="text-2xl font-bold">Nike</div>
              <div className="text-2xl font-bold">H&M</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gradient-to-br from-background to-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              {
                icon: Truck,
                title: "Free Shipping",
                description: "On orders over $100",
              },
              {
                icon: Shield,
                title: "Secure Payment",
                description: "100% secure checkout",
              },
              {
                icon: Headphones,
                title: "24/7 Support",
                description: "Dedicated customer service",
              },
              {
                icon: Star,
                title: "Premium Quality",
                description: "Curated fashion items",
              },
            ].map(feature => (
              <motion.div key={feature.title} variants={fadeInUp}>
                <div className="text-center p-8 rounded-3xl bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:bg-white/80 dark:hover:bg-gray-900/80 hover:scale-105 hover:shadow-lg">
                  <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-24 bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Subscribe to the newsletter
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              That gives you the latest Fashion Items & Events
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <Button asChild size="lg" className="group rounded-full px-8">
                <Link href="/register">
                  Join Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-background via-muted/10 to-background">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Futuristic designs inspired by technology
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join the creative community and discover premium fashion that
              defines the future
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="group">
                <Link href="/clothing">
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/about">Our Story</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
