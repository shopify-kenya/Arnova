"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import {
  UserIcon,
  Mail,
  Phone,
  MapPin,
  Shield,
  LogOut,
  Camera,
  Upload,
} from "lucide-react"
import { BuyerNavbar } from "@/components/buyer-navbar"
import { BuyerFilterSidebar } from "@/components/buyer-filter-sidebar"
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
import { countries } from "@/lib/countries"
import { toast } from "sonner"

interface ProfileData {
  user: {
    id: number
    username: string
    email: string
    first_name: string
    last_name: string
  }
  profile: {
    avatar: string
    phone: string
    address: string
    city: string
    country: string
    postal_code: string
  }
}

export default function ProfilePage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile/", {
        credentials: "include",
      })

      if (response.status === 401) {
        router.push("/login")
        return
      }

      if (response.ok) {
        const data: ProfileData = await response.json()
        setProfileData(data)
        setFormData({
          first_name: data.user.first_name,
          last_name: data.user.last_name,
          email: data.user.email,
          phone: data.profile.phone,
          address: data.profile.address,
          city: data.profile.city,
          country: data.profile.country,
          postal_code: data.profile.postal_code,
        })
        if (data.profile.avatar) {
          setProfileImage(data.profile.avatar)
        }
      }
    } catch (error) {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

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
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          ...formData,
          avatar: profileImage,
        }),
      })

      if (response.ok) {
        toast.success("Profile updated successfully!")
        setIsEditing(false)
        fetchProfile() // Refresh data
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout/", {
        method: "POST",
        credentials: "include",
      })
      toast.success("Logged out successfully")
      router.push("/")
    } catch (error) {
      toast.error("Failed to logout")
    }
  }

  if (loading) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </CurrencyProvider>
    )
  }

  if (!profileData) return null

  const selectedCountry = countries.find(c => c.code === formData.country)

  return (
    <CurrencyProvider>
      <div className="min-h-screen">
        <BuyerNavbar
          title="My Profile"
          subtitle="Manage your account settings"
          onMenuToggle={() => setIsFilterOpen(true)}
        />
        <BuyerFilterSidebar
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
        />
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList className="glass">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <GlassCard className="p-8" strong>
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                      <div className="relative group">
                        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center overflow-hidden">
                          {profileImage ? (
                            <Image
                              src={profileImage}
                              alt="Profile"
                              width={80}
                              height={80}
                              className="object-cover rounded-full"
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
                          {profileData.user.first_name}{" "}
                          {profileData.user.last_name}
                        </h2>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Customer
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
                      disabled={saving}
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
                            value={formData.first_name}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                first_name: e.target.value,
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
                            value={formData.last_name}
                            onChange={e =>
                              setFormData({
                                ...formData,
                                last_name: e.target.value,
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
                      <Label htmlFor="address">Address</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              address: e.target.value,
                            })
                          }
                          className="pl-10 glass"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={formData.city}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              city: e.target.value,
                            })
                          }
                          className="glass"
                          disabled={!isEditing}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        {isEditing ? (
                          <Select
                            value={formData.country}
                            onValueChange={value =>
                              setFormData({ ...formData, country: value })
                            }
                          >
                            <SelectTrigger className="glass">
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
                                : formData.country
                            }
                            className="glass"
                            disabled
                          />
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="postalCode">Postal Code</Label>
                        <Input
                          id="postalCode"
                          value={formData.postal_code}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              postal_code: e.target.value,
                            })
                          }
                          className="glass"
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    {isEditing && (
                      <Button
                        onClick={handleSave}
                        className="w-full"
                        size="lg"
                        disabled={saving}
                      >
                        {saving ? "Saving..." : "Save Changes"}
                      </Button>
                    )}
                  </div>
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
        </main>
        <Footer />
      </div>
    </CurrencyProvider>
  )
}
