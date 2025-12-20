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
  { code: "USD", symbol: "$", name: "US Dollar", rate: 1 },
  { code: "EUR", symbol: "€", name: "Euro", rate: 0.92 },
  { code: "GBP", symbol: "£", name: "British Pound", rate: 0.79 },
  { code: "KES", symbol: "KSh", name: "Kenyan Shilling", rate: 129.5 },
  { code: "TZS", symbol: "TSh", name: "Tanzanian Shilling", rate: 2520 },
  { code: "UGX", symbol: "USh", name: "Ugandan Shilling", rate: 3720 },
  { code: "JPY", symbol: "¥", name: "Japanese Yen", rate: 149.5 },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan", rate: 7.24 },
  { code: "INR", symbol: "₹", name: "Indian Rupee", rate: 83.12 },
  { code: "AUD", symbol: "A$", name: "Australian Dollar", rate: 1.52 },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar", rate: 1.36 },
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
  const [currentIndex, setCurrentIndex] = useState(3) // KES index

  useEffect(() => {
    const stored = localStorage.getItem("arnova-currency")
    if (stored) {
      const found = currencies.find(c => c.code === stored)
      if (found) {
        setCurrencyState(found)
        setCurrentIndex(currencies.indexOf(found))
      }
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const nextIndex = (prev + 1) % currencies.length
        setCurrencyState(currencies[nextIndex])
        return nextIndex
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr)
    localStorage.setItem("arnova-currency", curr.code)
  }

  const formatPrice = (price: number): string => {
    const converted = price * currency.rate
    return `${currency.symbol}${converted.toFixed(2)}`
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
