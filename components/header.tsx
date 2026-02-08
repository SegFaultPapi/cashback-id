"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/wallet-button"
import { LayoutDashboard, Shield, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/verify", label: "Profile", icon: Shield },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <Image
              src="/images/logocashback.svg"
              alt="Cashback ID"
              width={32}
              height={32}
              className="h-8 w-8 object-contain transition-transform group-hover:scale-105"
            />
            <span className="font-display text-lg font-bold text-foreground hidden sm:block">
              Cashback ID
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-card/60"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <WalletButton />
      </div>
    </header>
  )
}
