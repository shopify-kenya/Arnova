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
  keywords: "fashion, clothing, shoes, bags, accessories, premium fashion, online shopping",
  authors: [{ name: "Arnova" }],
  openGraph: {
    title: "Arnova - Premium Fashion & Accessories",
    description: "Discover premium clothing, shoes, bags, and accessories",
    type: "website",
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.jpg",
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
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
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
