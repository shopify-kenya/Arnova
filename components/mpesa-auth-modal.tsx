"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Smartphone, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { GlassCard } from "@/components/glass-card"
import { checkMpesaPaymentStatus } from "@/lib/payment"

interface MpesaAuthModalProps {
  isOpen: boolean
  phoneNumber: string
  amount: number
  onSuccess: () => void
  onError: (error: string) => void
  onCancel: () => void
  checkoutRequestId?: string
}

export function MpesaAuthModal({
  isOpen,
  phoneNumber,
  amount,
  onSuccess,
  onError,
  onCancel,
  checkoutRequestId,
}: MpesaAuthModalProps) {
  const [status, setStatus] = useState<"pending" | "success" | "failed">(
    "pending"
  )
  const [countdown, setCountdown] = useState(60)

  useEffect(() => {
    if (!isOpen || !checkoutRequestId) {
      setStatus("pending")
      setCountdown(60)
      return
    }

    // Start polling for payment status
    const pollPaymentStatus = async () => {
      try {
        const statusResult = await checkMpesaPaymentStatus(checkoutRequestId)

        if (statusResult.result_code === "0") {
          // Payment successful
          setStatus("success")
          setTimeout(() => onSuccess(), 1500)
        } else if (statusResult.result_code !== "1032") {
          // Payment failed (not pending)
          setStatus("failed")
          setTimeout(
            () => onError(statusResult.result_desc || "Payment failed"),
            1500
          )
        }
        // If result_code is "1032", payment is still pending, continue polling
      } catch {
        // Error checking payment status
      }
    }

    // Start polling every 2 seconds
    const pollInterval = setInterval(pollPaymentStatus, 2000)

    // Initial check
    pollPaymentStatus()

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setStatus("failed")
          onError("Payment timeout. Please try again.")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(pollInterval)
      clearInterval(countdownInterval)
    }
  }, [isOpen, checkoutRequestId, onSuccess, onError])

  const handleCancel = () => {
    setStatus("failed")
    onCancel()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-md"
          >
            <GlassCard className="p-8 text-center" strong>
              <div className="mb-6">
                {status === "pending" && (
                  <div className="relative">
                    <Smartphone className="h-16 w-16 mx-auto mb-4 text-green-500" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="absolute -top-2 -right-2"
                    >
                      <Loader2 className="h-6 w-6 text-primary" />
                    </motion.div>
                  </div>
                )}
                {status === "success" && (
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
                )}
                {status === "failed" && (
                  <XCircle className="h-16 w-16 mx-auto mb-4 text-red-500" />
                )}
              </div>

              <h2 className="text-2xl font-bold text-foreground mb-2">
                {status === "pending" && "Authorize Payment"}
                {status === "success" && "Payment Successful"}
                {status === "failed" && "Payment Failed"}
              </h2>

              <div className="text-muted-foreground mb-6 space-y-2">
                {status === "pending" && (
                  <>
                    <p>Check your phone for the M-Pesa payment request</p>
                    <p className="font-medium">Phone: {phoneNumber}</p>
                    <p className="font-medium">
                      Amount: KES {amount.toFixed(2)}
                    </p>
                    <div className="bg-primary/10 rounded-lg p-3 mt-4">
                      <p className="text-sm">
                        1. Enter your M-Pesa PIN when prompted
                      </p>
                      <p className="text-sm">2. Confirm the payment details</p>
                      <p className="text-sm">3. Press OK to complete payment</p>
                    </div>
                  </>
                )}
                {status === "success" && (
                  <p>Your M-Pesa payment has been processed successfully!</p>
                )}
                {status === "failed" && (
                  <p>Payment was cancelled or failed. Please try again.</p>
                )}
              </div>

              {status === "pending" && (
                <div className="mb-6">
                  <div className="text-2xl font-mono font-bold text-primary mb-2">
                    {formatTime(countdown)}
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <motion.div
                      className="bg-primary h-2 rounded-full"
                      initial={{ width: "100%" }}
                      animate={{ width: `${(countdown / 60) * 100}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Time remaining to complete payment
                  </p>
                </div>
              )}

              <div className="flex gap-3 justify-center">
                {status === "pending" && (
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel Payment
                  </Button>
                )}
                {status === "success" && (
                  <Button onClick={onSuccess}>Continue</Button>
                )}
                {status === "failed" && (
                  <Button onClick={onCancel}>Try Again</Button>
                )}
              </div>

            </GlassCard>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
