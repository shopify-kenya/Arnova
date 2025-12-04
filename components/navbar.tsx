"use client"
import React, { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  Search,
  Globe,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from "@/components/language-provider"
import { useCurrency, currencies } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { ThemeToggle } from "@/components/theme-toggle"
import { GlassCard } from "@/components/glass-card"
import { PWAInstaller } from "@/components/pwa-installer"

export function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { t, setLanguage } = useLanguage()
  const { currency, setCurrency } = useCurrency()
  const { user, logout, isAuthenticated, isAdmin } = useAuth()
  const { itemCount } = useCart()

  const navLinks = [
    { href: "/new-arrivals", label: t("nav.newArrivals") },
    { href: "/clothing", label: t("nav.clothing") },
    { href: "/shoes", label: t("nav.shoes") },
    { href: "/bags", label: t("nav.bags") },
    { href: "/accessories", label: t("nav.accessories") },
    { href: "/sale", label: t("nav.sale") },
  ]

  return (
    <motion.header
      className="sticky top-0 z-50 w-full"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <GlassCard className="rounded-none border-x-0 border-t-0" hover={false}>
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <motion.div
                className="flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Image
                  src="/placeholder-logo.png"
                  alt="Arnova Logo"
                  width={32}
                  height={32}
                  className="h-8 w-8"
                />
                <h1 className="font-serif text-3xl font-bold text-primary">
                  Arnova
                </h1>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden items-center space-x-8 lg:flex">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Search */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="hidden md:flex"
              >
                <Search className="h-5 w-5" />
              </Button>

              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Globe className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong">
                  <DropdownMenuItem onClick={() => setLanguage("en-US")}>
                    English (US)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("en-GB")}>
                    English (UK)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setLanguage("sw")}>
                    Kiswahili
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Currency Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <DollarSign className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="glass-strong max-h-[300px] overflow-y-auto"
                >
                  {currencies.map(curr => (
                    <DropdownMenuItem
                      key={curr.code}
                      onClick={() => setCurrency(curr)}
                      className={
                        currency.code === curr.code ? "bg-primary/10" : ""
                      }
                    >
                      {curr.symbol} {curr.code} - {curr.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* PWA Install */}
              <PWAInstaller />

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Saved - Auth Required */}
              {isAuthenticated && (
                <Link href="/saved">
                  <Button variant="ghost" size="icon">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
              )}

              {/* Cart - Auth Required */}
              {isAuthenticated && (
                <Link href="/cart">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    {itemCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {itemCount}
                      </span>
                    )}
                  </Button>
                </Link>
              )}

              {/* Profile */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-strong w-56">
                  {isAuthenticated ? (
                    <>
                      <div className="px-2 py-2">
                        <p className="text-sm font-medium">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {user?.email}
                        </p>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/profile">My Profile</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/orders">My Orders</Link>
                      </DropdownMenuItem>
                      {isAdmin && (
                        <DropdownMenuItem asChild>
                          <Link href="/admin">Admin Dashboard</Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={logout}>
                        Sign Out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/login">Sign In</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/register">Create Account</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu */}
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="glass-strong w-[300px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    {navLinks.map(link => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Search Bar */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4"
              >
                <Input
                  type="search"
                  placeholder={t("common.search")}
                  className="w-full glass"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </GlassCard>
    </motion.header>
  )
}
