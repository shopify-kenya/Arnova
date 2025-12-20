"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Heart } from "lucide-react"
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
    id: "premium-cotton-t-shirt",
    name: "Premium Cotton T-Shirt",
    price: "KES 890",
    image: "/premium-cotton-t-shirt.png",
    badge: "New",
  },
  {
    id: "soft-cashmere-sweater",
    name: "Soft Cashmere Sweater",
    price: "KES 1290",
    image: "/soft-cashmere-sweater.png",
    badge: "Popular",
  },
  {
    id: "cozy-wool-scarf",
    name: "Cozy Wool Scarf",
    price: "KES 1590",
    image: "/cozy-wool-scarf.png",
    badge: "Limited",
  },
  {
    id: "premium-sunglasses",
    name: "Premium Sunglasses",
    price: "KES 1990",
    image: "/premium-sunglasses.png",
    badge: "Trending",
  },
]

export function FeaturedProductsSection() {
  return (
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {featuredProducts.map((product, index) => (
            <motion.div key={product.id} variants={fadeInUp}>
              <Link href={`/product/${product.id}`} className="group block">
                <div className="relative overflow-hidden rounded-3xl bg-card/80 backdrop-blur-sm border border-border/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                  <div className="relative aspect-square overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted/20 to-muted/40" />
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge
                        variant="secondary"
                        className="text-xs bg-accent/90 text-accent-foreground"
                      >
                        {product.badge}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="rounded-full bg-background/20 backdrop-blur-sm hover:bg-background/40"
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
  )
}
