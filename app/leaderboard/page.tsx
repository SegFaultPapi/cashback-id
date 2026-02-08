"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet, SUPPORTED_CHAINS } from "@/lib/web3-providers"
import { mockLeaderboard, stats } from "@/lib/mock-data"
import { Trophy, Medal, Award, Crown, Shield, Users, TrendingUp, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LeaderboardPage() {
  const { wallet } = useWallet()

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-5 w-5 text-chart-4" />
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />
      case 3:
        return <Award className="h-5 w-5 text-chart-5" />
      default:
        return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-chart-4/10 to-transparent border-chart-4/30"
      case 2:
        return "bg-gradient-to-r from-muted/20 to-transparent border-muted-foreground/20"
      case 3:
        return "bg-gradient-to-r from-chart-5/10 to-transparent border-chart-5/30"
      default:
        return "bg-card border-border"
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border text-sm mb-4">
            <Trophy className="h-4 w-4 text-chart-4" />
            <span className="text-muted-foreground">Top Earners</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Leaderboard</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            See who&apos;s earning the most cross-chain cashback via ENS + LI.FI + Sui.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8 max-w-4xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Users</p>
                <p className="text-xl font-bold text-foreground">{stats.activeUsers}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-xl font-bold text-foreground">${stats.totalRewardsDistributed}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Globe className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bridges</p>
                <p className="text-xl font-bold text-foreground">{stats.totalBridges}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Chains</p>
                <p className="text-xl font-bold text-foreground">{stats.chainsSupported}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard */}
        <div className="max-w-3xl mx-auto space-y-3">
          {mockLeaderboard.map((entry) => (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-4 p-4 rounded-xl border transition-colors hover:bg-secondary/30",
                getRankStyle(entry.rank)
              )}
            >
              <div className="h-10 w-10 rounded-full flex items-center justify-center">
                {getRankIcon(entry.rank)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {entry.ensName ? (
                    <span className="text-sm font-semibold text-primary font-mono">
                      {entry.ensName}
                    </span>
                  ) : (
                    <span className="text-sm font-semibold text-foreground font-mono">
                      {entry.address}
                    </span>
                  )}
                  {entry.ensName && (
                    <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                      ENS
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted-foreground">
                    Privacy: {entry.privacyScore}
                  </span>
                  {entry.chainsUsed && (
                    <span className="text-xs text-muted-foreground">
                      {entry.chainsUsed} chains
                    </span>
                  )}
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-bold text-primary">
                  ${entry.rewards.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground">earned</p>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
