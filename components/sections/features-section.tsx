"use client"

import { motion } from "framer-motion"
import { Star, Truck, Shield, Headphones } from "lucide-react"

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

const features = [
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
]

export function FeaturesSection() {
  return (
    <section className="py-24 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
        >
          {features.map(feature => (
            <motion.div key={feature.title} variants={fadeInUp}>
              <div className="text-center p-6 sm:p-8 rounded-3xl bg-card/60 backdrop-blur-sm border border-border/50 transition-all duration-300 hover:bg-card/80 hover:scale-105 hover:shadow-lg">
                <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-accent/20 flex items-center justify-center">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="font-semibold text-lg mb-3 text-primary">
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
  )
}
