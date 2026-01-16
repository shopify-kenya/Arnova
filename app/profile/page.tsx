"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/components/auth-provider"
import { useRouter } from "next/navigation"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
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
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    fetchProfile()
  }, [isAuthenticated, router])

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/profile/")
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      }
    } catch (error) {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const res = await fetch("/api/profile/", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: formData.get("first_name"),
          last_name: formData.get("last_name"),
          email: formData.get("email"),
          phone: formData.get("phone"),
          address: formData.get("address"),
          city: formData.get("city"),
          country: formData.get("country"),
          postal_code: formData.get("postal_code"),
        }),
      })

      if (res.ok) {
        toast.success("Profile updated successfully")
        setEditing(false)
        fetchProfile()
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }

  if (loading) return <div className="container py-20">Loading...</div>

  return (
    <div className="container py-20">
      <GlassCard className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button onClick={() => setEditing(!editing)}>
            {editing ? "Cancel" : "Edit"}
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First Name
              </label>
              <input
                name="first_name"
                defaultValue={profile?.user.first_name}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                name="last_name"
                defaultValue={profile?.user.last_name}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              value={profile?.user.username}
              disabled
              className="w-full px-4 py-2 rounded-lg border bg-background opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              name="email"
              type="email"
              defaultValue={profile?.user.email}
              disabled={!editing}
              className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              name="phone"
              defaultValue={profile?.profile.phone}
              disabled={!editing}
              className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              name="address"
              defaultValue={profile?.profile.address}
              disabled={!editing}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">City</label>
              <input
                name="city"
                defaultValue={profile?.profile.city}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                name="country"
                defaultValue={profile?.profile.country}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Postal Code
              </label>
              <input
                name="postal_code"
                defaultValue={profile?.profile.postal_code}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
          </div>

          {editing && (
            <Button type="submit" className="w-full">
              Save Changes
            </Button>
          )}
        </form>
      </GlassCard>
    </div>
  )
}
