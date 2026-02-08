"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Header } from "@/components/header"
import { useWallet, SUPPORTED_CHAINS } from "@/lib/web3-providers"
import { useSui } from "@/lib/sui-client"
import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  ShoppingBag,
  Sparkles,
  Eye,
  EyeOff,
  Globe,
  Layers,
  Send,
  Wallet,
  Loader2,
  Search,
  Filter,
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  Download,
  RefreshCw,
  ExternalLink,
} from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { resolvePaymentPreferences } from "@/lib/ens-resolver"
import type { OmnipinSweepResult } from "@/lib/lifi-client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

const MOCK_BALANCES = [
  { chainId: 8453, tokenAddress: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", amount: "15000000", amountUSD: 15 },
  { chainId: 42161, tokenAddress: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", amount: "5000000", amountUSD: 5 },
]

type ActivityTx = {
  id: string
  merchant: string
  amount: number
  cashback: number
  date: string
  type: "purchase" | "growth" | "bridge"
  status: "completed" | "pending" | "bridging"
  sourceChain: number
  destChain: number
  bridgeTool?: string
}

const MOCK_ACTIVITY: ActivityTx[] = [
  { id: "1", merchant: "Target", amount: 87.5, cashback: 6.13, date: "2 hours ago", type: "purchase", status: "completed", sourceChain: 8453, destChain: 101, bridgeTool: "LI.FI (Stargate)" },
  { id: "2", merchant: "Yield Earned", amount: 0, cashback: 2.87, date: "1 day ago", type: "growth", status: "completed", sourceChain: 101, destChain: 101 },
  { id: "3", merchant: "Whole Foods", amount: 143.22, cashback: 7.16, date: "2 days ago", type: "purchase", status: "completed", sourceChain: 42161, destChain: 101, bridgeTool: "LI.FI (Hop)" },
  { id: "4", merchant: "Amazon", amount: 234.99, cashback: 11.75, date: "3 days ago", type: "purchase", status: "completed", sourceChain: 1, destChain: 101, bridgeTool: "LI.FI (Across)" },
  { id: "5", merchant: "Omnipin Sweep", amount: 0, cashback: 15.3, date: "4 days ago", type: "bridge", status: "completed", sourceChain: 42161, destChain: 101, bridgeTool: "LI.FI (Stargate)" },
  { id: "6", merchant: "Starbucks", amount: 15.8, cashback: 0.95, date: "5 days ago", type: "purchase", status: "bridging", sourceChain: 10, destChain: 101, bridgeTool: "LI.FI (Celer)" },
]

export default function DashboardContent() {
  const { wallet, linkEnsName, checkSweep, getClaimRoute, recordCashback } = useWallet()
  const sui = useSui()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [cashbackBalance, setCashbackBalance] = useState("0")
  const [sweepResults, setSweepResults] = useState<Awaited<ReturnType<typeof checkSweep>>>([])
  const [proofResult, setProofResult] = useState<{ cid: string; gatewayUrl: string } | null>(null)
  const [isRecordingProof, setIsRecordingProof] = useState(false)
  const [claimLabel, setClaimLabel] = useState("")
  const [isClaiming, setIsClaiming] = useState(false)
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimTxHash, setClaimTxHash] = useState<string | null>(null)
  const [claimOnChainError, setClaimOnChainError] = useState<string | null>(null)
  const [pendingOnChainLabel, setPendingOnChainLabel] = useState<string | null>(null)
  const [isRetryingOnChain, setIsRetryingOnChain] = useState(false)

  const [payEnsName, setPayEnsName] = useState("")
  const [payAmount, setPayAmount] = useState("")
  const [payProfileId, setPayProfileId] = useState<string | null>(null)
  const [payResolving, setPayResolving] = useState(false)
  const [payLoading, setPayLoading] = useState(false)
  const [payResult, setPayResult] = useState<{ digest: string } | null>(null)
  const [payError, setPayError] = useState<string | null>(null)

  const [activitySearch, setActivitySearch] = useState("")
  const [activityTypeFilter, setActivityTypeFilter] = useState("all")
  const [activityStatusFilter, setActivityStatusFilter] = useState("all")
  const [routeDetailIndex, setRouteDetailIndex] = useState<number | null>(null)
  const [isRefreshingBalance, setIsRefreshingBalance] = useState(false)

  const totalInvested = 2847.5
  const growthPercentage = 8.23
  const monthlyReturn = 23.45
  const purchases = 47

  const tabParam = searchParams?.get("tab") || ""
  const tabValue = tabParam === "pay" || tabParam === "activity" ? tabParam : "overview"

  useEffect(() => {
    if (!wallet.isConnected) router.push("/")
  }, [wallet.isConnected, router])

  useEffect(() => {
    if (wallet.ensName && !pendingOnChainLabel) {
      setClaimTxHash(null)
      setClaimOnChainError(null)
    }
  }, [wallet.ensName, pendingOnChainLabel])

  const tryRegisterOnChain = async (label: string) => {
    const res = await fetch("/api/ens/register-onchain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label }),
    })
    const data = await res.json()
    return data.txHash ? { txHash: data.txHash } : { error: data.error || "Error registering on-chain" }
  }


  const refreshBalance = useCallback(() => {
    if (!wallet.isConnected) return
    setIsRefreshingBalance(true)
    sui.getCashbackBalance().then((b) => {
      setCashbackBalance(b)
      setIsRefreshingBalance(false)
    }).finally(() => setIsRefreshingBalance(false))
  }, [wallet.isConnected, sui])

  useEffect(() => {
    refreshBalance()
  }, [refreshBalance])

  useEffect(() => {
    const onVisibility = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible" && wallet.isConnected) {
        sui.getCashbackBalance().then(setCashbackBalance)
      }
    }
    document?.addEventListener("visibilitychange", onVisibility)
    return () => document?.removeEventListener("visibilitychange", onVisibility)
  }, [wallet.isConnected, sui])

  useEffect(() => {
    if (wallet.isConnected && wallet.preferences) {
      checkSweep(MOCK_BALANCES).then(setSweepResults)
    } else setSweepResults([])
  }, [wallet.isConnected, wallet.preferences, checkSweep])

  useEffect(() => {
    if (!payEnsName.trim().endsWith(".eth")) {
      setPayProfileId(null)
      return
    }
    setPayResolving(true)
    const normalized = payEnsName.trim().toLowerCase()
    if (normalized.endsWith(".cashbackid.eth")) {
      fetch(`/api/ens/resolve?name=${encodeURIComponent(normalized)}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => setPayProfileId(d?.profileId || null))
        .catch(() => setPayProfileId(null))
        .finally(() => setPayResolving(false))
    } else {
      resolvePaymentPreferences(payEnsName)
        .then((p) => setPayProfileId(p.profileId || null))
        .catch(() => setPayProfileId(null))
        .finally(() => setPayResolving(false))
    }
  }, [payEnsName])

  const handleClaimSubdomain = async () => {
    if (!wallet.address) return
    setClaimError(null)
    setClaimOnChainError(null)
    setIsClaiming(true)
    try {
      const res = await fetch("/api/ens/claim-subdomain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ suiAddress: wallet.address, preferredLabel: claimLabel.trim() || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to claim")

      if (data.registeredOnChain && data.txHash) {
        setClaimTxHash(data.txHash)
        await linkEnsName(data.ensName)
        setClaimLabel("")
        setIsClaiming(false)
        toast.success("Registered on-chain", {
          description: `${data.ensName} is registered on Ethereum.`,
          action: {
            label: "View transaction",
            onClick: () => window.open(`https://etherscan.io/tx/${data.txHash}`, "_blank"),
          },
        })
        return
      }

      if (!data.registeredOnChain) {
        setPendingOnChainLabel(data.label)
        setClaimOnChainError(data.onChainError || "Could not register on-chain.")
        for (let attempt = 0; attempt < 2; attempt++) {
          const retry = await tryRegisterOnChain(data.label)
          if (retry.txHash) {
            setClaimTxHash(retry.txHash)
            setPendingOnChainLabel(null)
            setClaimOnChainError(null)
            await linkEnsName(data.ensName)
            setClaimLabel("")
            setIsClaiming(false)
            toast.success("Registered on-chain", {
              description: `${data.ensName} is registered on Ethereum.`,
              action: {
                label: "View transaction",
                onClick: () => window.open(`https://etherscan.io/tx/${retry.txHash}`, "_blank"),
              },
            })
            return
          }
          if (retry.error) setClaimOnChainError(retry.error)
        }
        setIsClaiming(false)
        return
      }

      await linkEnsName(data.ensName)
      setClaimLabel("")
    } catch (e) {
      setClaimError(e instanceof Error ? e.message : String(e))
    } finally {
      setIsClaiming(false)
    }
  }

  const handleRetryOnChain = async () => {
    if (!pendingOnChainLabel) return
    setClaimOnChainError(null)
    setIsRetryingOnChain(true)
    try {
      const retry = await tryRegisterOnChain(pendingOnChainLabel)
      if (retry.txHash) {
        setClaimTxHash(retry.txHash)
        setPendingOnChainLabel(null)
        await linkEnsName(`${pendingOnChainLabel}.cashbackid.eth`)
        toast.success("Registered on-chain", {
          description: `${pendingOnChainLabel}.cashbackid.eth is registered on Ethereum.`,
          action: {
            label: "View transaction",
            onClick: () => window.open(`https://etherscan.io/tx/${retry.txHash}`, "_blank"),
          },
        })
      } else {
        setClaimOnChainError(retry.error || "Error registering on-chain")
      }
    } finally {
      setIsRetryingOnChain(false)
    }
  }

  const handleContinueWithoutOnChain = async () => {
    if (!pendingOnChainLabel) return
    await linkEnsName(`${pendingOnChainLabel}.cashbackid.eth`)
    setPendingOnChainLabel(null)
    setClaimOnChainError(null)
    setClaimLabel("")
  }

  const handlePay = async () => {
    if (!payProfileId || !payAmount) return
    setPayError(null)
    setPayLoading(true)
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: payProfileId,
          amount: Math.floor(parseFloat(payAmount) * 1_000_000_000),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment failed")
      setPayResult({ digest: data.digest })
    } catch (e) {
      setPayError(e instanceof Error ? e.message : String(e))
    } finally {
      setPayLoading(false)
    }
  }

  const handleRecordProof = async () => {
    if (!wallet.ensName || !wallet.address) return
    setIsRecordingProof(true)
    setProofResult(null)
    try {
      const result = await recordCashback({
        sourceChainId: 8453,
        sourceTxHash: "0x" + "a".repeat(64),
        sourceAsset: "USDC",
        cashbackAmount: "6.25",
        merchant: "Demo Store",
      })
      if (result) setProofResult({ cid: result.cid, gatewayUrl: result.gatewayUrl })
    } finally {
      setIsRecordingProof(false)
    }
  }

  const filteredActivity = MOCK_ACTIVITY.filter((tx) => {
    const matchSearch = tx.merchant.toLowerCase().includes(activitySearch.toLowerCase())
    const matchType = activityTypeFilter === "all" || tx.type === activityTypeFilter
    const matchStatus = activityStatusFilter === "all" || tx.status === activityStatusFilter
    return matchSearch && matchType && matchStatus
  })

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Merchant", "Amount", "Cashback", "Status"]
    const rows = filteredActivity.map((tx) => [tx.date, tx.type, tx.merchant, tx.amount, tx.cashback, tx.status])
    const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "activity.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleTabChange = (value: string) => {
    router.replace(value === "overview" ? "/dashboard" : `/dashboard?tab=${value}`)
  }

  if (!wallet.isConnected) return null

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 md:px-6 py-6 md:py-8">
        <div className="mb-6">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            {wallet.ensName ? (
              <>Welcome, <span className="text-primary">{wallet.ensName}</span></>
            ) : (
              "Welcome back"
            )}
          </h1>
          <p className="text-muted-foreground mt-1">Your cashback and payments in one place.</p>
        </div>

        <Tabs value={tabValue} onValueChange={handleTabChange} className="space-y-6">
          <TabsContent value="overview" className="space-y-6 mt-0">
            {(!wallet.ensName || pendingOnChainLabel) && (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Your free Cashback ID</p>
                      <p className="text-xs text-muted-foreground">
                        Get a name like <span className="font-mono text-primary">you.cashbackid.eth</span> — no payment or signing required. Registered in the app and on-chain in one step.
                      </p>
                    </div>
                  </div>

                  {!pendingOnChainLabel ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Input
                            placeholder="your-name (optional)"
                            value={claimLabel}
                            onChange={(e) => setClaimLabel(e.target.value)}
                            className="flex-1 min-w-[140px] h-9 bg-background border-border font-mono text-sm"
                          />
                          <Button size="sm" className="h-9 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground whitespace-nowrap" onClick={handleClaimSubdomain} disabled={isClaiming}>
                            {isClaiming ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating and registering on-chain...</> : <><Sparkles className="mr-2 h-4 w-4" />Get my .cashbackid.eth</>}
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground">Leave empty for a unique name</p>
                      </div>
                      {claimError && <p className="text-sm text-destructive">{claimError}</p>}
                      {claimTxHash && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          Registered on-chain.{" "}
                          <a href={`https://etherscan.io/tx/${claimTxHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            View transaction <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-foreground">
                        <span className="font-mono text-primary">{pendingOnChainLabel}.cashbackid.eth</span> is reserved in the app. Could not register on-chain.
                      </p>
                      {claimOnChainError && <p className="text-sm text-amber-600 dark:text-amber-500">{claimOnChainError}</p>}
                      <div className="flex flex-wrap items-center gap-2">
                        <Button size="sm" variant="outline" className="border-primary/30 text-primary hover:bg-primary/10" onClick={handleRetryOnChain} disabled={isRetryingOnChain}>
                          {isRetryingOnChain ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Registering...</> : <>Retry on-chain registration</>}
                        </Button>
                        <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={handleContinueWithoutOnChain}>
                          Continue without on-chain
                        </Button>
                      </div>
                      {claimTxHash && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 flex-wrap">
                          <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          <a href={`https://etherscan.io/tx/${claimTxHash}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
                            View transaction <ArrowUpRight className="h-3 w-3" />
                          </a>
                        </p>
                      )}
                    </>
                  )}

                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    Already have an ENS? <Link href="/verify" className="text-primary hover:underline">Link existing ENS</Link>
                  </p>
                </CardContent>
              </Card>
            )}

            {wallet.preferences && wallet.ensName && (
              <Card className="bg-card border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Layers className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">Payment profile</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Chain: {wallet.preferences.chainId || "—"} | Asset: {wallet.preferences.asset || "—"} | Pool: {wallet.preferences.pool || "—"}
                        </p>
                      </div>
                    </div>
                    <Link href="/verify">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 bg-transparent">Edit <ArrowUpRight className="ml-1 h-4 w-4" /></Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
              <CardContent className="p-6 md:p-8 relative">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm text-muted-foreground">Total invested</p>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsBalanceVisible(!isBalanceVisible)}>
                        {isBalanceVisible ? <Eye className="h-4 w-4 text-muted-foreground" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    {isBalanceVisible ? (
                      <p className="font-display text-4xl md:text-5xl font-bold text-foreground">${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                    ) : (
                      <p className="font-display text-4xl md:text-5xl font-bold text-foreground">•••••••</p>
                    )}
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">Active</Badge>
                </div>
                <div className="relative rounded-xl border border-primary/20 p-3 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-sm font-medium text-primary">Cashback balance (Sui)</p>
                        {isBalanceVisible ? <p className="font-display text-2xl font-bold text-primary">{cashbackBalance} SUI</p> : <p className="font-display text-2xl font-bold text-primary">••••••</p>}
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={refreshBalance} disabled={isRefreshingBalance} title="Refresh balance">
                        <RefreshCw className={cn("h-4 w-4", isRefreshingBalance && "animate-spin")} />
                      </Button>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary">+{growthPercentage}%</span>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><DollarSign className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">This month</p>
                    <p className="font-display text-xl font-bold text-foreground">{isBalanceVisible ? `+$${monthlyReturn.toFixed(2)}` : "+$••••"}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingBag className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Purchases</p>
                    <p className="font-display text-xl font-bold text-foreground">{purchases}</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Globe className="h-5 w-5 text-primary" /></div>
                  <div>
                    <p className="text-xs text-muted-foreground">Chains active</p>
                    <p className="font-display text-xl font-bold text-foreground">5</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold">Recent activity</CardTitle>
                <CardDescription>Latest cashback and bridge events</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {MOCK_ACTIVITY.slice(0, 4).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", tx.type === "growth" ? "bg-primary/10" : tx.type === "bridge" ? "bg-accent/10" : "bg-secondary")}>
                          {tx.type === "growth" ? <TrendingUp className="h-5 w-5 text-primary" /> : tx.type === "bridge" ? <ArrowRightLeft className="h-5 w-5 text-accent" /> : <ShoppingBag className="h-5 w-5 text-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                          <p className="text-xs text-muted-foreground">{tx.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.amount > 0 && <p className="text-sm text-muted-foreground">${tx.amount.toFixed(2)}</p>}
                        <p className="text-sm font-semibold text-primary">+${tx.cashback.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {wallet.ensName && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Receive payments</CardTitle>
                  <CardDescription>Share this link so others can pay to your ENS; cashback is credited to you.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    <span className="text-sm font-mono text-primary shrink-0">{wallet.ensName}</span>
                    <Button size="sm" variant="outline" className="shrink-0 border-border" onClick={() => navigator.clipboard.writeText(`${typeof window !== "undefined" ? window.location.origin : ""}/pay?to=${encodeURIComponent(wallet.ensName!)}`)}>
                      Copy payment link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {wallet.preferences && sweepResults.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Omnipin sweep</CardTitle>
                  <CardDescription>Balances on other chains ready to send to your ENS destination via LI.FI.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {sweepResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 py-2 px-3 rounded-lg bg-secondary/50 text-sm flex-wrap">
                      <span className="text-muted-foreground">Chain {r.sourceChain}: ${MOCK_BALANCES[i]?.amountUSD ?? 0}</span>
                      <div className="flex items-center gap-2">
                        <span className={r.triggered ? "text-primary font-medium" : "text-muted-foreground"}>{r.triggered ? "Ready to sweep" : r.reason}</span>
                        {r.triggered && r.route && (
                          <Button variant="outline" size="sm" className="border-border h-7 text-xs" onClick={() => setRouteDetailIndex(i)}>
                            Ver ruta
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Dialog open={routeDetailIndex !== null} onOpenChange={(open) => !open && setRouteDetailIndex(null)}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
<DialogTitle>LI.FI route</DialogTitle>
                <DialogDescription>Bridge details to your destination configured in ENS.</DialogDescription>
                </DialogHeader>
                {routeDetailIndex !== null && sweepResults[routeDetailIndex]?.route && (() => {
                  const route = sweepResults[routeDetailIndex]!.route!
                  return (
                    <div className="space-y-3 text-sm">
                      <p className="text-foreground">{route.summary}</p>
                      <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                        <span>You&apos;ll receive (approx.):</span>
                        <span className="text-foreground font-medium">{route.estimatedOutput}</span>
                        <span>Gas (approx.):</span>
                        <span className="text-foreground">${route.estimatedGasCostUSD}</span>
                        <span>Time (approx.):</span>
                        <span className="text-foreground">{Math.ceil(route.estimatedTimeSeconds / 60)} min</span>
                      </div>
                      <a href="https://li.fi" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:underline">
                        Open in LI.FI <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  )
                })()}
              </DialogContent>
            </Dialog>

            {wallet.ensName && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Proof on Filecoin</CardTitle>
                  <CardDescription>Record a cashback proof to IPFS (demo).</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {proofResult && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                      <p className="font-mono text-primary break-all">CID: {proofResult.cid}</p>
                      <a href={proofResult.gatewayUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline block truncate">{proofResult.gatewayUrl}</a>
                    </div>
                  )}
                  <Button variant="outline" size="sm" onClick={handleRecordProof} disabled={isRecordingProof} className="border-border hover:bg-secondary">
                    {isRecordingProof ? "Recording…" : "Record proof (demo)"}
                  </Button>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/rewards">
                <Button className="w-full h-auto py-4 bg-primary hover:bg-primary/90 text-primary-foreground justify-start">
                  <ArrowDownRight className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">Claim rewards</p>
                    <p className="text-xs opacity-90">Available: {cashbackBalance} SUI</p>
                  </div>
                </Button>
              </Link>
              <Link href="/verify">
                <Button variant="outline" className="w-full h-auto py-4 border-border hover:bg-card justify-start">
                  <Layers className="h-5 w-5 mr-3" />
                  <div className="text-left">
                    <p className="font-semibold">Payment profile</p>
                    <p className="text-xs text-muted-foreground">ENS & preferences</p>
                  </div>
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="pay" className="mt-0">
            <Card className="bg-card border-border max-w-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-primary" />
                  Pay to ENS
                </CardTitle>
                <CardDescription>Enter an ENS name with a cashback profile. The payment is credited as cashback to the owner.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Recipient (ENS)</label>
                  <Input placeholder="name.eth" value={payEnsName} onChange={(e) => setPayEnsName(e.target.value)} className="bg-background border-border font-mono" />
                </div>
                {payResolving && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Resolving profile…
                  </div>
                )}
                {!payResolving && payEnsName.endsWith(".eth") && (
                  <>
                    {payProfileId ? (
                      <>
                        <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                          <p className="text-muted-foreground">Profile found</p>
                          <p className="font-mono text-foreground truncate">{payProfileId}</p>
                        </div>
                        {!payResult ? (
                          <>
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-foreground">Amount (SUI)</label>
                              <Input type="number" placeholder="0.1" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-background border-border" />
                            </div>
                            {payError && <p className="text-sm text-destructive">{payError}</p>}
                            <Button onClick={handlePay} disabled={payLoading || !payAmount || parseFloat(payAmount) <= 0} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                              {payLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending…</> : <><Send className="mr-2 h-4 w-4" />Send payment</>}
                            </Button>
                          </>
                        ) : (
                          <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                            <p className="text-sm font-medium text-primary">Payment sent</p>
                            <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{payResult.digest}</p>
                            <p className="text-xs text-muted-foreground mt-2">Cashback will appear in {payEnsName}&apos;s account.</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">This ENS has no cashback profile (cashbackid.profile_id). The owner must set it in Profile.</p>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-0 space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search transactions…" value={activitySearch} onChange={(e) => setActivitySearch(e.target.value)} className="pl-10 bg-background border-border" />
              </div>
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background border-border">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="purchase">Purchases</SelectItem>
                  <SelectItem value="growth">Yield</SelectItem>
                  <SelectItem value="bridge">Bridges</SelectItem>
                </SelectContent>
              </Select>
              <Select value={activityStatusFilter} onValueChange={setActivityStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">All status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="bridging">Bridging</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExportCSV} className="border-border hover:bg-secondary shrink-0">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-lg font-bold">All activity</CardTitle>
                <CardDescription>Purchases, yield, and cross-chain bridges</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-1">
                  {filteredActivity.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", tx.type === "growth" ? "bg-primary/10" : tx.type === "bridge" ? "bg-accent/10" : "bg-secondary")}>
                          {tx.type === "growth" ? <TrendingUp className="h-5 w-5 text-primary" /> : tx.type === "bridge" ? <ArrowRightLeft className="h-5 w-5 text-accent" /> : <ShoppingBag className="h-5 w-5 text-foreground" />}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-xs text-muted-foreground">{tx.date}</p>
                            {tx.bridgeTool && <Badge variant="outline" className="text-[10px] border-border text-muted-foreground py-0">{tx.bridgeTool}</Badge>}
                            <Badge variant="secondary" className={cn("text-xs", tx.status === "completed" ? "bg-primary/10 text-primary" : tx.status === "bridging" ? "bg-accent/10 text-accent" : "bg-muted text-muted-foreground")}>
                              {tx.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                              {tx.status === "bridging" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                              {tx.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                              {tx.status}
                            </Badge>
                          </div>
                          {tx.sourceChain !== tx.destChain && (
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                              {SUPPORTED_CHAINS[tx.sourceChain]?.name || `Chain ${tx.sourceChain}`} → {SUPPORTED_CHAINS[tx.destChain]?.name || `Chain ${tx.destChain}`}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        {tx.type === "purchase" && <p className="text-sm text-muted-foreground mb-1">${tx.amount.toFixed(2)}</p>}
                        <p className={cn("text-sm font-semibold", (tx.type === "growth" || tx.type === "bridge") ? "text-primary" : "text-foreground")}>+${tx.cashback.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredActivity.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">No transactions match your filters.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
