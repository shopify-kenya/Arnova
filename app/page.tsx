"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { BuyerSidebar } from "@/components/buyer-sidebar"
import { HeroSection } from "@/components/sections/hero-section"
import { FeaturedProductsSection } from "@/components/sections/featured-products-section"
import { CategoriesSection } from "@/components/sections/categories-section"
import { BrandPartnersSection } from "@/components/sections/brand-partners-section"
import { CurrencySection } from "@/components/sections/currency-section"
import { FeaturesSection } from "@/components/sections/features-section"
import { NewsletterSection } from "@/components/sections/newsletter-section"
import { FinalCTASection } from "@/components/sections/final-cta-section"
import { useAuth } from "@/components/auth-provider"

export default function HomePage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {!isAuthenticated && <Navbar />}
      <div className="flex">
        {isAuthenticated && <BuyerSidebar />}
        <main className={`flex-1 ${!isAuthenticated ? "" : "lg:ml-80"}`}>
          <HeroSection />
          <FeaturedProductsSection />
          <CategoriesSection />
          <BrandPartnersSection />
          <CurrencySection />
          <FeaturesSection />
          <NewsletterSection />
          <FinalCTASection />
        </main>
      </div>
      <Footer />
    </div>
  )
}
