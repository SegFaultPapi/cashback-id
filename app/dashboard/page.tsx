"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { useWallet } from "@/lib/web3-providers"
import { useSui } from "@/lib/sui-client"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { GlowingEffect } from "@/components/ui/glowing-effect"
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
  Link2,
  Layers,
} from "lucide-react"
import Link from "next/link"
import { Footer } from "@/components/footer"

export default function DashboardPage() {
  const { wallet, linkEnsName } = useWallet()
  const sui = useSui()
  const router = useRouter()
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [cashbackBalance, setCashbackBalance] = useState("0")

  // Mock data - in production these come from Sui contract + LI.FI
  const totalInvested = 2847.50
  const growthGenerated = 234.18
  const growthPercentage = 8.23
  const monthlyReturn = 23.45
  const purchases = 47

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  // Fetch cashback balance from Sui
  useEffect(() => {
    if (wallet.isConnected) {
      sui.getCashbackBalance().then(setCashbackBalance)
    }
  }, [wallet.isConnected, sui])

  if (!wallet.isConnected) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 md:px-6 py-8 space-y-8 animate-fade-in-up">
        {/* Welcome Section */}
        <div className="space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            {wallet.ensName ? (
              <>Welcome, <span className="text-primary">{wallet.ensName}</span></>
            ) : (
              "Welcome back"
            )}
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's how your money is working for you
          </p>
        </div>

        {/* ENS Status Banner */}
        {!wallet.ensName && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium text-foreground">Link your ENS name</p>
                  <p className="text-xs text-muted-foreground">
                    Configure where and how you receive cashback via Custom Text Records
                  </p>
                </div>
              </div>
              <Link href="/verify">
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Link2 className="mr-2 h-4 w-4" />
                  Configure
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* ENS Preferences Summary */}
        {wallet.preferences && wallet.ensName && (
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Layers className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Profile</p>
                    <p className="text-xs text-muted-foreground font-mono">
                      Chain: {wallet.preferences.chainId || "—"} | 
                      Asset: {wallet.preferences.asset || "—"} | 
                      Pool: {wallet.preferences.pool || "—"}
                    </p>
                  </div>
                </div>
                <Link href="/verify">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 bg-transparent">
                    Edit
                    <ArrowUpRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Balance Card */}
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
          
          <CardContent className="p-6 md:p-8 relative">
            <div className="flex items-start justify-between mb-8">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm text-muted-foreground">Total Invested</p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 bg-transparent"
                    onClick={() => setIsBalanceVisible(!isBalanceVisible)}
                  >
                    {isBalanceVisible ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {isBalanceVisible ? (
                  <p className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </p>
                ) : (
                  <p className="font-display text-4xl md:text-5xl font-bold text-foreground">
                    •••••••
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active
                </Badge>
                {wallet.provider && (
                  <Badge variant="outline" className="border-border text-muted-foreground text-xs">
                    zkLogin ({wallet.provider})
                  </Badge>
                )}
              </div>
            </div>

            {/* Growth Card - The glowing element */}
            <div className="relative rounded-[1.25rem] border-[0.75px] border-primary/20 p-2 md:rounded-[1.5rem] md:p-3">
              <GlowingEffect
                spread={40}
                glow={true}
                disabled={false}
                proximity={64}
                inactiveZone={0.01}
                borderWidth={3}
                variant="emerald"
              />
              <div className="relative overflow-hidden rounded-xl border-[0.75px] bg-primary/5 border-primary/20 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(16,185,129,0.15)]">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 animate-pulse" />
                <CardContent className="p-6 relative">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <p className="text-sm font-medium text-primary">Cashback Balance (Sui)</p>
                      </div>
                      {isBalanceVisible ? (
                        <p className="font-display text-3xl font-bold text-primary">
                          {cashbackBalance} SUI
                        </p>
                      ) : (
                        <p className="font-display text-3xl font-bold text-primary">
                          •••••• SUI
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-primary mb-1">
                        <ArrowUpRight className="h-4 w-4" />
                        <span className="text-xl font-bold">+{growthPercentage}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">All time</p>
                    </div>
                  </div>
                </CardContent>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
          <div className="relative rounded-[1rem] border-[0.75px] border-border p-2">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
              variant="emerald"
            />
            <div className="relative overflow-hidden rounded-lg border-[0.75px] bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">This Month</p>
                    {isBalanceVisible ? (
                      <p className="font-display text-xl font-bold text-foreground">
                        +${monthlyReturn.toFixed(2)}
                      </p>
                    ) : (
                      <p className="font-display text-xl font-bold text-foreground">+$••••</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          <div className="relative rounded-[1rem] border-[0.75px] border-border p-2">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
              variant="emerald"
            />
            <div className="relative overflow-hidden rounded-lg border-[0.75px] bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Total Purchases</p>
                    <p className="font-display text-xl font-bold text-foreground">{purchases}</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>

          <div className="relative rounded-[1rem] border-[0.75px] border-border p-2">
            <GlowingEffect
              spread={40}
              glow={true}
              disabled={false}
              proximity={64}
              inactiveZone={0.01}
              borderWidth={2}
              variant="emerald"
            />
            <div className="relative overflow-hidden rounded-lg border-[0.75px] bg-card shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Chains Active</p>
                    <p className="font-display text-xl font-bold text-foreground">5</p>
                  </div>
                </div>
              </CardContent>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="font-display text-xl font-bold">Recent Activity</CardTitle>
              <Link href="/rewards">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary/90 bg-transparent">
                  View all
                  <ArrowUpRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Target</p>
                    <p className="text-xs text-muted-foreground">Purchase on Base &bull; Bridged via LI.FI</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">$87.50</p>
                  <p className="text-xs text-primary">+$6.13 cashback</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Yield Earned</p>
                    <p className="text-xs text-muted-foreground">Sui Pool &bull; Auto-invested</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-primary">+$2.87</p>
                  <p className="text-xs text-muted-foreground">+0.12%</p>
                </div>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Omnipin Sweep</p>
                    <p className="text-xs text-muted-foreground">Arbitrum → Sui &bull; $15.30 USDC</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">Completed</p>
                  <p className="text-xs text-muted-foreground">2 min ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="h-auto py-4 bg-primary hover:bg-primary/90 text-primary-foreground justify-start">
                <div className="flex items-center gap-3">
                  <ArrowDownRight className="h-5 w-5" />
                  <div className="text-left">
                    <p className="font-semibold">Claim Rewards</p>
                    <p className="text-xs opacity-90">Available: {cashbackBalance} SUI</p>
                  </div>
                </div>
              </Button>
              <Link href="/verify" className="block">
                <Button variant="outline" className="w-full h-auto py-4 border-border hover:bg-card bg-transparent justify-start">
                  <div className="flex items-center gap-3">
                    <Layers className="h-5 w-5" />
                    <div className="text-left">
                      <p className="font-semibold">Configure Payment Profile</p>
                      <p className="text-xs text-muted-foreground">ENS Text Records & preferences</p>
                    </div>
                  </div>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  )
}
