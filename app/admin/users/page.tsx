"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Search, Shield, User, Edit, Trash2, Plus, X } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlassCard } from "@/components/glass-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { CurrencyProvider } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface UserData {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  is_staff: boolean
  is_active: boolean
  date_joined: string
  profile: {
    phone: string
    address: string
    city: string
    country: string
    postal_code: string
  }
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    is_staff: false,
    is_active: true,
    phone: "",
    address: "",
    city: "",
    country: "",
    postal_code: "",
  })

  const [csrfToken, setCsrfToken] = useState<string>("")

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
      return
    }
    fetchCsrfToken()
  }, [isAuthenticated, isAdmin, router])

  useEffect(() => {
    if (csrfToken) {
      fetchUsers()
    }
  }, [csrfToken])

  const fetchCsrfToken = async () => {
    try {
      const response = await fetch("/api/csrf-token/", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setCsrfToken(data.csrfToken)
      }
    } catch (error) {
      console.error("Failed to fetch CSRF token")
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users/", {
        credentials: "include",
        headers: {
          "X-CSRFToken": csrfToken,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      } else if (response.status === 401) {
        toast.error("Authentication required. Please log in as admin.")
        router.push("/auth/login")
      } else {
        toast.error("Failed to fetch users")
      }
    } catch (error) {
      toast.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    setFormData({
      username: "",
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      is_staff: false,
      is_active: true,
      phone: "",
      address: "",
      city: "",
      country: "",
      postal_code: "",
    })
    setShowModal(true)
  }

  const handleEdit = (user: UserData) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      first_name: user.first_name,
      last_name: user.last_name,
      is_staff: user.is_staff,
      is_active: user.is_active,
      phone: user.profile.phone,
      address: user.profile.address,
      city: user.profile.city,
      country: user.profile.country,
      postal_code: user.profile.postal_code,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingUser
        ? `/api/admin/users/${editingUser.id}/`
        : "/api/admin/users/"
      const method = editingUser ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken,
        },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          editingUser
            ? "User updated successfully"
            : "User created successfully"
        )
        setShowModal(false)
        fetchUsers()
      } else if (response.status === 401) {
        toast.error("Authentication required. Please log in as admin.")
        router.push("/auth/login")
      } else {
        toast.error("Failed to save user")
      }
    } catch (error) {
      toast.error("Failed to save user")
    }
  }

  const handleDelete = async (user: UserData) => {
    if (confirm(`Are you sure you want to delete user ${user.username}?`)) {
      try {
        const response = await fetch(`/api/admin/users/${user.id}/`, {
          method: "DELETE",
          headers: {
            "X-CSRFToken": csrfToken,
          },
          credentials: "include",
        })

        if (response.ok) {
          toast.success("User deleted successfully")
          fetchUsers()
        } else if (response.status === 401) {
          toast.error("Authentication required. Please log in as admin.")
          router.push("/auth/login")
        } else {
          toast.error("Failed to delete user")
        }
      } catch (error) {
        toast.error("Failed to delete user")
      }
    }
  }

  if (!isAdmin) return null

  const filteredUsers = users.filter(
    user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <CurrencyProvider>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Loading users...</p>
          </div>
        </div>
      </CurrencyProvider>
    )
  }

  return (
    <CurrencyProvider>
      <div className="min-h-screen flex">
        <AdminSidebar />

        <main className="flex-1 ml-72 lg:ml-72 md:ml-64 sm:ml-56 p-4 md:p-6 lg:p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="font-serif text-5xl font-bold text-foreground mb-2">
                  Users
                </h1>
                <p className="text-muted-foreground">Manage platform users</p>
              </div>
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <GlassCard className="p-6 mb-6" strong>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 glass"
                />
              </div>
            </GlassCard>

            <GlassCard className="overflow-hidden" strong>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr>
                      <th className="text-left p-4 font-semibold text-foreground">
                        User
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Email
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Role
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Status
                      </th>
                      <th className="text-left p-4 font-semibold text-foreground">
                        Joined
                      </th>
                      <th className="text-right p-4 font-semibold text-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user, index) => (
                      <motion.tr
                        key={user.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">
                                {user.username}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.first_name} {user.last_name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <p className="text-foreground">{user.email}</p>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={user.is_staff ? "default" : "outline"}
                          >
                            {user.is_staff ? (
                              <>
                                <Shield className="h-3 w-3 mr-1" />
                                Admin
                              </>
                            ) : (
                              "User"
                            )}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={user.is_active ? "default" : "destructive"}
                          >
                            {user.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <p className="text-sm text-muted-foreground">
                            {new Date(user.date_joined).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="text-destructive"
                              onClick={() => handleDelete(user)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </motion.div>
        </main>

        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create User"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={e =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    required
                  />
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
                  />
                </div>
              </div>

              {!editingUser && (
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={e =>
                      setFormData({ ...formData, first_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={e =>
                      setFormData({ ...formData, last_name: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={e =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={e =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={e =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={e =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="postal_code">Postal Code</Label>
                  <Input
                    id="postal_code"
                    value={formData.postal_code}
                    onChange={e =>
                      setFormData({ ...formData, postal_code: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_staff"
                    checked={formData.is_staff}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, is_staff: !!checked })
                    }
                  />
                  <Label htmlFor="is_staff">Admin User</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={checked =>
                      setFormData({ ...formData, is_active: !!checked })
                    }
                  />
                  <Label htmlFor="is_active">Active</Label>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </CurrencyProvider>
  )
}
