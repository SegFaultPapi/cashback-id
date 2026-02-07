"use client"
import React, { useState } from "react"
import { HoveredLink, Menu, MenuItem, ProductItem } from "@/components/ui/navbar-menu"
import { cn } from "@/lib/utils"

export function LandingNavbar({ className }: { className?: string }) {
  const [active, setActive] = useState<string | null>(null)
  
  return (
    <div className={cn("hidden md:block fixed top-4 inset-x-0 z-40 px-4", className)}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center">
          <Menu setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="How It Works">
                <div className="grid grid-cols-2 gap-6 p-4">
                  <ProductItem
                    title="Shop Anywhere"
                    href="#howitworks"
                    src="/images/shop-anywhere.jpg"
                    description="Earn cashback at partner merchants on any EVM chain."
                  />
                  <ProductItem
                    title="ENS Routes It"
                    href="#howitworks"
                    src="/images/auto-invest.jpg"
                    description="Your .eth name stores preferences. LI.FI reads them to bridge your cashback."
                  />
                  <ProductItem
                    title="Sui Settles It"
                    href="#howitworks"
                    src="/images/track-growth.jpg"
                    description="Sub-second finality. zkLogin with Google or Apple. No seed phrases."
                  />
                  <ProductItem
                    title="Claim Anytime"
                    href="#howitworks"
                    src="/images/withdraw.jpg"
                    description="Auto-invested in yield pools. Withdraw whenever you want."
                  />
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="Architecture">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="#architecture">ENS Custom Text Records</HoveredLink>
                  <HoveredLink href="#architecture">LI.FI Cross-Chain Routing</HoveredLink>
                  <HoveredLink href="#architecture">Sui zkLogin Settlement</HoveredLink>
                  <HoveredLink href="#architecture">Filecoin Proof Layer</HoveredLink>
                  <HoveredLink href="#architecture">Safe Multi-Sig Control</HoveredLink>
                </div>
              </MenuItem>
              
              <MenuItem setActive={setActive} active={active} item="Tracks">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="https://li.fi">Best Use of LI.FI Composer</HoveredLink>
                  <HoveredLink href="https://sui.io">Best Overall Sui Project</HoveredLink>
                  <HoveredLink href="https://ens.domains">Most Creative Use of ENS</HoveredLink>
                </div>
              </MenuItem>

              <MenuItem setActive={setActive} active={active} item="About">
                <div className="flex flex-col space-y-4 text-sm">
                  <HoveredLink href="https://github.com/SegFaultPapi/cashback-id">GitHub</HoveredLink>
                  <HoveredLink href="#cta">Get Started</HoveredLink>
                </div>
              </MenuItem>
            </Menu>
        </div>
      </div>
    </div>
  )
}
