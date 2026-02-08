"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useWallet, formatAddress } from "@/lib/web3-providers"
import { Wallet, LogOut, Copy, ExternalLink, ChevronDown, Loader2, Link2, Globe } from "lucide-react"
import { useState } from "react"

export function WalletButton() {
  const { wallet, connect, disconnect, isConnecting, linkEnsName } = useWallet()
  const [copied, setCopied] = useState(false)
  const [showEnsDialog, setShowEnsDialog] = useState(false)
  const [ensInput, setEnsInput] = useState("")
  const [isLinkingEns, setIsLinkingEns] = useState(false)

  const handleCopy = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleLinkEns = async () => {
    if (!ensInput.endsWith(".eth")) return
    setIsLinkingEns(true)
    try {
      await linkEnsName(ensInput)
      setShowEnsDialog(false)
      setEnsInput("")
    } finally {
      setIsLinkingEns(false)
    }
  }

  if (!wallet.isConnected) {
    return (
      <Button
        onClick={() => connect("google")}
        disabled={isConnecting}
        size="sm"
        className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
      >
        {isConnecting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Connecting...
          </>
        ) : (
          "Sign In"
        )}
      </Button>
    )
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="border-border bg-card hover:bg-card/80 bg-transparent">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary" />
              {wallet.ensName ? (
                <span className="font-mono text-xs text-primary">{wallet.ensName}</span>
              ) : (
                <span className="font-mono text-xs">{formatAddress(wallet.address!)}</span>
              )}
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card border-border">
          <div className="px-3 py-2">
            <p className="text-xs text-muted-foreground">Balance (SUI)</p>
            <p className="text-sm font-medium text-foreground">{wallet.balance} SUI</p>
            {wallet.ensName && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <Globe className="h-3 w-3 text-primary" />
                <p className="text-xs text-primary">{wallet.ensName}</p>
              </div>
            )}
            {wallet.preferences && (
              <div className="mt-1.5">
                <p className="text-[10px] text-muted-foreground">
                  Payout: {wallet.preferences.asset || "Not set"} on Chain {wallet.preferences.chainId || "—"}
                </p>
              </div>
            )}
          </div>
          <DropdownMenuSeparator className="bg-border" />
          {!wallet.ensName && (
            <DropdownMenuItem
              onClick={() => setShowEnsDialog(true)}
              className="cursor-pointer hover:bg-secondary"
            >
              <Link2 className="mr-2 h-4 w-4" />
              Link ENS Name
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={handleCopy} className="cursor-pointer hover:bg-secondary">
            <Copy className="mr-2 h-4 w-4" />
            {copied ? "Copied!" : "Copy Address"}
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-secondary">
            <ExternalLink className="mr-2 h-4 w-4" />
            View on Explorer
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

      {/* ENS Link Dialog */}
      <Dialog open={showEnsDialog} onOpenChange={setShowEnsDialog}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Link Your ENS Name</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Connect your <span className="text-primary font-mono">.eth</span> name to load 
              your payment preferences (chain, asset, pool) from ENS Custom Text Records.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              placeholder="yourname.eth"
              value={ensInput}
              onChange={(e) => setEnsInput(e.target.value)}
              className="bg-background border-border text-foreground font-mono placeholder:text-muted-foreground"
            />
            <Button
              onClick={handleLinkEns}
              disabled={!ensInput.endsWith(".eth") || isLinkingEns}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLinkingEns ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resolving...
                </>
              ) : (
                <>
                  <Link2 className="mr-2 h-4 w-4" />
                  Link & Load Preferences
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              We read <code className="text-primary">cashbackid.*</code> text records from your ENS name.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
