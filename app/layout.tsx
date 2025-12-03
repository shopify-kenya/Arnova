import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { CurrencyProvider } from "@/components/currency-provider"
import { AuthProvider } from "@/components/auth-provider"
import { CartProvider } from "@/components/cart-provider"
import { PWAInstaller } from "@/components/pwa-installer"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "Arnova - Premium Fashion & Accessories",
  description:
    "Discover premium clothing, shoes, bags, and accessories at Arnova. Shop the latest collections with worldwide shipping.",
  keywords:
    "fashion, clothing, shoes, bags, accessories, premium fashion, online shopping",
  authors: [{ name: "Arnova" }],
  openGraph: {
    title: "Arnova - Premium Fashion & Accessories",
    description: "Discover premium clothing, shoes, bags, and accessories",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-192x192.jpg", sizes: "192x192", type: "image/jpeg" },
      { url: "/icon-512x512.jpg", sizes: "512x512", type: "image/jpeg" },
    ],
    apple: "/apple-touch-icon.jpg",
    shortcut: "/favicon.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arnova",
  },
  generator: "v0.app",
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fefae0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1f12" },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="antialiased" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Arnova" />
        <meta name="msapplication-TileImage" content="/icon-512x512.jpg" />
        <meta name="msapplication-TileColor" content="#606c38" />

        <link rel="apple-touch-icon" href="/apple-touch-icon.jpg" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192x192.jpg" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512x512.jpg" />

        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.jpg"
          media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.jpg"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icon-512x512.jpg"
          media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)"
        />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/service-worker.js')
                    .then(registration => console.log('SW registered:', registration))
                    .catch(error => console.log('SW registration failed:', error));
                });
              }
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <CurrencyProvider>
              <AuthProvider>
                <CartProvider>
                  {children}
                  <Toaster />
                  <PWAInstaller />
                </CartProvider>
              </AuthProvider>
            </CurrencyProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
