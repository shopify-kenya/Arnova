"use client"


import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en-US" | "en-GB" | "sw"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const translations: Record<Language, Record<string, string>> = {
  "en-US": {
    "nav.home": "Home",
    "nav.newArrivals": "New Arrivals",
    "nav.clothing": "Clothing",
    "nav.shoes": "Shoes",
    "nav.bags": "Bags",
    "nav.accessories": "Accessories",
    "nav.sale": "Sale",
    "nav.saved": "Saved",
    "nav.cart": "Cart",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.logout": "Log Out",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.addToCart": "Add to Cart",
    "common.addToSaved": "Save",
    "common.price": "Price",
    "common.currency": "Currency",
    "common.language": "Language",
  },
  "en-GB": {
    "nav.home": "Home",
    "nav.newArrivals": "New Arrivals",
    "nav.clothing": "Clothing",
    "nav.shoes": "Shoes",
    "nav.bags": "Bags",
    "nav.accessories": "Accessories",
    "nav.sale": "Sale",
    "nav.saved": "Favourites",
    "nav.cart": "Basket",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "auth.login": "Log In",
    "auth.signup": "Sign Up",
    "auth.logout": "Log Out",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.sort": "Sort",
    "common.addToCart": "Add to Basket",
    "common.addToSaved": "Save",
    "common.price": "Price",
    "common.currency": "Currency",
    "common.language": "Language",
  },
  sw: {
    "nav.home": "Nyumbani",
    "nav.newArrivals": "Bidhaa Mpya",
    "nav.clothing": "Nguo",
    "nav.shoes": "Viatu",
    "nav.bags": "Mifuko",
    "nav.accessories": "Vifaa",
    "nav.sale": "Uuzaji",
    "nav.saved": "Zilizohifadhiwa",
    "nav.cart": "Kikapu",
    "nav.profile": "Wasifu",
    "nav.admin": "Msimamizi",
    "auth.login": "Ingia",
    "auth.signup": "Jisajili",
    "auth.logout": "Toka",
    "common.search": "Tafuta",
    "common.filter": "Chuja",
    "common.sort": "Panga",
    "common.addToCart": "Ongeza kwenye Kikapu",
    "common.addToSaved": "Hifadhi",
    "common.price": "Bei",
    "common.currency": "Sarafu",
    "common.language": "Lugha",
  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en-US")

  useEffect(() => {
    const stored = localStorage.getItem("arnova-language") as Language
    if (stored && ["en-US", "en-GB", "sw"].includes(stored)) {
      setLanguageState(stored)
    }
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem("arnova-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key] || key
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider")
  }
  return context
}
