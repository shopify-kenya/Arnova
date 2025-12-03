"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  LogOut,
  Camera,
  Upload,
} from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { countries } from "@/lib/countries"
import { toast } from "sonner"

export default function ProfilePage() {
  const router = useRouter()
  const { user, logout, isAuthenticated } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    phone: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
        phone: user.phone,
      })
      const savedImage = localStorage.getItem(`profile_image_${user.email}`)
      if (savedImage) {
        setProfileImage(savedImage)
      }
    }
  }, [user, isAuthenticated, router])

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB")
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        const imageData = reader.result as string
        setProfileImage(imageData)
        if (user) {
          localStorage.setItem(`profile_image_${user.email}`, imageData)
          toast.success("Profile picture updated successfully!")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    toast.success("Profile updated successfully!")
    setIsEditing(false)
  }

  const handleLogout = () => {
    logout()
    toast.success("Logged out successfully")
    router.push("/")
  }

  if (!user) return null

  const selectedCountry = countries.find(c => c.code === user.country)

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        <Navbar />

        <main className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
                  My Profile
                </h1>
                <p className="text-muted-foreground">
                  Manage your account settings and preferences
                </p>
              </div>

              <Tabs defaultValue="profile" className="space-y-6">
                <TabsList className="glass">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="orders">Orders</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="profile">
                  <GlassCard className="p-8" strong>
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className="relative group">
                          <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                            {profileImage ? (
                              <img
                                src={profileImage || "/placeholder.svg"}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <UserIcon className="h-10 w-10 text-primary" />
                            )}
                          </div>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Camera className="h-6 w-6 text-white" />
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold text-foreground">
                            {user.firstName} {user.lastName}
                          </h2>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Shield className="h-4 w-4" />
                            {user.role === "admin"
                              ? "Administrator"
                              : "Customer"}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 h-auto p-0 text-xs text-primary hover:text-primary/80"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Upload className="h-3 w-3 mr-1" />
                            Upload Picture
                          </Button>
                        </div>
                      </div>
                      <Button
                        variant={isEditing ? "outline" : "default"}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? "Cancel" : "Edit Profile"}
                      </Button>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="firstName">First Name</Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="firstName"
                              value={formData.firstName}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  firstName: e.target.value,
                                })
                              }
                              className="pl-10 glass"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="lastName">Last Name</Label>
                          <div className="relative">
                            <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                              id="lastName"
                              value={formData.lastName}
                              onChange={e =>
                                setFormData({
                                  ...formData,
                                  lastName: e.target.value,
                                })
                              }
                              className="pl-10 glass"
                              disabled={!isEditing}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="email"
                            value={formData.email}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            className="pl-10 glass"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground z-10" />
                          {isEditing ? (
                            <Select
                              value={formData.country}
                              onValueChange={value =>
                                setFormData({ ...formData, country: value })
                              }
                            >
                              <SelectTrigger className="pl-10 glass">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="glass-strong max-h-[300px]">
                                {countries.map(country => (
                                  <SelectItem
                                    key={country.code}
                                    value={country.code}
                                  >
                                    <span className="flex items-center gap-2">
                                      <span className="text-lg">
                                        {country.flag}
                                      </span>
                                      {country.name}
                                    </span>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={
                                selectedCountry
                                  ? `${selectedCountry.flag} ${selectedCountry.name}`
                                  : ""
                              }
                              className="pl-10 glass"
                              disabled
                            />
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={formData.phone}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            className="pl-10 glass"
                            disabled={!isEditing}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Member Since</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                          <Input
                            value={new Date(
                              user.createdAt
                            ).toLocaleDateString()}
                            className="pl-10 glass"
                            disabled
                          />
                        </div>
                      </div>

                      {isEditing && (
                        <Button
                          onClick={handleSave}
                          className="w-full"
                          size="lg"
                        >
                          Save Changes
                        </Button>
                      )}
                    </div>
                  </GlassCard>
                </TabsContent>

                <TabsContent value="orders">
                  <GlassCard className="p-8" strong>
                    <h3 className="text-2xl font-bold text-foreground mb-4">
                      Order History
                    </h3>
                    <p className="text-muted-foreground">
                      You haven't placed any orders yet.
                    </p>
                  </GlassCard>
                </TabsContent>

                <TabsContent value="security">
                  <GlassCard className="p-8" strong>
                    <h3 className="text-2xl font-bold text-foreground mb-6">
                      Security Settings
                    </h3>
                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-foreground mb-2">
                          Change Password
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Update your password to keep your account secure
                        </p>
                        <Button variant="outline">Change Password</Button>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <h4 className="font-semibold text-foreground mb-2">
                          Sign Out
                        </h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Sign out of your account on this device
                        </p>
                        <Button variant="destructive" onClick={handleLogout}>
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </Button>
                      </div>
                    </div>
                  </GlassCard>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </main>

        <Footer />
      </div>
    </CurrencyProvider>
  )
}
