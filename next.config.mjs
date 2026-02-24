/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  trailingSlash: false,
  images: {
    unoptimized: true,
    formats: ["image/webp"],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ]
  },
  async rewrites() {
    return [
      {
        source: "/graphql/",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/graphql/`,
      },
      {
        source: "/admin/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/admin/:path*`,
      },
      {
        source: "/media/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/media/:path*`,
      },
    ]
  },
}

export default nextConfig
