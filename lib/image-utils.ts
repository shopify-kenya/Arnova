/**
 * Get product image URL with fallback to placeholder
 */
export function getProductImageUrl(imagePath: string | undefined): string {
  if (!imagePath) {
    return "/placeholder.svg"
  }

  // If it's already a full URL, return it
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath
  }

  // If it starts with /, it's a path from public folder
  if (imagePath.startsWith("/")) {
    return imagePath
  }

  // Otherwise, prepend /
  return `/${imagePath}`
}

/**
 * Get all product images with fallback
 */
export function getProductImages(images: string[] | undefined): string[] {
  if (!images || images.length === 0) {
    return ["/placeholder.svg"]
  }

  return images.map(getProductImageUrl)
}
