"use client"

import type React from "react"
import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Home } from "lucide-react"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import InputError from "@/components/ui/input-error"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { login } from "@/lib/auth"
import { validateEmail } from "@/lib/validation"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState({ email: "", password: "", general: "" })

  const validate = () => {
    const newErrors = { email: "", password: "", general: "" }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    }

    setErrors(newErrors)
    return !newErrors.email && !newErrors.password
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)
    setErrors({ email: "", password: "", general: "" })

    try {
      const user = login(email, password, rememberMe)
      if (user) {
        setUser(user)
        toast.success("Welcome back!")
        // Use window.location for immediate redirect
        window.location.href = user.role === "admin" ? "/admin" : "/store"
      } else {
        setErrors({ ...errors, general: "Invalid email or password" })
      }
    } catch {
      setErrors({ ...errors, general: "An error occurred. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  const inputVariants = {
    focus: { scale: 1.02, transition: { duration: 0.2 } },
    blur: { scale: 1, transition: { duration: 0.2 } },
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen flex items-center justify-center relative">
        <Link href="/" className="absolute top-4 left-4">
          <Button variant="ghost" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>

        <main className="w-full max-w-md px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <GlassCard className="p-8" strong>
              <div className="text-center mb-8">
                <h1 className="font-serif text-4xl font-bold text-foreground mb-2">
                  Welcome Back
                </h1>
                <p className="text-muted-foreground">
                  Sign in to your Arnova account
                </p>
              </div>

              {errors.general && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-destructive/10 text-destructive mb-4 rounded-md p-3 text-sm"
                >
                  {errors.general}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">
                    Email <span className="text-destructive">*</span>
                  </Label>
                  <motion.div whileFocus="focus" variants={inputVariants}>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 glass focus:border-primary/50 focus:ring-primary/20"
                        disabled={isLoading}
                        required
                      />
                    </div>
                    <InputError message={errors.email} />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password <span className="text-destructive">*</span>
                  </Label>
                  <motion.div whileFocus="focus" variants={inputVariants}>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10 pr-10 glass focus:border-primary/50 focus:ring-primary/20"
                        disabled={isLoading}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <InputError message={errors.password} />
                  </motion.div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={checked =>
                        setRememberMe(checked as boolean)
                      }
                    />
                    <Label
                      htmlFor="remember"
                      className="text-sm font-normal cursor-pointer"
                    >
                      Remember me
                    </Label>
                  </div>
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm">
                <p className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="text-primary font-medium hover:underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </main>
      </div>
    </CurrencyProvider>
  )
}
