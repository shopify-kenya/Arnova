export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: "clothing" | "shoes" | "bags" | "accessories"
  subcategory?: string
  images: string[]
  sizes: string[]
  colors: string[]
  inStock: boolean
  isNew: boolean
  onSale: boolean
  salePrice?: number
  rating: number
  reviews: number
}

export const mockProducts: Product[] = [
  // Clothing
  {
    id: "cl-001",
    name: "Premium Cotton T-Shirt",
    description:
      "Soft, breathable cotton t-shirt with a modern fit. Perfect for everyday wear.",
    price: 45.0,
    category: "clothing",
    subcategory: "t-shirts",
    images: ["/premium-cotton-t-shirt.png"],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    colors: ["White", "Black", "Navy", "Gray"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.5,
    reviews: 128,
  },
  {
    id: "cl-002",
    name: "Tailored Blazer",
    description:
      "Elegant blazer with a tailored fit. Perfect for professional settings.",
    price: 189.0,
    category: "clothing",
    subcategory: "jackets",
    images: ["/tailored-blazer-jacket.jpg"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Navy", "Charcoal"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.8,
    reviews: 89,
  },
  {
    id: "cl-003",
    name: "Slim Fit Jeans",
    description:
      "Classic slim fit jeans with stretch comfort. A wardrobe essential.",
    price: 79.0,
    salePrice: 59.0,
    category: "clothing",
    subcategory: "pants",
    images: ["/slim-fit-denim-jeans.jpg"],
    sizes: ["28", "30", "32", "34", "36", "38"],
    colors: ["Dark Blue", "Light Blue", "Black"],
    inStock: true,
    isNew: false,
    onSale: true,
    rating: 4.6,
    reviews: 256,
  },
  {
    id: "cl-004",
    name: "Cashmere Sweater",
    description:
      "Luxurious cashmere sweater with a relaxed fit. Ultimate comfort and style.",
    price: 159.0,
    category: "clothing",
    subcategory: "sweaters",
    images: ["/soft-cashmere-sweater.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Cream", "Camel", "Navy", "Gray"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.9,
    reviews: 145,
  },

  // Shoes
  {
    id: "sh-001",
    name: "Leather Sneakers",
    description:
      "Premium leather sneakers with cushioned sole. Style meets comfort.",
    price: 129.0,
    category: "shoes",
    subcategory: "sneakers",
    images: ["/premium-leather-sneakers.jpg"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["White", "Black", "Navy"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.7,
    reviews: 312,
  },
  {
    id: "sh-002",
    name: "Oxford Dress Shoes",
    description:
      "Classic oxford shoes in genuine leather. Perfect for formal occasions.",
    price: 179.0,
    salePrice: 139.0,
    category: "shoes",
    subcategory: "dress",
    images: ["/oxford-dress-shoes-leather.jpg"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black", "Brown"],
    inStock: true,
    isNew: false,
    onSale: true,
    rating: 4.8,
    reviews: 198,
  },
  {
    id: "sh-003",
    name: "Running Shoes",
    description:
      "High-performance running shoes with advanced cushioning technology.",
    price: 149.0,
    category: "shoes",
    subcategory: "athletic",
    images: ["/running-athletic-shoes.jpg"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    colors: ["Black/White", "Navy/Orange", "Gray/Blue"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.6,
    reviews: 421,
  },

  // Bags
  {
    id: "bg-001",
    name: "Leather Tote Bag",
    description:
      "Spacious leather tote bag with multiple compartments. Perfect for work or travel.",
    price: 199.0,
    category: "bags",
    subcategory: "totes",
    images: ["/leather-tote-bag.png"],
    sizes: ["One Size"],
    colors: ["Black", "Brown", "Tan"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.7,
    reviews: 167,
  },
  {
    id: "bg-002",
    name: "Canvas Backpack",
    description:
      "Durable canvas backpack with laptop compartment. Style and functionality combined.",
    price: 89.0,
    salePrice: 69.0,
    category: "bags",
    subcategory: "backpacks",
    images: ["/canvas-backpack.png"],
    sizes: ["One Size"],
    colors: ["Navy", "Olive", "Black"],
    inStock: true,
    isNew: false,
    onSale: true,
    rating: 4.5,
    reviews: 289,
  },
  {
    id: "bg-003",
    name: "Crossbody Bag",
    description:
      "Compact crossbody bag in premium leather. Perfect for everyday essentials.",
    price: 119.0,
    category: "bags",
    subcategory: "crossbody",
    images: ["/leather-crossbody-bag.png"],
    sizes: ["One Size"],
    colors: ["Black", "Cognac", "Navy"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.8,
    reviews: 234,
  },

  // Accessories
  {
    id: "ac-001",
    name: "Leather Belt",
    description:
      "Classic leather belt with brushed metal buckle. A timeless accessory.",
    price: 59.0,
    category: "accessories",
    subcategory: "belts",
    images: ["/leather-belt.png"],
    sizes: ["S", "M", "L", "XL"],
    colors: ["Black", "Brown"],
    inStock: true,
    isNew: false,
    onSale: false,
    rating: 4.6,
    reviews: 178,
  },
  {
    id: "ac-002",
    name: "Wool Scarf",
    description:
      "Soft wool scarf with elegant pattern. Perfect for cold weather.",
    price: 69.0,
    salePrice: 49.0,
    category: "accessories",
    subcategory: "scarves",
    images: ["/cozy-wool-scarf.png"],
    sizes: ["One Size"],
    colors: ["Navy", "Gray", "Burgundy"],
    inStock: true,
    isNew: false,
    onSale: true,
    rating: 4.7,
    reviews: 145,
  },
  {
    id: "ac-003",
    name: "Leather Wallet",
    description:
      "Slim leather wallet with RFID protection. Secure and stylish.",
    price: 79.0,
    category: "accessories",
    subcategory: "wallets",
    images: ["/leather-wallet.jpg"],
    sizes: ["One Size"],
    colors: ["Black", "Brown", "Navy"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.8,
    reviews: 312,
  },
  {
    id: "ac-004",
    name: "Sunglasses",
    description:
      "Premium sunglasses with UV protection. Classic design meets modern technology.",
    price: 149.0,
    category: "accessories",
    subcategory: "eyewear",
    images: ["/premium-sunglasses.png"],
    sizes: ["One Size"],
    colors: ["Black", "Tortoise", "Silver"],
    inStock: true,
    isNew: true,
    onSale: false,
    rating: 4.9,
    reviews: 267,
  },
]

export function getProductsByCategory(category: string): Product[] {
  return mockProducts.filter(p => p.category === category)
}

export function getNewArrivals(): Product[] {
  return mockProducts.filter(p => p.isNew)
}

export function getSaleProducts(): Product[] {
  return mockProducts.filter(p => p.onSale)
}

export function getProductById(id: string): Product | undefined {
  return mockProducts.find(p => p.id === id)
}

export function searchProducts(query: string): Product[] {
  const lowerQuery = query.toLowerCase()
  return mockProducts.filter(
    p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  )
}

export const products = mockProducts
