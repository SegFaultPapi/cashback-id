"use client"

import { Suspense } from "react"
import { usePathname } from "next/navigation"
import { BottomNav } from "@/components/bottom-nav"

const BOTTOM_NAV_ROUTES = ["/dashboard", "/verify", "/rewards", "/leaderboard", "/pay"]

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const showBottomNav = BOTTOM_NAV_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "?"))

  return (
    <>
      <div className={showBottomNav ? "pb-20 md:pb-0" : ""}>{children}</div>
      {showBottomNav && (
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      )}
    </>
  )
}
