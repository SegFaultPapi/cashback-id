"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Home, Send, Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const tab = searchParams?.get("tab") || ""

  const isHome = pathname === "/dashboard" && !tab
  const isPay = pathname === "/dashboard" && tab === "pay"
  const isActivity = pathname === "/dashboard" && tab === "activity"
  const isProfile = pathname === "/verify"

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t border-border bg-card/95 backdrop-blur-xl supports-[backdrop-filter]:bg-card/90 pb-[env(safe-area-inset-bottom)]"
      aria-label="Main navigation"
    >
      <div className="flex items-center justify-around h-16 px-2">
        <Link
          href="/dashboard"
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 transition-colors",
            isHome ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={isHome ? "page" : undefined}
        >
          <Home className="h-6 w-6 shrink-0" strokeWidth={isHome ? 2.25 : 1.75} />
          <span className="text-[10px] font-medium truncate w-full text-center">Home</span>
          {isHome && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />}
        </Link>

        <Link
          href="/dashboard?tab=pay"
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 transition-colors",
            isPay ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={isPay ? "page" : undefined}
        >
          <Send className="h-6 w-6 shrink-0" strokeWidth={isPay ? 2.25 : 1.75} />
          <span className="text-[10px] font-medium truncate w-full text-center">Pay</span>
          {isPay && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />}
        </Link>

        <Link
          href="/dashboard?tab=activity"
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 transition-colors",
            isActivity ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={isActivity ? "page" : undefined}
        >
          <Clock className="h-6 w-6 shrink-0" strokeWidth={isActivity ? 2.25 : 1.75} />
          <span className="text-[10px] font-medium truncate w-full text-center">Activity</span>
          {isActivity && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />}
        </Link>

        <Link
          href="/verify"
          className={cn(
            "relative flex flex-col items-center justify-center gap-0.5 flex-1 py-2 min-w-0 transition-colors",
            isProfile ? "text-primary" : "text-muted-foreground active:text-foreground"
          )}
          aria-current={isProfile ? "page" : undefined}
        >
          <User className="h-6 w-6 shrink-0" strokeWidth={isProfile ? 2.25 : 1.75} />
          <span className="text-[10px] font-medium truncate w-full text-center">Profile</span>
          {isProfile && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full bg-primary" />}
        </Link>
      </div>
    </nav>
  )
}
