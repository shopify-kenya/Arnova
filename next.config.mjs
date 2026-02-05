/* global process */
/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
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
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
      {
        source: "/fonts/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
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
