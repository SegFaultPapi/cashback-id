"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { WalletButton } from "@/components/wallet-button"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DollarSign, Menu, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"

const navItems = [
  { href: "/dashboard", label: "Home" },
  { href: "/rewards", label: "History" },
  { href: "/transactions", label: "Transactions" },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <DollarSign className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">
              Cashback ID
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-muted-foreground hover:text-foreground rounded-lg"
          >
            <User className="h-5 w-5" />
          </Button>

          <WalletButton />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="rounded-lg">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-card border-border">
              <nav className="flex flex-col gap-2 mt-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-secondary text-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
