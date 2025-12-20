"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Edit, Trash2, Search, Package, Plus } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { GlassCard } from "@/components/glass-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { CurrencyProvider, useCurrency } from "@/components/currency-provider"
import { useAuth } from "@/components/auth-provider"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  category_id: number
  in_stock: boolean
  sizes: string[]
  colors: string[]
  images: string[]
  created_at: string
}

interface Category {
  id: number
  name: string
  slug: string
}

function AdminProductsContent() {
  const router = useRouter()
  const { isAdmin, isAuthenticated } = useAuth()
  const { formatPrice } = useCurrency()
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: 0,
    category_id: 0,
    in_stock: true,
    sizes: [] as string[],
    colors: [] as string[],
    images: [] as string[],
  })

  useEffect(() => {
    if (!isAuthenticated || !isAdmin) {
      router.push("/")
      return
    }
    fetchProducts()
    fetchCategories()
  }, [isAuthenticated, isAdmin, router])

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/admin/products/", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setProducts(data.products || [])
      } else {
        toast.error("Failed to fetch products")
      }
    } catch (error) {
      toast.error("Failed to fetch products")
    } finally {
      setLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories/")
      if (response.ok) {
        const data = await response.json()
        setCategories(data.categories || [])
      }
    } catch (error) {
      console.error("Failed to fetch categories")
    }
  }

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      id: `PROD${Date.now()}`,
      name: "",
      description: "",
      price: 0,
      category_id: categories[0]?.id || 0,
      in_stock: true,
      sizes: [],
      colors: [],
      images: [],
    })
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      category_id: product.category_id,
      in_stock: product.in_stock,
      sizes: product.sizes,
      colors: product.colors,
      images: product.images,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}/`
        : "/api/admin/products/"
      const method = editingProduct ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast.success(
          editingProduct
            ? "Product updated successfully"
            : "Product created successfully"
        )
        setShowModal(false)
        fetchProducts()
      } else {
        toast.error("Failed to save product")
      }
    } catch (error) {
      toast.error("Failed to save product")
    }
  }

  const handleDelete = async (product: Product) => {
    if (confirm(`Are you sure you want to delete product ${product.name}?`)) {
      try {
        const response = await fetch(`/api/admin/products/${product.id}/`, {
          method: "DELETE",
          credentials: "include",
        })

        if (response.ok) {
          toast.success("Product deleted successfully")
          fetchProducts()
        } else {
          toast.error("Failed to delete product")
        }
      } catch (error) {
        toast.error("Failed to delete product")
      }
    }
  }

  if (!isAdmin) return null

  const filteredProducts = products.filter(
    product =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading products...</p>
        </div>
      </div>
    )
  }

  return (
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
                Products
              </h1>
              <p className="text-muted-foreground">
                Manage your product catalog
              </p>
            </div>
            <Button onClick={handleCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Button>
          </div>

          <GlassCard className="p-6 mb-6" strong>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search products..."
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
                      Product
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Category
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Price
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-left p-4 font-semibold text-foreground">
                      Created
                    </th>
                    <th className="text-right p-4 font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product, index) => (
                    <motion.tr
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors"
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                            <Package className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {product.name}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">{product.category}</Badge>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={product.in_stock ? "default" : "destructive"}
                        >
                          {product.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-muted-foreground">
                          {new Date(product.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(product)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="text-destructive"
                            onClick={() => handleDelete(product)}
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
              {editingProduct ? "Edit Product" : "Create Product"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="id">Product ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={e =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  disabled={!!editingProduct}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={e =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      price: parseFloat(e.target.value) || 0,
                    })
                  }
                  required
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category_id.toString()}
                  onValueChange={value =>
                    setFormData({ ...formData, category_id: parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sizes">Sizes (comma separated)</Label>
                <Input
                  id="sizes"
                  value={formData.sizes.join(", ")}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      sizes: e.target.value
                        .split(",")
                        .map(s => s.trim())
                        .filter(s => s),
                    })
                  }
                  placeholder="S, M, L, XL"
                />
              </div>
              <div>
                <Label htmlFor="colors">Colors (comma separated)</Label>
                <Input
                  id="colors"
                  value={formData.colors.join(", ")}
                  onChange={e =>
                    setFormData({
                      ...formData,
                      colors: e.target.value
                        .split(",")
                        .map(c => c.trim())
                        .filter(c => c),
                    })
                  }
                  placeholder="Red, Blue, Green"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="images">Image URLs (comma separated)</Label>
              <Input
                id="images"
                value={formData.images.join(", ")}
                onChange={e =>
                  setFormData({
                    ...formData,
                    images: e.target.value
                      .split(",")
                      .map(i => i.trim())
                      .filter(i => i),
                  })
                }
                placeholder="https://example.com/image1.jpg, https://example.com/image2.jpg"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="in_stock"
                checked={formData.in_stock}
                onCheckedChange={checked =>
                  setFormData({ ...formData, in_stock: !!checked })
                }
              />
              <Label htmlFor="in_stock">In Stock</Label>
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
                {editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AdminProductsPage() {
  return (
    <CurrencyProvider>
      <AdminProductsContent />
    </CurrencyProvider>
  )
}
