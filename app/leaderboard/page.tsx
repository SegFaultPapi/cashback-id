"use client"

import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/lib/web3-providers"
import { mockLeaderboard } from "@/lib/mock-data"
import { Trophy, Medal, Award, Crown, Shield, Wallet, Users, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer" // Import Footer component

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
        return "bg-gradient-to-r from-chart-4/20 to-chart-4/10 border-chart-4/50"
      case 2:
        return "bg-gradient-to-r from-muted/30 to-muted/20 border-muted-foreground/30"
      case 3:
        return "bg-gradient-to-r from-chart-5/20 to-chart-5/10 border-chart-5/50"
      default:
        return "bg-card border-border"
    }
  }

  const topThree = mockLeaderboard.slice(0, 3)
  const remaining = mockLeaderboard.slice(3)

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
            See who&apos;s earning the most rewards while maintaining top privacy scores.
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-3xl mx-auto">
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold text-foreground">127,453</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="text-xl font-bold text-foreground">$1,234,567</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-chart-4/10 flex items-center justify-center">
                <Shield className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Privacy Score</p>
                <p className="text-xl font-bold text-foreground">92</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leaderboard Table */}
        <div className="max-w-3xl mx-auto">
          {topThree.map((entry, index) => (
            <div key={entry.id} className={cn("flex items-center gap-4 mb-4", getRankStyle(index + 1))}>
              <div className="flex items-center gap-2">
                {getRankIcon(index + 1)}
                <span className="text-sm font-semibold text-foreground">{entry.name}</span>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-muted-foreground">Privacy Score</p>
                <p className="text-xl font-bold text-foreground">{entry.score}</p>
              </div>
              <div className="text-sm font-semibold text-chart-4">
                {entry.rewards} Rewards
              </div>
            </div>
          ))}
          {remaining.map((entry) => (
            <div key={entry.id} className="flex items-center gap-4 mb-4 bg-card border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-muted-foreground">#{entry.rank}</span>
                <span className="text-sm font-semibold text-foreground">{entry.name}</span>
              </div>
              <div className="flex-grow">
                <p className="text-sm text-muted-foreground">Privacy Score</p>
                <p className="text-xl font-bold text-foreground">{entry.score}</p>
              </div>
              <div className="text-sm font-semibold text-chart-4">
                {entry.rewards} Rewards
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
