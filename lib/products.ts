import { graphqlRequest } from "./graphql-client"

export interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number | null
  currency: string
  baseCurrency: string
  category: string | null
  sizes: string[]
  colors: string[]
  images: string[]
  inStock: boolean
  isNew: boolean
  onSale: boolean
  rating: number
  reviews: number
}

const PRODUCT_FIELDS = `
  id
  name
  description
  price
  salePrice
  currency
  baseCurrency
  category
  sizes
  colors
  images
  inStock
  isNew
  onSale
  rating
  reviews
`

export async function fetchProducts(): Promise<Product[]> {
  const data = await graphqlRequest<{
    products: Product[]
  }>(`
    query Products {
      products {
        ${PRODUCT_FIELDS}
      }
    }
  `)
  return data.products || []
}

export async function fetchProductById(
  id: string | number
): Promise<Product | null> {
  const data = await graphqlRequest<{
    product: Product | null
  }>(
    `
    query Product($id: Int!) {
      product(id: $id) {
        ${PRODUCT_FIELDS}
      }
    }
    `,
    { id: Number(id) }
  )
  return data.product || null
}

export function filterProductsByCategory(
  products: Product[],
  category: string
): Product[] {
  return products.filter(product => product.category === category)
}

export function filterNewArrivals(products: Product[]): Product[] {
  return products.filter(product => product.isNew)
}

export function filterSaleProducts(products: Product[]): Product[] {
  return products.filter(product => product.onSale)
}
