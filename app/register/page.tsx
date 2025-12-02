"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Mail, Lock, UserIcon, Phone, MapPin, ArrowRight, Eye, EyeOff, LoaderCircle } from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import InputError from "@/components/ui/input-error"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { register } from "@/lib/auth"
import { countries } from "@/lib/countries"
import { validateEmail, validatePhone, validatePassword, getPasswordValidationMessage, getPasswordConfirmationMessage } from "@/lib/validation"
import { toast } from "sonner"

export default function RegisterPage() {
  const router = useRouter()
  const { setUser } = useAuth()
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    country: "",
    phone: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    general: ""
  })
  const [passwordError, setPasswordError] = useState("")
  const [confirmPasswordError, setConfirmPasswordError] = useState("")

  // Progress bar calculation
  useEffect(() => {
    const fields = Object.values(formData)
    const filled = fields.filter((value) => value.trim() !== "").length
    const calculateProgress = Math.round((filled / 7) * 100)
    setProgress(calculateProgress)
  }, [formData])

  const validate = () => {
    const newErrors = {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      password: "",
      confirmPassword: "",
      general: ""
    }

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!validateEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!validatePhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }
    if (!formData.country) newErrors.country = "Please select your country"
    
    const passwordValidation = validatePassword(formData.password)
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (!passwordValidation.isValid) {
      newErrors.password = getPasswordValidationMessage(formData.password)
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.values(newErrors).every(error => !error)
  }

  const handlePasswordChange = (password: string) => {
    setFormData({ ...formData, password })
    if (password) {
      const message = getPasswordValidationMessage(password)
      setPasswordError(message)
    } else {
      setPasswordError("")
    }

    if (formData.confirmPassword) {
      const confirmMessage = getPasswordConfirmationMessage(password, formData.confirmPassword)
      setConfirmPasswordError(confirmMessage)
    }
  }

  const handlePasswordConfirmationChange = (confirmation: string) => {
    setFormData({ ...formData, confirmPassword: confirmation })
    if (confirmation) {
      const message = getPasswordConfirmationMessage(formData.password, confirmation)
      setConfirmPasswordError(message)
    } else {
      setConfirmPasswordError("")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return

    setIsLoading(true)
    setErrors({ firstName: "", lastName: "", email: "", phone: "", country: "", password: "", confirmPassword: "", general: "" })

    try {
      const user = register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        country: formData.country,
        phone: formData.phone,
      })
      setUser(user)
      toast.success("Account created successfully!")
      router.push("/")
    } catch (error) {
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
      <div className="min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-2xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <GlassCard className="p-8" strong>
                <div className="text-center mb-8">
                  <h1 className="font-serif text-4xl font-bold text-foreground mb-2">Create Account</h1>
                  <p className="text-muted-foreground">Join Arnova and start shopping</p>
                </div>

                {/* Progress Bar */}
                <div className="bg-muted mb-6 h-2 w-full overflow-hidden rounded-full">
                  <motion.div
                    className="bg-primary h-full"
                    initial="initial"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <motion.div whileFocus="focus" variants={inputVariants}>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          <Input
                            id="firstName"
                            type="text"
                            placeholder="John"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            className="pl-10 glass focus:border-primary/50 focus:ring-primary/20"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <InputError message={errors.firstName} />
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">
                        Last Name <span className="text-destructive">*</span>
                      </Label>
                      <motion.div whileFocus="focus" variants={inputVariants}>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          <Input
                            id="lastName"
                            type="text"
                            placeholder="Doe"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            className="pl-10 glass focus:border-primary/50 focus:ring-primary/20"
                            disabled={isLoading}
                            required
                          />
                        </div>
                        <InputError message={errors.lastName} />
                      </motion.div>
                    </div>
                  </div>

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
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="pl-10 glass focus:border-primary/50 focus:ring-primary/20"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <InputError message={errors.email} />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">
                      Country <span className="text-destructive">*</span>
                    </Label>
                    <motion.div whileFocus="focus" variants={inputVariants}>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                        <Select
                          value={formData.country}
                          onValueChange={(value) => setFormData({ ...formData, country: value })}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="pl-10 glass focus:border-primary/50 focus:ring-primary/20">
                            <SelectValue placeholder="Select your country" />
                          </SelectTrigger>
                          <SelectContent className="glass-strong max-h-[300px]">
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                <span className="flex items-center gap-2">
                                  <span className="text-lg">{country.flag}</span>
                                  {country.name}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <InputError message={errors.country} />
                    </motion.div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      Phone Number <span className="text-destructive">*</span>
                    </Label>
                    <motion.div whileFocus="focus" variants={inputVariants}>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="+1 234 567 8900"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="pl-10 glass focus:border-primary/50 focus:ring-primary/20"
                          disabled={isLoading}
                          required
                        />
                      </div>
                      <InputError message={errors.phone} />
                    </motion.div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            className="pl-10 pr-10 glass focus:border-primary/50 focus:ring-primary/20"
                            disabled={isLoading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none z-10"
                          >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <InputError message={errors.password || passwordError} />
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">
                        Confirm Password <span className="text-destructive">*</span>
                      </Label>
                      <motion.div whileFocus="focus" variants={inputVariants}>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={(e) => handlePasswordConfirmationChange(e.target.value)}
                            className="pl-10 pr-10 glass focus:border-primary/50 focus:ring-primary/20"
                            disabled={isLoading}
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus:outline-none z-10"
                          >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                          </button>
                        </div>
                        <InputError message={errors.confirmPassword || confirmPasswordError} />
                      </motion.div>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                  <p className="text-muted-foreground">
                    Already have an account?{" "}
                    <Link href="/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </CurrencyProvider>
  )
}
