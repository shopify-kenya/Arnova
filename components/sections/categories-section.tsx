"use client"

import Link from "next/link"
import { motion } from "framer-motion"

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

const categories = [
  {
    name: "New Arrivals",
    href: "/new-arrivals",
    count: "120+ items",
    icon: "/premium-clothing-fashion.jpg",
  },
  {
    name: "Clothing",
    href: "/clothing",
    count: "500+ items",
    icon: "/premium-cotton-t-shirt.png",
  },
  {
    name: "Shoes",
    href: "/shoes",
    count: "200+ items",
    icon: "/premium-leather-sneakers.jpg",
  },
  {
    name: "Bags",
    href: "/bags",
    count: "150+ items",
    icon: "/leather-tote-bag.png",
  },
  {
    name: "Accessories",
    href: "/accessories",
    count: "300+ items",
    icon: "/premium-sunglasses.png",
  },
  {
    name: "Sale",
    href: "/sale",
    count: "50% off",
    icon: "/tailored-blazer-jacket.jpg",
  },
]

export function CategoriesSection() {
  return (
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
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {categories.map(category => (
            <motion.div key={category.name} variants={fadeInUp}>
              <Link href={category.href} className="group block">
                <div className="relative overflow-hidden rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 p-6 sm:p-8 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-card/80">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                    <img
                      src={category.icon}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
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
  )
}
