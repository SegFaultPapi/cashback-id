"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DollarSign, Menu, LayoutDashboard, Clock, ArrowRightLeft, Shield, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/rewards", label: "History", icon: Clock },
  { href: "/transactions", label: "Transactions", icon: ArrowRightLeft },
  { href: "/verify", label: "Profile", icon: Shield },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary transition-transform group-hover:scale-105">
              <DollarSign className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
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

        <div className="flex items-center gap-2">
          <WalletButton />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-lg h-8 w-8">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border p-0">
              <div className="p-6 border-b border-border">
                <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                    <DollarSign className="h-4.5 w-4.5 text-primary-foreground" />
                  </div>
                  <span className="font-display text-lg font-bold text-foreground">
                    Cashback ID
                  </span>
                </Link>
              </div>
              <nav className="flex flex-col gap-1 p-4">
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = pathname === item.href
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )
                })}
              </nav>
              <div className="mt-auto p-4 border-t border-border">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  Sui Network
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
