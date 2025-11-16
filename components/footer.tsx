"use client"
import React from 'react'
import Link from "next/link"
import { motion } from "framer-motion"
import { Facebook, Instagram, Twitter, Mail } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { useLanguage } from "@/components/language-provider"

export function Footer() {
  const { t } = useLanguage()

  const footerLinks = {
    shop: [
      { label: t("nav.newArrivals"), href: "/new-arrivals" },
      { label: t("nav.clothing"), href: "/clothing" },
      { label: t("nav.shoes"), href: "/shoes" },
      { label: t("nav.bags"), href: "/bags" },
      { label: t("nav.accessories"), href: "/accessories" },
      { label: t("nav.sale"), href: "/sale" },
    ],
    customer: [
      { label: "Contact Us", href: "/contact" },
      { label: "Shipping Info", href: "/shipping" },
      { label: "Returns", href: "/returns" },
      { label: "FAQ", href: "/faq" },
      { label: "Size Guide", href: "/size-guide" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
  }

  return (
    <footer className="mt-20 border-t border-border">
      <GlassCard className="rounded-none border-0" hover={false}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div>
              <h2 className="font-serif text-3xl font-bold text-primary mb-4">Arnova</h2>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Premium fashion and accessories for the modern individual. Quality craftsmanship meets timeless design.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </motion.a>
                <motion.a
                  href="mailto:hello@arnova.com"
                  whileHover={{ scale: 1.1 }}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <Mail className="h-5 w-5" />
                </motion.a>
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Shop</h3>
              <ul className="space-y-2">
                {footerLinks.shop.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Customer Service</h3>
              <ul className="space-y-2">
                {footerLinks.customer.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="font-semibold text-foreground mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} Arnova. All rights reserved.</p>
          </div>
        </div>
      </GlassCard>
    </footer>
  )
}
