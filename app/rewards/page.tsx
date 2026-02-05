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
import { useWallet } from "@/lib/web3-providers"
import { Search, Filter, ShoppingBag, TrendingUp, Calendar, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Footer } from "@/components/footer" // Import Footer component

type Transaction = {
  id: string
  merchant: string
  amount: number
  cashback: number
  date: string
  type: "purchase" | "growth"
  status: "completed" | "pending"
}

// Mock data
const mockTransactions: Transaction[] = [
  {
    id: "1",
    merchant: "Target",
    amount: 87.50,
    cashback: 6.13,
    date: "2 hours ago",
    type: "purchase",
    status: "completed",
  },
  {
    id: "2",
    merchant: "Growth Earned",
    amount: 0,
    cashback: 2.87,
    date: "1 day ago",
    type: "growth",
    status: "completed",
  },
  {
    id: "3",
    merchant: "Whole Foods",
    amount: 143.22,
    cashback: 7.16,
    date: "2 days ago",
    type: "purchase",
    status: "completed",
  },
  {
    id: "4",
    merchant: "Amazon",
    amount: 234.99,
    cashback: 11.75,
    date: "3 days ago",
    type: "purchase",
    status: "completed",
  },
  {
    id: "5",
    merchant: "Starbucks",
    amount: 15.80,
    cashback: 0.95,
    date: "4 days ago",
    type: "purchase",
    status: "pending",
  },
  {
    id: "6",
    merchant: "Growth Earned",
    amount: 0,
    cashback: 3.12,
    date: "1 week ago",
    type: "growth",
    status: "completed",
  },
  {
    id: "7",
    merchant: "Best Buy",
    amount: 512.00,
    cashback: 25.60,
    date: "1 week ago",
    type: "purchase",
    status: "completed",
  },
  {
    id: "8",
    merchant: "Nike",
    amount: 189.99,
    cashback: 13.30,
    date: "2 weeks ago",
    type: "purchase",
    status: "completed",
  },
]

export default function HistoryPage() {
  const { wallet } = useWallet()
  const router = useRouter()
  const [transactions] = useState<Transaction[]>(mockTransactions)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || tx.type === typeFilter
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter
    return matchesSearch && matchesType && matchesStatus
  })

  const totalCashback = transactions
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.cashback, 0)

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
            Track all your purchases and earnings
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <ShoppingBag className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Purchases</p>
                  <p className="font-display text-xl font-bold text-foreground">
                    {transactions.filter((tx) => tx.type === "purchase").length}
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
                    Growth
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
                        tx.type === "growth" ? "bg-primary/10" : "bg-secondary"
                      )}
                    >
                      {tx.type === "growth" ? (
                        <TrendingUp className="h-5 w-5 text-primary" />
                      ) : (
                        <ShoppingBag className="h-5 w-5 text-foreground" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tx.merchant}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-muted-foreground">{tx.date}</p>
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs",
                            tx.status === "completed"
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {tx.status}
                        </Badge>
                      </div>
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
                        tx.type === "growth" ? "text-primary" : "text-foreground"
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
