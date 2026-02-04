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
      const { graphqlRequest } = await import("@/lib/graphql-client")
      const data = await graphqlRequest<{
        profile: {
          user: {
            id: number
            username: string
            email: string
            firstName: string
            lastName: string
          }
          profile: {
            avatar: string
            phone: string
            address: string
            city: string
            country: string
            postalCode: string
          }
        }
      }>(`
        query Profile {
          profile {
            user {
              id
              username
              email
              firstName
              lastName
            }
            profile {
              avatar
              phone
              address
              city
              country
              postalCode
            }
          }
        }
      `)
      const mapped: ProfileData = {
        user: {
          id: data.profile.user.id,
          username: data.profile.user.username,
          email: data.profile.user.email,
          first_name: data.profile.user.firstName || "",
          last_name: data.profile.user.lastName || "",
        },
        profile: {
          avatar: data.profile.profile.avatar || "",
          phone: data.profile.profile.phone || "",
          address: data.profile.profile.address || "",
          city: data.profile.profile.city || "",
          country: data.profile.profile.country || "",
          postal_code: data.profile.profile.postalCode || "",
        },
      }
      setProfile(mapped)
    } catch {
      toast.error("Failed to load profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      const { graphqlRequest } = await import("@/lib/graphql-client")
      await graphqlRequest<{
        updateProfile: { success: boolean }
      }>(
        `
        mutation UpdateProfile($input: ProfileUpdateInput!) {
          updateProfile(input: $input) {
            success
          }
        }
        `,
        {
          input: {
            firstName: formData.get("first_name"),
            lastName: formData.get("last_name"),
            email: formData.get("email"),
            phone: formData.get("phone"),
            address: formData.get("address"),
            city: formData.get("city"),
            country: formData.get("country"),
            postalCode: formData.get("postal_code"),
          },
        }
      )
      toast.success("Profile updated successfully")
      setEditing(false)
      fetchProfile()
    } catch {
      toast.error("Failed to update profile")
    }
  }

  if (loading) return <div className="container py-20">Loading...</div>

  return (
    <div className="container py-20">
      <GlassCard className="max-w-2xl mx-auto p-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Profile</h1>
          <Button variant="default" onClick={() => setEditing(!editing)}>
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
                placeholder="Enter your first name"
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
                placeholder="Enter your last name"
                defaultValue={profile?.user.last_name}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Username</label>
            <input
              placeholder="Username (read-only)"
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
              placeholder="your.email@example.com"
              defaultValue={profile?.user.email}
              disabled={!editing}
              className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Phone</label>
            <input
              name="phone"
              placeholder="+254 712 345 678"
              defaultValue={profile?.profile.phone}
              disabled={!editing}
              className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Address</label>
            <textarea
              name="address"
              placeholder="Enter your full address"
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
                placeholder="City"
                defaultValue={profile?.profile.city}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Country</label>
              <input
                name="country"
                placeholder="Country"
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
                placeholder="Postal code"
                defaultValue={profile?.profile.postal_code}
                disabled={!editing}
                className="w-full px-4 py-2 rounded-lg border bg-background disabled:opacity-60"
              />
            </div>
          </div>

          {editing && (
            <Button variant="default" type="submit" className="w-full">
              Save Changes
            </Button>
          )}
        </form>
      </GlassCard>
    </div>
  )
}
