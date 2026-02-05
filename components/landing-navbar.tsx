"use client"
import React, { useState } from "react"
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu"
import { cn } from "@/lib/utils"

export function LandingNavbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null)
  
  return (
    <div className={cn("fixed top-10 inset-x-0 z-50 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <Menu setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="Features">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="#features">Auto-Investing</HoveredLink>
                  <HoveredLink href="#features">Privacy Protection</HoveredLink>
                  <HoveredLink href="#features">Real-Time Tracking</HoveredLink>
                  <HoveredLink href="#card">Identity Card</HoveredLink>
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="How It Works">
                <div className="grid grid-cols-2 gap-6 p-4">
                  <ProductItem
                    title="Shop Anywhere"
                    href="#howitworks"
                    src="/images/shop-anywhere.jpg"
                    description="Use your unique ID at partner merchants to earn cashback instantly."
                  />
                  <ProductItem
                    title="Auto-Invest"
                    href="#howitworks"
                    src="/images/auto-invest.jpg"
                    description="Your cashback automatically goes into yield-generating pools on Sui."
                  />
                  <ProductItem
                    title="Track Growth"
                    href="#howitworks"
                    src="/images/track-growth.jpg"
                    description="Watch your returns grow in real-time with complete transparency."
                  />
                  <ProductItem
                    title="Withdraw Anytime"
                    href="#howitworks"
                    src="/images/withdraw.jpg"
                    description="Access your funds whenever you need them, no lock-up periods."
                  />
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="Partners">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="#partners">Retail Stores</HoveredLink>
                  <HoveredLink href="#partners">Online Merchants</HoveredLink>
                  <HoveredLink href="#partners">Restaurants</HoveredLink>
                  <HoveredLink href="#partners">Become a Partner</HoveredLink>
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="About">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="#about">Our Mission</HoveredLink>
                  <HoveredLink href="#about">Technology</HoveredLink>
                  <HoveredLink href="#about">Security</HoveredLink>
                  <HoveredLink href="#about">Contact</HoveredLink>
                </div>
              </MenuItem>
            </Menu>
        </div>
      </div>
    </div>
  )
}
