"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Currency = {
  code: string
  symbol: string
  name: string
  rate: number
}

export const currencies: Currency[] = [
  { code: "KES", symbol: "KES", name: "Kenyan Shilling", rate: 1 },
]

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatPrice: (price: number) => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(
  undefined
)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(
    currencies.find(c => c.code === "KES") || currencies[0]
  )

  useEffect(() => {
    const stored = localStorage.getItem("arnova-currency")
    if (stored) {
      const found = currencies.find(c => c.code === stored)
      if (found) {
        setCurrencyState(found)
      }
    }
  }, [])

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr)
    localStorage.setItem("arnova-currency", curr.code)
  }

  const formatPrice = (price: number): string => {
    const converted = price * currency.rate
    return `${currency.symbol} ${converted.toFixed(2)}`
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (!context) {
    throw new Error("useCurrency must be used within CurrencyProvider")
  }
  return context
}
