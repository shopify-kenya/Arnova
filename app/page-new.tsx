"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedProductsSection } from "@/components/sections/featured-products-section"
import { CategoriesSection } from "@/components/sections/categories-section"
import { BrandPartnersSection } from "@/components/sections/brand-partners-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"

export default function NewHomePage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <HeroSection />
      <FeaturedProductsSection />
      <CategoriesSection />
      <BrandPartnersSection />
      <FeaturesSection />
      <NewsletterSection />
      <FinalCTASection />
      <Footer />
    </div>
  )
}
