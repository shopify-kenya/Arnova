"use client"

import { motion } from "framer-motion"
import { useCurrency, currencies } from "@/components/currency-provider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function CurrencySection() {
  const { currency, setCurrency } = useCurrency()

  return (
    <section className="py-16 bg-gradient-to-br from-background to-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Choose Your Currency
          </h2>
          <p className="text-muted-foreground mb-8">
            Shop in your preferred currency for the best experience
          </p>
          <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
            {currencies.slice(0, 12).map(curr => (
              <Button
                key={curr.code}
                variant={currency.code === curr.code ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrency(curr)}
                className="relative"
              >
                {currency.code === curr.code && (
                  <Badge className="absolute -top-2 -right-2 px-1 py-0 text-xs bg-accent">
                    ✓
                  </Badge>
                )}
                {curr.symbol} {curr.code}
              </Button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
