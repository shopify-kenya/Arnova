import { apiClient } from "./api-client"

export interface CardData {
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  cardName: string
}

export interface OrderItem {
  product_id: string
  quantity: number
  size: string
  color: string
  price: number
}

export interface Address {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  country: string
}

export interface PaymentData {
  payment_method: "card" | "paypal"
  amount: number
  card_data?: CardData
  order_data: {
    items: OrderItem[]
    shipping_address: Address
    billing_address?: Address
  }
}

export interface PaymentResult {
  success: boolean
  transaction_id?: string
  message?: string
  error?: string
  redirect_url?: string
}

export const processPayment = async (
  paymentData: PaymentData
): Promise<PaymentResult> => {
  try {
    const response = await apiClient.post("/api/payment/process/", paymentData)
    return response.data
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Payment processing failed"
    return {
      success: false,
      error: errorMessage,
    }
  }
}

export const validateCard = async (
  cardNumber: string
): Promise<{
  valid: boolean
  card_type: string
  error?: string
}> => {
  try {
    const response = await apiClient.post("/api/payment/validate-card/", {
      card_number: cardNumber,
    })
    return response.data
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Card validation failed"
    return {
      valid: false,
      card_type: "unknown",
      error: errorMessage,
    }
  }
}

export const formatCardNumber = (value: string): string => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  const matches = v.match(/\d{4,16}/g)
  const match = (matches && matches[0]) || ""
  const parts = []
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }
  if (parts.length) {
    return parts.join(" ")
  } else {
    return v
  }
}

export const formatExpiry = (value: string): string => {
  const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "")
  if (v.length >= 2) {
    return v.substring(0, 2) + "/" + v.substring(2, 4)
  }
  return v
}

export const getCardType = (number: string): string => {
  const num = number.replace(/\s/g, "")
  if (num.startsWith("4")) return "visa"
  if (num.startsWith("5") || num.startsWith("2")) return "mastercard"
  if (num.startsWith("3")) return "amex"
  return "card"
}

export const validateCardExpiry = (expiry: string): boolean => {
  const [month, year] = expiry.split("/")
  if (!month || !year) return false

  const monthNum = parseInt(month, 10)
  const yearNum = parseInt("20" + year, 10)

  if (monthNum < 1 || monthNum > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth() + 1

  if (yearNum < currentYear) return false
  if (yearNum === currentYear && monthNum < currentMonth) return false

  return true
}

export const validateCVC = (cvc: string, cardType: string): boolean => {
  if (cardType === "amex") {
    return /^\d{4}$/.test(cvc)
  }
  return /^\d{3}$/.test(cvc)
}
