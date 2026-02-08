import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/lib/web3-providers"
import { AppShell } from "@/components/app-shell"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || ""

export const metadata: Metadata = {
  metadataBase: baseUrl ? new URL(baseUrl) : undefined,
  title: "Cashback ID | Your Identity Pays",
  description: "Turn every purchase into an investment. Earn cashback that grows automatically.",
  generator: "v0.app",
  icons: {
    icon: [
      { url: "/images/logocashback.png", type: "image/png", sizes: "any" },
      { url: "/images/logocashback.svg", type: "image/svg+xml", sizes: "any" },
    ],
    apple: "/images/logocashback.png",
  },
  openGraph: {
    title: "Cashback ID | Your Identity Pays",
    description: "Turn every purchase into an investment. Earn cashback that grows automatically.",
    siteName: "Cashback ID",
    images: [{ url: "/images/logocashback.png", width: 512, height: 512, alt: "Cashback ID" }],
    locale: "en",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Cashback ID | Your Identity Pays",
    description: "Turn every purchase into an investment. Earn cashback that grows automatically.",
    images: ["/images/logocashback.png"],
  },
}

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark" data-scroll-behavior="smooth" style={{ colorScheme: "dark" }}>
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Web3Provider>
            <AppShell>{children}</AppShell>
          </Web3Provider>
          <Toaster position="top-center" richColors closeButton />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
