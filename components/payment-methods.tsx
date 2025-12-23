"use client"

import { useState, useEffect } from "react"
import {
  CreditCard,
  Wallet,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { GlassCard } from "@/components/glass-card"
import {
  formatCardNumber,
  formatExpiry,
  getCardType,
  validateCard,
  type CardData,
} from "@/lib/payment"

interface PaymentMethodsProps {
  selectedMethod: "card" | "paypal" | "mpesa"
  onMethodChange: (method: "card" | "paypal" | "mpesa") => void
  cardData: CardData
  onCardDataChange: (data: CardData) => void
  phoneNumber?: string
  onPhoneNumberChange?: (phone: string) => void
}

export function PaymentMethods({
  selectedMethod,
  onMethodChange,
  cardData,
  onCardDataChange,
  phoneNumber = "",
  onPhoneNumberChange,
}: PaymentMethodsProps) {
  const [cardValidation, setCardValidation] = useState<{
    valid: boolean
    card_type: string
  } | null>(null)

  useEffect(() => {
    const validateCardNumber = async () => {
      if (cardData.cardNumber.replace(/\s/g, "").length >= 13) {
        const result = await validateCard(cardData.cardNumber)
        setCardValidation(result)
      } else {
        setCardValidation(null)
      }
    }

    const timeoutId = setTimeout(validateCardNumber, 500)
    return () => clearTimeout(timeoutId)
  }, [cardData.cardNumber])

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, "")

    // Format as +254 XXX XXX XXX
    if (digits.startsWith("254")) {
      const formatted = digits.replace(
        /(\d{3})(\d{3})(\d{3})(\d{3})/,
        "+$1 $2 $3 $4"
      )
      return formatted
    } else if (digits.startsWith("0")) {
      // Convert 0XXX to 254XXX
      const kenyanNumber = "254" + digits.substring(1)
      return kenyanNumber.replace(
        /(\d{3})(\d{3})(\d{3})(\d{3})/,
        "+$1 $2 $3 $4"
      )
    } else if (digits.length > 0) {
      // Assume it's a Kenyan number without country code
      const kenyanNumber = "254" + digits
      return kenyanNumber.replace(
        /(\d{3})(\d{3})(\d{3})(\d{3})/,
        "+$1 $2 $3 $4"
      )
    }

    return value
  }

  return (
    <GlassCard className="p-6" strong>
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Payment Method</h2>
      </div>

      {/* Payment Method Selection */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Button
          type="button"
          variant={selectedMethod === "card" ? "default" : "outline"}
          className="h-16 flex flex-col gap-1"
          onClick={() => onMethodChange("card")}
        >
          <CreditCard className="h-6 w-6" />
          <span>Credit Card</span>
        </Button>
        <Button
          type="button"
          variant={selectedMethod === "paypal" ? "default" : "outline"}
          className="h-16 flex flex-col gap-1"
          onClick={() => onMethodChange("paypal")}
        >
          <Wallet className="h-6 w-6" />
          <span>PayPal</span>
        </Button>
        <Button
          type="button"
          variant={selectedMethod === "mpesa" ? "default" : "outline"}
          className="h-16 flex flex-col gap-1"
          onClick={() => onMethodChange("mpesa")}
        >
          <Smartphone className="h-6 w-6" />
          <span>M-Pesa</span>
        </Button>
      </div>

      {/* Card Payment Form */}
      {selectedMethod === "card" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardData.cardName}
              onChange={e =>
                onCardDataChange({ ...cardData, cardName: e.target.value })
              }
              required
              className="glass"
            />
          </div>

          <div>
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardData.cardNumber}
                onChange={e =>
                  onCardDataChange({
                    ...cardData,
                    cardNumber: formatCardNumber(e.target.value),
                  })
                }
                maxLength={19}
                required
                className="glass pr-12"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                {cardValidation && (
                  <div className="flex items-center gap-1">
                    {cardValidation.valid ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                )}
                {getCardType(cardData.cardNumber) === "visa" && (
                  <div className="text-blue-600 font-bold text-sm">VISA</div>
                )}
                {getCardType(cardData.cardNumber) === "mastercard" && (
                  <div className="text-red-600 font-bold text-sm">MC</div>
                )}
                {getCardType(cardData.cardNumber) === "amex" && (
                  <div className="text-green-600 font-bold text-sm">AMEX</div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cardExpiry">Expiry Date</Label>
              <Input
                id="cardExpiry"
                placeholder="MM/YY"
                value={cardData.cardExpiry}
                onChange={e =>
                  onCardDataChange({
                    ...cardData,
                    cardExpiry: formatExpiry(e.target.value),
                  })
                }
                maxLength={5}
                required
                className="glass"
              />
            </div>
            <div>
              <Label htmlFor="cardCvc">CVC</Label>
              <Input
                id="cardCvc"
                placeholder="123"
                value={cardData.cardCvc}
                onChange={e =>
                  onCardDataChange({
                    ...cardData,
                    cardCvc: e.target.value.replace(/\D/g, "").substring(0, 4),
                  })
                }
                maxLength={4}
                required
                className="glass"
              />
            </div>
          </div>
        </div>
      )}

      {/* PayPal Payment */}
      {selectedMethod === "paypal" && (
        <div className="text-center py-8">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground mb-4">
            You will be redirected to PayPal to complete your payment securely.
          </p>
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              PayPal provides secure payment processing with buyer protection.
            </p>
          </div>
        </div>
      )}

      {/* M-Pesa Payment */}
      {selectedMethod === "mpesa" && (
        <div className="space-y-4">
          <div>
            <Label htmlFor="phoneNumber">M-Pesa Phone Number</Label>
            <Input
              id="phoneNumber"
              placeholder="+254 XXX XXX XXX"
              value={phoneNumber}
              onChange={e => {
                const formatted = formatPhoneNumber(e.target.value)
                onPhoneNumberChange?.(formatted)
              }}
              required
              className="glass"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Enter your Safaricom number (e.g., 0712345678 or 254712345678)
            </p>
          </div>

          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Smartphone className="h-5 w-5 text-green-600" />
              <h3 className="font-semibold text-green-800 dark:text-green-200">
                M-Pesa STK Push
              </h3>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300">
              You will receive a payment request on your phone. Enter your
              M-Pesa PIN to complete the transaction.
            </p>
          </div>
        </div>
      )}
    </GlassCard>
  )
}
