"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { X, Upload, Plus, Link } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface AddProductDialogProps {
  onProductAdded?: () => void
}

const AVAILABLE_SIZES = ["XS", "S", "M", "L", "XL", "XXL"]
const AVAILABLE_COLORS = [
  "Black",
  "White",
  "Gray",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Pink",
  "Purple",
  "Orange",
  "Brown",
  "Navy",
]

export function AddProductDialog({ onProductAdded }: AddProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [images, setImages] = useState<string[]>([])
  const [imageUrl, setImageUrl] = useState("")
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    category: "",
    sizes: [] as string[],
    colors: [] as string[],
    stock: "",
  })

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages: string[] = []
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          if (newImages.length === files.length) {
            setImages([...images, ...newImages])
          }
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const addImageUrl = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()])
      setImageUrl("")
    }
  }

  const handleSizeChange = (size: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, sizes: [...formData.sizes, size] })
    } else {
      setFormData({
        ...formData,
        sizes: formData.sizes.filter(s => s !== size),
      })
    }
  }

  const handleColorChange = (color: string, checked: boolean) => {
    if (checked) {
      setFormData({ ...formData, colors: [...formData.colors, color] })
    } else {
      setFormData({
        ...formData,
        colors: formData.colors.filter(c => c !== color),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation - all fields are now mandatory
    if (
      !formData.id ||
      !formData.name ||
      !formData.description ||
      !formData.price ||
      !formData.category ||
      formData.sizes.length === 0 ||
      formData.colors.length === 0 ||
      images.length === 0
    ) {
      toast.error(
        "Please fill in all required fields including sizes, colors, and images"
      )
      return
    }

    try {
      const response = await fetch("/api/admin/products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken":
            document.cookie
              .split("; ")
              .find(row => row.startsWith("csrftoken="))
              ?.split("=")[1] || "",
        },
        body: JSON.stringify({
          id: formData.id,
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          category_id: parseInt(formData.category),
          sizes: formData.sizes,
          colors: formData.colors,
          images: images,
          in_stock: parseInt(formData.stock) > 0,
        }),
      })

      if (response.ok) {
        toast.success("Product added successfully!")
        setOpen(false)
        setFormData({
          id: "",
          name: "",
          description: "",
          price: "",
          category: "",
          sizes: [],
          colors: [],
          stock: "",
        })
        setImages([])
        setImageUrl("")
        onProductAdded?.()
      } else {
        const error = await response.json()
        toast.error(error.error || "Failed to add product")
      }
    } catch (error) {
      toast.error("Network error. Please try again.")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="gradient" size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif">
            Add New Product
          </DialogTitle>
          <DialogDescription>
            Fill in the details to add a new product to your catalog
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="id">
              Product ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="id"
              value={formData.id}
              onChange={e => setFormData({ ...formData, id: e.target.value })}
              placeholder="CL-001"
              className="glass"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Product Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Premium Cotton T-Shirt"
              className="glass"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Describe your product..."
              className="glass min-h-[100px]"
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">
                Price <span className="text-destructive">*</span>
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e =>
                  setFormData({ ...formData, price: e.target.value })
                }
                placeholder="29.99"
                className="glass"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={value =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="glass">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="glass-strong">
                  <SelectItem value="clothing">Clothing</SelectItem>
                  <SelectItem value="shoes">Shoes</SelectItem>
                  <SelectItem value="bags">Bags</SelectItem>
                  <SelectItem value="accessories">Accessories</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>
                Available Sizes <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_SIZES.map(size => (
                  <div key={size} className="flex items-center space-x-2">
                    <Checkbox
                      id={`size-${size}`}
                      checked={formData.sizes.includes(size)}
                      onCheckedChange={checked =>
                        handleSizeChange(size, checked as boolean)
                      }
                    />
                    <Label htmlFor={`size-${size}`} className="text-sm">
                      {size}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>
                Available Colors <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {AVAILABLE_COLORS.map(color => (
                  <div key={color} className="flex items-center space-x-2">
                    <Checkbox
                      id={`color-${color}`}
                      checked={formData.colors.includes(color)}
                      onCheckedChange={checked =>
                        handleColorChange(color, checked as boolean)
                      }
                    />
                    <Label htmlFor={`color-${color}`} className="text-sm">
                      {color}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              value={formData.stock}
              onChange={e =>
                setFormData({ ...formData, stock: e.target.value })
              }
              placeholder="100"
              className="glass"
            />
          </div>

          <div className="space-y-2">
            <Label>
              Product Images <span className="text-destructive">*</span>
            </Label>

            {/* Image URL Input */}
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="glass flex-1"
              />
              <Button type="button" onClick={addImageUrl} variant="outline">
                <Link className="h-4 w-4 mr-2" />
                Add URL
              </Button>
            </div>

            {/* File Upload */}
            <div className="border-2 border-dashed border-border rounded-lg p-6 text-center glass">
              <input
                type="file"
                id="images"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <label htmlFor="images" className="cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">
                  Or click to upload product images
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, WEBP up to 10MB
                </p>
              </label>
            </div>

            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-4 mt-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image || "/placeholder.svg"}
                      alt={`Product ${index + 1}`}
                      width={96}
                      height={96}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Add Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
