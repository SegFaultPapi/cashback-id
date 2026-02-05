import React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, JetBrains_Mono, DM_Sans } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { Web3Provider } from "@/lib/web3-providers"
import "./globals.css"

const _inter = Inter({ subsets: ["latin"] })
const _dmSans = DM_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"] })
const _jetbrainsMono = JetBrains_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Cashback ID | Your Identity Pays",
  description: "Turn every purchase into an investment. Earn cashback that grows automatically.",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
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
    <html lang="en" className="dark">
      <body className="font-sans antialiased min-h-screen bg-background text-foreground">
        <Web3Provider>{children}</Web3Provider>
        <Analytics />
      </body>
    </html>
  )
}
