"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { MapPin, ArrowRight, CheckCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CurrencyProvider, useCurrency } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { useCart } from "@/components/cart-provider"
import { countries } from "@/lib/countries"
import { toast } from "sonner"
import { PaymentMethods } from "@/components/payment-methods"
import { processPayment } from "@/lib/payment"

function CheckoutPageContent() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const { cart, total, clearCart } = useCart()
  const { formatPrice } = useCurrency()
  const [isProcessing, setIsProcessing] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)

  const [paymentMethod, setPaymentMethod] = useState<
    "card" | "paypal" | "mpesa"
  >("card")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  })
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    cardName: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (cart.length === 0 && !orderComplete) {
      router.push("/cart")
      return
    }
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
      }))
    }
  }, [isAuthenticated, cart.length, user, router, orderComplete])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    try {
      // Validate form data
      const requiredFields = [
        "firstName",
        "lastName",
        "email",
        "address",
        "city",
        "country",
      ]
      for (const field of requiredFields) {
        if (!formData[field as keyof typeof formData]) {
          toast.error(
            `Please fill in ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`
          )
          setIsProcessing(false)
          return
        }
      }

      if (paymentMethod === "card") {
        // Validate card data
        if (
          !cardData.cardNumber ||
          !cardData.cardExpiry ||
          !cardData.cardCvc ||
          !cardData.cardName
        ) {
          toast.error("Please fill in all card details")
          setIsProcessing(false)
          return
        }
      } else if (paymentMethod === "mpesa") {
        // Validate phone number
        if (!phoneNumber) {
          toast.error("Please enter your M-Pesa phone number")
          setIsProcessing(false)
          return
        }
      }

      // Process payment
      const paymentData = {
        payment_method: paymentMethod,
        amount: grandTotal,
        card_data: paymentMethod === "card" ? cardData : undefined,
        phone_number: paymentMethod === "mpesa" ? phoneNumber : undefined,
        order_data: {
          items: cart.map(item => ({
            product_id: item.product.id,
            quantity: item.quantity,
            size: item.selectedSize,
            color: item.selectedColor,
            price: item.product.price,
          })),
          shipping_address: formData,
          billing_address: formData,
        },
      }

      const result = await processPayment(paymentData)

      if (result.success) {
        if (result.redirect_url && paymentMethod === "paypal") {
          toast.info("Redirecting to PayPal...")
          window.open(result.redirect_url, "_blank")
          // Simulate successful return from PayPal
          await new Promise(resolve => setTimeout(resolve, 3000))
        }

        if (paymentMethod === "mpesa") {
          toast.info(
            "STK Push sent to your phone. Please enter your M-Pesa PIN to complete the payment."
          )
          // Wait for callback or timeout
          await new Promise(resolve => setTimeout(resolve, 5000))
        }

        setIsProcessing(false)
        setOrderComplete(true)
        clearCart()
        toast.success(
          result.message ||
            `Payment successful via ${paymentMethod === "paypal" ? "PayPal" : paymentMethod === "mpesa" ? "M-Pesa" : "Credit Card"}!`
        )
      } else {
        throw new Error(result.error || "Payment failed")
      }
    } catch (error: unknown) {
      setIsProcessing(false)
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Payment failed. Please try again."
      toast.error(errorMessage)
    }
  }

  if (!isAuthenticated) return null

  if (orderComplete) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <GlassCard className="p-12" strong>
              <CheckCircle className="h-24 w-24 mx-auto mb-6 text-green-500" />
              <h1 className="font-serif text-4xl font-bold text-foreground mb-4">
                Order Confirmed!
              </h1>
              <p className="text-muted-foreground mb-8">
                Thank you for your purchase. We&apos;ve sent a confirmation
                email to {user?.email}
              </p>
              <div className="flex gap-4 justify-center">
                <Button size="lg" onClick={() => router.push("/orders")}>
                  View Orders
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => router.push("/")}
                >
                  Continue Shopping
                </Button>
              </div>
            </GlassCard>
          </motion.div>
        </main>
        <Footer />
      </div>
    )
  }

  const shipping = 15
  const tax = total * 0.1
  const grandTotal = total + shipping + tax

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
              Checkout
            </h1>
            <p className="text-muted-foreground">Complete your purchase</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Checkout Form */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Information */}
                <GlassCard className="p-6" strong>
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold text-foreground">
                      Shipping Information
                    </h2>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              firstName: e.target.value,
                            })
                          }
                          required
                          className="glass"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              lastName: e.target.value,
                            })
                          }
                          required
                          className="glass"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={e =>
                          setFormData({ ...formData, email: e.target.value })
                        }
                        required
                        className="glass"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={e =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        required
                        className="glass"
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={e =>
                          setFormData({ ...formData, address: e.target.value })
                        }
                        required
                        className="glass"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={e =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          required
                          className="glass"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State/Province</Label>
                        <Input
                          id="state"
                          value={formData.state}
                          onChange={e =>
                            setFormData({ ...formData, state: e.target.value })
                          }
                          required
                          className="glass"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                        <Input
                          id="zipCode"
                          value={formData.zipCode}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              zipCode: e.target.value,
                            })
                          }
                          required
                          className="glass"
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Select
                          value={formData.country}
                          onValueChange={value =>
                            setFormData({ ...formData, country: value })
                          }
                        >
                          <SelectTrigger className="glass">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent className="glass-strong max-h-[300px]">
                            {countries.map(country => (
                              <SelectItem
                                key={country.code}
                                value={country.code}
                              >
                                {country.flag} {country.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </GlassCard>

                {/* Payment Information */}
                <PaymentMethods
                  selectedMethod={paymentMethod}
                  onMethodChange={setPaymentMethod}
                  cardData={cardData}
                  onCardDataChange={setCardData}
                  phoneNumber={phoneNumber}
                  onPhoneNumberChange={setPhoneNumber}
                />
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <GlassCard className="p-6 sticky top-24" strong>
                  <h2 className="font-serif text-2xl font-bold text-foreground mb-6">
                    Order Summary
                  </h2>

                  <div className="space-y-3 mb-6 max-h-[300px] overflow-y-auto">
                    {cart.map(item => (
                      <div
                        key={`${item.product.id}-${item.selectedSize}-${item.selectedColor}`}
                        className="flex gap-3"
                      >
                        <Image
                          src={item.product.images[0] || "/placeholder.svg"}
                          alt={item.product.name}
                          width={64}
                          height={64}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground line-clamp-1">
                            {item.product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.selectedColor} • {item.selectedSize} • Qty:{" "}
                            {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 mb-6 border-t border-border pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span>{formatPrice(shipping)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Tax</span>
                      <span>{formatPrice(tax)}</span>
                    </div>
                    <div className="border-t border-border pt-3">
                      <div className="flex justify-between text-lg font-bold text-foreground">
                        <span>Total</span>
                        <span>{formatPrice(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Place Order"}
                    {!isProcessing && <ArrowRight className="ml-2 h-5 w-5" />}
                  </Button>
                </GlassCard>
              </div>
            </div>
          </form>
        </motion.div>
      </main>
      <Footer />
    </div>
  )
}

export default function CheckoutPage() {
  return (
    <CurrencyProvider>
      <CheckoutPageContent />
    </CurrencyProvider>
  )
}
