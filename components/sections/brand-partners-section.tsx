"use client"

import { motion } from "framer-motion"

const brands = [
  {
    name: "adidas",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Adidas-Logo.png",
  },
  {
    name: "Nike",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Nike-Logo.png",
  },
  {
    name: "ZARA",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg",
  },
  {
    name: "H&M",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/53/H%26M-Logo.svg",
  },
  {
    name: "Puma",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Puma-Logo.png",
  },
  {
    name: "Gucci",
    logo: "https://logos-world.net/wp-content/uploads/2020/04/Gucci-Logo.png",
  },
]

export function BrandPartnersSection() {
  return (
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
          <div className="overflow-hidden">
            <motion.div
              className="flex items-center space-x-16"
              animate={{
                x: ["-100%", "0%"],
              }}
              transition={{
                x: {
                  repeat: Infinity,
                  repeatType: "loop",
                  duration: 20,
                  ease: "linear",
                },
              }}
            >
              {[...brands, ...brands].map((brand, index) => (
                <div key={`${brand.name}-${index}`} className="flex-shrink-0">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
