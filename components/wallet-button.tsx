"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWallet, formatAddress } from "@/lib/web3-providers"
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown, Loader2 } from "lucide-react"
import { useState } from "react"

export function WalletButton() {
  const { wallet, connect, disconnect, isConnecting } = useWallet()
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={connect}
        disabled={isConnecting}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {isConnecting ? "Connecting..." : "Sign In"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="border-border bg-card hover:bg-card/80 bg-transparent">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-mono text-xs">{formatAddress(wallet.address!)}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-card border-border">
        <div className="px-2 py-1.5">
          <p className="text-xs text-muted-foreground">Balance</p>
          <p className="text-sm font-medium text-foreground">${wallet.balance || "0.00"}</p>
        </div>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem onClick={handleCopy} className="cursor-pointer hover:bg-secondary">
          <Copy className="mr-2 h-4 w-4" />
          {copied ? "Copied!" : "Copy ID"}
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
          <ExternalLink className="mr-2 h-4 w-4" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-border" />
        <DropdownMenuItem
          onClick={disconnect}
          className="cursor-pointer text-destructive hover:bg-secondary focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
