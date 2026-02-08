"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { useWallet } from "@/lib/web3-providers"
import { mockTransactions } from "@/lib/mock-data"
import {
  Download,
  CheckCircle2,
  Clock,
  ExternalLink,
  Share2,
  Copy,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Transaction = (typeof mockTransactions)[0]

export default function TransactionsPage() {
  const { wallet } = useWallet()
  const router = useRouter()
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)
  const [copied, setCopied] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  const filteredTransactions = mockTransactions.filter((tx) => {
    const matchesType = typeFilter === "all" || tx.type === typeFilter
    const matchesStatus = statusFilter === "all" || tx.status === statusFilter
    return matchesType && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleCopyProof = (hash: string) => {
    navigator.clipboard.writeText(hash)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleExportCSV = () => {
    const headers = ["Date", "Type", "Merchant", "Amount", "Cashback", "Status", "Proof Hash"]
    const rows = mockTransactions.map((tx) => [
      tx.date,
      tx.type,
      tx.merchant,
      tx.amount,
      tx.cashback,
      tx.status,
      tx.proofHash,
    ])

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "transactions.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!wallet.isConnected) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Transactions</h1>
            <p className="text-muted-foreground mt-1">View your cashback and reward history.</p>
          </div>
          <Button
            variant="outline"
            onClick={handleExportCSV}
            className="border-border hover:bg-secondary bg-transparent"
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border text-foreground">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all" className="text-foreground hover:bg-secondary">
                All Types
              </SelectItem>
              <SelectItem value="cashback" className="text-foreground hover:bg-secondary">
                Cashback
              </SelectItem>
              <SelectItem value="reward" className="text-foreground hover:bg-secondary">
                Reward
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 bg-card border-border text-foreground">
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

        {/* Transactions Table */}
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground">Date</TableHead>
                    <TableHead className="text-muted-foreground">Type</TableHead>
                    <TableHead className="text-muted-foreground">Merchant</TableHead>
                    <TableHead className="text-muted-foreground text-right">Amount</TableHead>
                    <TableHead className="text-muted-foreground text-right">Cashback</TableHead>
                    <TableHead className="text-muted-foreground">Status</TableHead>
                    <TableHead className="text-muted-foreground">Proof</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedTransactions.map((tx) => (
                    <TableRow
                      key={tx.id}
                      className="border-border cursor-pointer hover:bg-secondary/50"
                      onClick={() => setSelectedTx(tx)}
                    >
                      <TableCell className="text-foreground">{tx.date}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={cn(
                            "capitalize",
                            tx.type === "cashback"
                              ? "border-accent text-accent"
                              : "border-primary text-primary"
                          )}
                        >
                          {tx.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-foreground font-medium">{tx.merchant}</TableCell>
                      <TableCell className="text-foreground text-right">
                        ${tx.amount.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-success text-right font-medium">
                        +${tx.cashback.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={cn(
                            tx.status === "completed"
                              ? "bg-success/10 text-success hover:bg-success/20"
                              : "bg-chart-4/10 text-chart-4 hover:bg-chart-4/20"
                          )}
                        >
                          {tx.status === "completed" ? (
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                          ) : (
                            <Clock className="mr-1 h-3 w-3" />
                          )}
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="border-border text-muted-foreground font-mono text-xs"
                        >
                          <Lock className="mr-1 h-3 w-3" />
                          {tx.proofHash.slice(0, 8)}...
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} of{" "}
                  {filteredTransactions.length} transactions
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-border hover:bg-secondary"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-foreground">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-border hover:bg-secondary"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No transactions found matching your criteria.</p>
          </div>
        )}
      </main>

      {/* Transaction Details Sheet */}
      <Sheet open={!!selectedTx} onOpenChange={() => setSelectedTx(null)}>
        <SheetContent className="w-full sm:max-w-md bg-card border-border overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-foreground">Transaction Details</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              View complete transaction information and ZK-proof verification.
            </SheetDescription>
          </SheetHeader>

          {selectedTx && (
            <div className="mt-6 space-y-6">
              {/* Merchant Info */}
              <div className="flex items-center gap-4 p-4 bg-secondary/50 rounded-lg">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl font-bold text-foreground">
                  {selectedTx.merchant[0]}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{selectedTx.merchant}</h3>
                  <p className="text-sm text-muted-foreground">{selectedTx.date}</p>
                </div>
              </div>

              {/* Transaction Details */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground">Transaction Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge
                      variant="outline"
                      className={cn(
                        "capitalize",
                        selectedTx.type === "cashback"
                          ? "border-accent text-accent"
                          : "border-primary text-primary"
                      )}
                    >
                      {selectedTx.type}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Purchase Amount</span>
                    <span className="text-foreground font-medium">
                      ${selectedTx.amount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cashback Earned</span>
                    <span className="text-success font-medium">
                      +${selectedTx.cashback.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    <Badge
                      className={cn(
                        selectedTx.status === "completed"
                          ? "bg-success/10 text-success"
                          : "bg-chart-4/10 text-chart-4"
                      )}
                    >
                      {selectedTx.status === "completed" ? (
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                      ) : (
                        <Clock className="mr-1 h-3 w-3" />
                      )}
                      {selectedTx.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* ZK-Proof */}
              <Card className="bg-secondary/30 border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    ZK-Proof Verification
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-background rounded-lg p-3 mb-3">
                    <p className="text-xs text-muted-foreground mb-1">Proof Hash</p>
                    <p className="text-xs font-mono text-foreground break-all">
                      {selectedTx.proofHash}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyProof(selectedTx.proofHash)}
                      className="flex-1 border-border hover:bg-secondary"
                    >
                      <Copy className="mr-2 h-3 w-3" />
                      {copied ? "Copied!" : "Copy"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        window.open(`https://etherscan.io/tx/${selectedTx.proofHash}`, "_blank")
                      }
                      className="flex-1 border-border hover:bg-secondary"
                    >
                      <ExternalLink className="mr-2 h-3 w-3" />
                      Explorer
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Share */}
              <Button variant="outline" className="w-full border-border hover:bg-secondary bg-transparent">
                <Share2 className="mr-2 h-4 w-4" />
                Share Transaction
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}
