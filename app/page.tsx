"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedProductsSection } from "@/components/sections/featured-products-section"
import { CategoriesSection } from "@/components/sections/categories-section"
import { BrandPartnersSection } from "@/components/sections/brand-partners-section"
import { CurrencySection } from "@/components/sections/currency-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedProductsSection />
      <CategoriesSection />
      <BrandPartnersSection />
      <CurrencySection />
      <FeaturesSection />
      <NewsletterSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
