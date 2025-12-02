import { products } from "@/lib/products"
import ProductDetail from "./product-detail"

export function generateStaticParams() {
  return products.map((product) => ({
    id: product.id,
  }))
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetail productId={id} />
}