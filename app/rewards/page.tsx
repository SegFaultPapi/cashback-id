"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWallet, SUPPORTED_CHAINS } from "@/lib/web3-providers"
import { useSui } from "@/lib/sui-client"
import {
  Search,
  Filter,
  ShoppingBag,
  TrendingUp,
  Calendar,
  ArrowUpRight,
  Globe,
  ArrowRightLeft,
  Loader2,
  CheckCircle2,
  Clock,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Transaction = {
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
  proofCid?: string
}

// Mock data reflecting cross-chain cashback
const mockTransactions: Transaction[] = [
  {
    id: "1",
    merchant: "Target",
    amount: 87.50,
    cashback: 6.13,
    date: "2 hours ago",
    type: "purchase",
    status: "completed",
    sourceChain: 8453,
    destChain: 101,
    bridgeTool: "LI.FI (Stargate)",
    proofCid: "bafybeig...",
  },
  {
    id: "2",
    merchant: "Yield Earned",
    amount: 0,
    cashback: 2.87,
    date: "1 day ago",
    type: "growth",
    status: "completed",
    sourceChain: 101,
    destChain: 101,
  },
  {
    id: "3",
    merchant: "Whole Foods",
    amount: 143.22,
    cashback: 7.16,
    date: "2 days ago",
    type: "purchase",
    status: "completed",
    sourceChain: 42161,
    destChain: 101,
    bridgeTool: "LI.FI (Hop)",
    proofCid: "bafybeih...",
  },
  {
    id: "4",
    merchant: "Amazon",
    amount: 234.99,
    cashback: 11.75,
    date: "3 days ago",
    type: "purchase",
    status: "completed",
    sourceChain: 1,
    destChain: 101,
    bridgeTool: "LI.FI (Across)",
    proofCid: "bafybeij...",
  },
  {
    id: "5",
    merchant: "Omnipin Sweep",
    amount: 0,
    cashback: 15.30,
    date: "4 days ago",
    type: "bridge",
    status: "completed",
    sourceChain: 42161,
    destChain: 101,
    bridgeTool: "LI.FI (Stargate)",
    proofCid: "bafybeik...",
  },
  {
    id: "6",
    merchant: "Starbucks",
    amount: 15.80,
    cashback: 0.95,
    date: "5 days ago",
    type: "purchase",
    status: "bridging",
    sourceChain: 10,
    destChain: 101,
    bridgeTool: "LI.FI (Celer)",
  },
  {
    id: "7",
    merchant: "Yield Earned",
    amount: 0,
    cashback: 3.12,
    date: "1 week ago",
    type: "growth",
    status: "completed",
    sourceChain: 101,
    destChain: 101,
  },
  {
    id: "8",
    merchant: "Best Buy",
    amount: 512.00,
    cashback: 25.60,
    date: "1 week ago",
    type: "purchase",
    status: "completed",
    sourceChain: 137,
    destChain: 101,
    bridgeTool: "LI.FI (Connext)",
    proofCid: "bafybeil...",
  },
]

export default function HistoryPage() {
  const { wallet } = useWallet()
  const sui = useSui()
  const router = useRouter()
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [isClaiming, setIsClaiming] = useState(false)
  const [cashbackBalance, setCashbackBalance] = useState("0")

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  useEffect(() => {
    if (wallet.isConnected) {
      sui.getCashbackBalance().then(setCashbackBalance)
    }
  }, [wallet.isConnected, sui])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || tx.type === typeFilter
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const totalCashback = transactions
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.cashback, 0)

  const bridgedCount = transactions.filter((tx) => tx.bridgeTool).length
  const chainsUsed = new Set(transactions.map((tx) => tx.sourceChain)).size

  const handleClaimRewards = async () => {
    const amount = cashbackBalance || "0"
    if (parseFloat(amount) <= 0) return
    setIsClaiming(true)
    try {
      await sui.claimRewards(amount)
      await sui.getCashbackBalance().then(setCashbackBalance)
    } finally {
      setIsClaiming(false)
    }
  }

  if (!wallet.isConnected) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 md:px-6 py-8 space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            History
          </h1>
          <p className="text-lg text-muted-foreground">
            Track purchases, yields, and cross-chain bridges
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total Earned</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    ${totalCashback.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ArrowRightLeft className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Cross-Chain Bridges</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {bridgedCount}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Globe className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Chains Active</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {chainsUsed}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">This Month</p>
                  <p className="font-display text-xl font-bold text-foreground">$23.45</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Claim Card */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Claimable Rewards on Sui</p>
              <p className="text-2xl font-bold text-primary">{cashbackBalance} SUI</p>
              <p className="text-xs text-muted-foreground mt-1">
                Accumulated from {bridgedCount} cross-chain transfers
              </p>
            </div>
            <Button
              onClick={handleClaimRewards}
              disabled={isClaiming || parseFloat(cashbackBalance) <= 0}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isClaiming ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                <>
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Claim on Sui
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background border-border text-foreground">
                  <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground hover:bg-secondary">
                    All Types
                  </SelectItem>
                  <SelectItem value="purchase" className="text-foreground hover:bg-secondary">
                    Purchases
                  </SelectItem>
                  <SelectItem value="growth" className="text-foreground hover:bg-secondary">
                    Yield
                  </SelectItem>
                  <SelectItem value="bridge" className="text-foreground hover:bg-secondary">
                    Bridges
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-40 bg-background border-border text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all" className="text-foreground hover:bg-secondary">
                    All Status
                  </SelectItem>
                  <SelectItem value="completed" className="text-foreground hover:bg-secondary">
                    Completed
                  </SelectItem>
                  <SelectItem value="bridging" className="text-foreground hover:bg-secondary">
                    Bridging
                  </SelectItem>
                  <SelectItem value="pending" className="text-foreground hover:bg-secondary">
                    Pending
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="font-display text-xl font-bold">All Transactions</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-1">
              {filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-4 px-4 rounded-lg hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "h-12 w-12 rounded-lg flex items-center justify-center",
                        tx.type === "growth"
                          ? "bg-primary/10"
                          : tx.type === "bridge"
                          ? "bg-accent/10"
                          : "bg-secondary"
                      )}
                    >
                      {tx.type === "growth" ? (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      ) : tx.type === "bridge" ? (
                        <ArrowRightLeft className="h-5 w-5 text-accent" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                        {tx.bridgeTool && (
                          <Badge variant="outline" className="text-[10px] border-border text-muted-foreground py-0">
                            {tx.bridgeTool}
                          </Badge>
                        )}
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            tx.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : tx.status === "bridging"
                              ? "bg-accent/10 text-accent"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {tx.status === "completed" && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {tx.status === "bridging" && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                          {tx.status === "pending" && <Clock className="h-3 w-3 mr-1" />}
                          {tx.status}
                        </Badge>
                      </div>
                      {/* Chain route */}
                      {tx.sourceChain !== tx.destChain && (
                        <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                          {SUPPORTED_CHAINS[tx.sourceChain]?.name || `Chain ${tx.sourceChain}`} →{" "}
                          {SUPPORTED_CHAINS[tx.destChain]?.name || `Chain ${tx.destChain}`}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {tx.type === "purchase" && (
                      <p className="text-sm text-muted-foreground mb-1">
                        ${tx.amount.toFixed(2)}
                      </p>
                    )}
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        tx.type === "growth" || tx.type === "bridge"
                          ? "text-primary"
                          : "text-foreground"
                      )}
                    >
                      +${tx.cashback.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {filteredTransactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Export Button */}
        <div className="flex justify-center">
          <Button variant="outline" className="border-border hover:bg-card bg-transparent">
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Export to CSV
          </Button>
        </div>
      </main>
    </div>
  )
}
