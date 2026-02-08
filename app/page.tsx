"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useWallet } from "@/lib/web3-providers"
import { Footer } from "@/components/footer"
import { ShaderAnimation } from "@/components/ui/shader-animation"
import { GlowingEffect } from "@/components/ui/glowing-effect"
import { CashbackCard } from "@/components/ui/cashback-card"
import { DotWorldMap } from "@/components/ui/dot-world-map"
import { LandingNavbar } from "@/components/landing-navbar"
import { cn } from "@/lib/utils"
import {
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  Sparkles,
  Apple,
  Chrome,
  ShoppingBag,
  LineChart,
  Shield,
  CreditCard,
  Zap,
  Lock,
  Globe,
  Layers,
  Menu,
  X,
  CheckCircle2,
  Users,
  Quote,
} from "lucide-react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const { wallet, connect, isConnecting } = useWallet()
  const router = useRouter()
  const [heroOpacity, setHeroOpacity] = useState(1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (wallet.isConnected) {
      router.push("/dashboard")
    }
  }, [wallet.isConnected, router])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const fadeStart = 100
      const fadeEnd = 500
      
      if (scrollY <= fadeStart) {
        setHeroOpacity(1)
      } else if (scrollY >= fadeEnd) {
        setHeroOpacity(0)
      } else {
        const opacity = 1 - (scrollY - fadeStart) / (fadeEnd - fadeStart)
        setHeroOpacity(opacity)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background overflow-x-hidden">
      {/* Floating Navbar */}
      <LandingNavbar />

      <main className="flex-1 w-full">
        {/* Hero Section */}
        <section 
          className="relative overflow-hidden min-h-[90vh] flex flex-col transition-opacity duration-300"
          style={{ opacity: heroOpacity }}
        >
          {/* Shader Animation Background */}
          <div className="absolute inset-0 opacity-70">
            <ShaderAnimation />
          </div>
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background pointer-events-none" />
          
          {/* Hero Header with Logo and CTA */}
          <div className="w-full relative z-50 pt-6">
            <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
              <div className="flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg shadow-primary/20">
                    <DollarSign className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="font-display text-xl font-bold text-foreground">
                    Cashback ID
                  </span>
                </Link>

                {/* Desktop CTA */}
                <Button
                  onClick={() => connect("google")}
                  disabled={isConnecting}
                  className="hidden sm:flex px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
                >
                  Get Started
                </Button>

                {/* Mobile menu toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="sm:hidden p-2 rounded-lg text-foreground hover:bg-card/50 transition-colors"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>

              {/* Mobile dropdown menu */}
              {mobileMenuOpen && (
                <div className="sm:hidden mt-4 p-4 rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-xl space-y-2 animate-fade-in-up">
                  <a href="#howitworks" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                    How It Works
                  </a>
                  <a href="#architecture" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                    Architecture
                  </a>
                  <a href="#cta" onClick={() => setMobileMenuOpen(false)} className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 rounded-lg transition-colors">
                    Get Started
                  </a>
                  <div className="pt-2 border-t border-border/50">
                    <Button
                      onClick={() => { connect("google"); setMobileMenuOpen(false) }}
                      disabled={isConnecting}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-sm rounded-lg"
                    >
                      Sign In with Google
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex items-center w-full max-w-7xl mx-auto relative px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8 py-20">
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
                <span className="text-foreground">Your name, your rules, </span>
                <span className="text-primary">your cashback</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                Shop anywhere, earn cashback automatically. Set your preferences once 
                and your rewards flow to you — invested and growing.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Button
                  size="lg"
                  onClick={() => connect("apple")}
                  disabled={isConnecting}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 px-10 text-base"
                >
                  <Apple className="mr-2 h-5 w-5" />
                  Continue with Apple
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => connect("google")}
                  disabled={isConnecting}
                  className="w-full sm:w-auto border-border hover:bg-card h-14 px-10 bg-transparent text-base"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                One-tap signup. No complicated setup, no passwords to remember.
              </p>
            </div>
          </div>
        </section>

        {/* Card Showcase Section */}
        <section className="py-32 relative overflow-hidden w-full">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-5xl mx-auto">
              {/* Card Display */}
              <div className="mb-16 max-w-lg mx-auto">
                <CashbackCard 
                  cardHolder="vitalik.eth"
                  cardNumber="4532 1234 5678 9010"
                  expiryDate="12/28"
                />
              </div>

              {/* Description */}
              <div className="text-center space-y-6 max-w-3xl mx-auto">
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                  Your Username is Your Cashback Profile
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  No long account numbers. Just your unique name. Set how you want to get paid, 
                  which currency you prefer, and where to auto-invest your earnings — 
                  everything routes to you automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works - Interactive Map Section */}
        <section id="howitworks" className="py-32 w-full relative scroll-mt-8">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-sm font-medium text-primary mb-3 uppercase tracking-widest">How it works</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                From purchase to payout in 5 steps
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Your cashback flows automatically, guided by your preferences.
              </p>
            </div>

            {/* Interactive Map */}
            <div className="relative w-full aspect-[2/1] max-w-5xl mx-auto mb-12">
              {/* Dot World Map */}
              <DotWorldMap className="w-full h-full text-muted-foreground" />

              {/* Card 1: Top-left (N. America) — Purchase */}
              <div className="absolute top-[8%] left-[2%] md:left-[5%] animate-float z-20">
                <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl p-2.5 md:p-3 shadow-2xl min-w-[160px] md:min-w-[220px]">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] md:text-[11px] font-medium text-foreground">Incoming</span>
                    <span className="text-[9px] md:text-[10px] text-muted-foreground ml-auto">Amount</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-muted flex items-center justify-center text-[8px] md:text-[9px] font-bold text-muted-foreground">V</div>
                    <span className="text-[10px] md:text-[11px] text-muted-foreground">@vitalik</span>
                    <span className="text-[10px] md:text-[11px] font-semibold text-foreground ml-auto">$1,200 USDC</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Top-right (Europe) — ENS Read */}
              <div className="absolute top-[4%] right-[2%] md:right-[12%] animate-float z-20" style={{ animationDelay: '1.2s' }}>
                <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl p-2.5 md:p-3 shadow-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Shield className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                    <span className="text-[10px] md:text-[11px] font-medium text-foreground">Profile Loaded</span>
                  </div>
                  <div className="space-y-0.5 text-[9px] md:text-[10px] text-muted-foreground">
                    <div>Payout → <span className="text-primary">USD Coin</span></div>
                    <div>Auto-invest → <span className="text-primary">Savings Pool</span></div>
                  </div>
                </div>
              </div>

              {/* Card 3: Center — Progress / Bridge */}
              <div className="absolute top-[38%] left-[20%] md:left-[30%] animate-float z-20" style={{ animationDelay: '2.4s' }}>
                <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl p-2.5 md:p-3 shadow-2xl min-w-[170px] md:min-w-[210px]">
                  <p className="text-[10px] md:text-[11px] font-medium text-foreground mb-1.5">Cashback in progress</p>
                  <div className="flex items-center gap-0.5 mb-1.5">
                    <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-primary/20 border border-primary/40 text-[7px] md:text-[8px] flex items-center justify-center text-primary font-bold">A</div>
                    <div className="w-4 h-4 md:w-5 md:h-5 -ml-1 rounded-full bg-primary/20 border border-primary/40 text-[7px] md:text-[8px] flex items-center justify-center text-primary font-bold">B</div>
                    <div className="w-4 h-4 md:w-5 md:h-5 -ml-1 rounded-full bg-primary/20 border border-primary/40 text-[7px] md:text-[8px] flex items-center justify-center text-primary font-bold">C</div>
                  </div>
                  <div className="flex items-center justify-between text-[9px] md:text-[10px] mb-1">
                    <span className="text-foreground font-medium">$120/$300 earned</span>
                    <span className="text-primary">15 days active</span>
                  </div>
                  <div className="h-1 rounded-full bg-muted overflow-hidden">
                    <div className="h-full w-[40%] rounded-full bg-primary" />
                  </div>
                </div>
              </div>

              {/* Card 4: Bottom-left — Filecoin Proof */}
              <div className="absolute bottom-[18%] left-[3%] md:left-[8%] animate-float z-20 hidden md:block" style={{ animationDelay: '3.6s' }}>
                <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl p-3 shadow-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-medium text-foreground">Receipt Saved</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Verified & stored securely</p>
                  <p className="text-[10px] text-primary">Permanent record ✓</p>
                </div>
              </div>

              {/* Card 5: Bottom-right (Asia/Pacific) — Sui Settlement */}
              <div className="absolute bottom-[10%] right-[2%] md:right-[6%] animate-float z-20" style={{ animationDelay: '4.5s' }}>
                <div className="bg-card/90 backdrop-blur-xl border border-border/60 rounded-xl p-2.5 md:p-3 shadow-2xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Zap className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary" />
                    <span className="text-[10px] md:text-[11px] font-medium text-foreground">Auto-Invested on Sui</span>
                  </div>
                  <p className="text-[9px] md:text-[10px] text-muted-foreground">$1,200 → Navi USDC Pool</p>
                  <p className="text-[9px] md:text-[10px] text-primary font-medium">APY 4.8% ✓</p>
                </div>
              </div>

              {/* Green accent nodes */}
              <div className="absolute top-[30%] left-[18%] w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-float z-10 hidden md:flex" style={{ animationDelay: '0.5s' }}>
                <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="absolute top-[18%] right-[30%] w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-float z-10 hidden md:flex" style={{ animationDelay: '2.5s' }}>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="absolute bottom-[30%] right-[24%] w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-float z-10 hidden md:flex" style={{ animationDelay: '4s' }}>
                <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-primary animate-pulse" />
              </div>
              <div className="absolute top-[55%] left-[48%] w-6 h-6 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center animate-float z-10 hidden md:flex" style={{ animationDelay: '1.8s' }}>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            </div>

            {/* Step flow below map */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-4xl mx-auto">
              {[
                { step: "01", title: "Shop", tag: "Any EVM" },
                { step: "02", title: "ENS Read", tag: "ENS" },
                { step: "03", title: "Bridge", tag: "LI.FI" },
                { step: "04", title: "Proof", tag: "Filecoin" },
                { step: "05", title: "Settle", tag: "Sui" },
              ].map((item, i) => (
                <div key={item.step} className="flex items-center gap-2 md:gap-3">
                  <div className="flex items-center gap-1.5 md:gap-2 px-2.5 md:px-3 py-1.5 rounded-full bg-card/50 border border-border/60">
                    <span className="text-[9px] md:text-[10px] font-mono font-bold text-primary">{item.step}</span>
                    <span className="text-[10px] md:text-xs font-medium text-foreground">{item.title}</span>
                    <span className="px-1.5 py-0.5 text-[8px] md:text-[9px] font-mono rounded-full bg-primary/10 text-primary">{item.tag}</span>
                  </div>
                  {i < 4 && <ArrowUpRight className="w-3 h-3 text-muted-foreground/50 hidden md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 w-full border-y border-border/50">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
              <div>
                <p className="font-display text-4xl md:text-5xl font-bold text-primary">$2.8M+</p>
                <p className="text-sm text-muted-foreground mt-2">Cashback Distributed</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-bold text-foreground">127K+</p>
                <p className="text-sm text-muted-foreground mt-2">Active Users</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-bold text-foreground">6</p>
                <p className="text-sm text-muted-foreground mt-2">Chains Supported</p>
              </div>
              <div>
                <p className="font-display text-4xl md:text-5xl font-bold text-primary">&lt;2s</p>
                <p className="text-sm text-muted-foreground mt-2">Sui Settlement</p>
              </div>
            </div>
          </div>
        </section>

        {/* Architecture / Protocol Cards Section */}
        <section id="architecture" className="py-32 w-full scroll-mt-8">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <p className="text-sm font-medium text-primary mb-3 uppercase tracking-widest">Architecture</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Five protocols, one experience
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Each piece of the stack has a critical role in making cross-chain cashback seamless.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-4 max-w-6xl mx-auto">
              {/* Card 1 - ENS */}
              <li className="list-none min-h-[14rem] md:[grid-area:1/1/2/5]">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="emerald"
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                        <Shield className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          ENS Identity
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Your <span className="text-primary font-mono">.eth</span> name stores chain, asset, 
                          and pool preferences in Custom Text Records.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Card 2 - LI.FI */}
              <li className="list-none min-h-[14rem] md:[grid-area:1/5/2/9]">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="emerald"
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                        <Globe className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          LI.FI Routing
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Cross-chain execution reads your ENS records and bridges cashback 
                          to your preferred destination automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Card 3 - Sui */}
              <li className="list-none min-h-[14rem] md:[grid-area:1/9/2/13]">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="emerald"
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                        <Zap className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          Sui Settlement
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Sub-second finality with zkLogin. Sign in with Google or Apple — 
                          no seed phrases, no gas confusion.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Card 4 - Full width bottom */}
              <li className="list-none min-h-[14rem] md:[grid-area:2/1/3/7]">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="emerald"
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                        <Lock className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          Filecoin Proof Layer
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Every cashback event is recorded on IPFS and persisted via Filecoin 
                          for immutable audit. Your ENS Content Hash points to the full history.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Card 5 - Safe */}
              <li className="list-none min-h-[14rem] md:[grid-area:2/7/3/13]">
                <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
                  <GlowingEffect
                    spread={40}
                    glow={true}
                    disabled={false}
                    proximity={64}
                    inactiveZone={0.01}
                    borderWidth={3}
                    variant="emerald"
                  />
                  <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)]">
                    <div className="relative flex flex-1 flex-col justify-between gap-3">
                      <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2">
                        <Layers className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          Safe Multi-Sig Control
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Update your ENS payment preferences through Safe for institutional-grade 
                          security. Two-step confirmation keeps your profile protected.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            {/* CTA */}
            <div className="text-center pt-16">
              <Button
                size="lg"
                onClick={() => connect("google")}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 px-10 text-base"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Start Earning
              </Button>
            </div>
          </div>
        </section>

        {/* Why Choose Section */}
        <section className="py-32 w-full relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/[0.02] to-background pointer-events-none" />
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6 relative">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <p className="text-sm font-medium text-primary mb-3 uppercase tracking-widest">Why Cashback ID</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Why Users Choose Cashback ID
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Cashback ID combines identity, cross-chain routing, and transparency 
                — giving you control over how and where you earn.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-center">
              {/* Left: Connected nodes visual */}
              <div className="flex items-center justify-center py-12">
                <div className="relative w-72 h-72">
                  {/* Central node */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-primary/20 border-2 border-primary/50 flex items-center justify-center z-10 shadow-lg shadow-primary/20">
                    <CheckCircle2 className="h-7 w-7 text-primary" />
                  </div>
                  
                  {/* Connecting lines */}
                  <svg className="absolute inset-0 w-full h-full" viewBox="0 0 288 288">
                    <line x1="144" y1="144" x2="72" y2="52" stroke="currentColor" className="text-primary/30 animate-pulse-glow" strokeWidth="1" />
                    <line x1="144" y1="144" x2="216" y2="52" stroke="currentColor" className="text-primary/30 animate-pulse-glow" strokeWidth="1" style={{ animationDelay: '0.5s' }} />
                    <line x1="144" y1="144" x2="52" y2="180" stroke="currentColor" className="text-primary/30 animate-pulse-glow" strokeWidth="1" style={{ animationDelay: '1s' }} />
                    <line x1="144" y1="144" x2="236" y2="180" stroke="currentColor" className="text-primary/30 animate-pulse-glow" strokeWidth="1" style={{ animationDelay: '1.5s' }} />
                    <line x1="144" y1="144" x2="144" y2="260" stroke="currentColor" className="text-primary/30 animate-pulse-glow" strokeWidth="1" style={{ animationDelay: '2s' }} />
                  </svg>

                  {/* Orbiting nodes */}
                  {[
                    { top: '8%', left: '18%', label: 'ENS' },
                    { top: '8%', left: '68%', label: 'LI.FI' },
                    { top: '55%', left: '5%', label: 'FIL' },
                    { top: '55%', left: '78%', label: 'Safe' },
                    { top: '83%', left: '42%', label: 'Sui' },
                  ].map((node, i) => (
                    <div
                      key={node.label}
                      className="absolute w-12 h-12 rounded-full bg-card border border-border/80 flex items-center justify-center text-[10px] font-mono font-bold text-muted-foreground hover:text-primary hover:border-primary/40 transition-colors duration-300 shadow-md"
                      style={{ top: node.top, left: node.left }}
                    >
                      {node.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Feature card */}
              <div className="rounded-2xl border border-border/80 bg-card/50 backdrop-blur-sm p-8 space-y-5 shadow-lg">
                <div className="w-fit rounded-lg border border-border bg-muted p-2.5">
                  <Users className="h-5 w-5 text-foreground" />
                </div>
                <h3 className="font-display text-2xl font-semibold text-foreground">
                  Name-Based Routing
                </h3>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Every cashback is routed by reading your <span className="text-primary font-mono">.eth</span> Custom Text Records. 
                  You define the destination chain, asset, and yield pool — and LI.FI executes it automatically.
                </p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  This ensures you always receive rewards exactly how you want, without manual bridging 
                  or complicated multi-step processes. Your name is your financial identity.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Backed By Protocols Section */}
        <section className="py-20 w-full border-y border-border/50">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
                Backed By Leading Protocols
              </h2>
              <p className="text-sm text-muted-foreground">
                Follow us on <a href="https://x.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">X</a> and <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-foreground underline underline-offset-4 hover:text-primary transition-colors">LinkedIn</a> to join the conversation
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 max-w-4xl mx-auto">
              {[
                { name: 'ENS', icon: Shield },
                { name: 'LI.FI', icon: Globe },
                { name: 'Sui Network', icon: Zap },
                { name: 'Filecoin', icon: Lock },
                { name: 'Safe', icon: Layers },
              ].map((protocol) => (
                <div
                  key={protocol.name}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-full border border-border/80 bg-card/30 hover:bg-card/60 hover:border-primary/30 transition-all duration-300"
                >
                  <protocol.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-foreground whitespace-nowrap">{protocol.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-32 w-full overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-16 max-w-3xl mx-auto">
              <p className="text-sm font-medium text-primary mb-3 uppercase tracking-widest">Community</p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground">
                Trusted by the Community
              </h2>
            </div>

            {/* Masonry marquee grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto h-[600px] overflow-hidden relative">
              {/* Fade overlays */}
              <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />

              {/* Column 1 - scrolls up */}
              <div className="overflow-hidden">
                <div className="animate-marquee-up space-y-4">
                  {[
                    { name: "David Chen", handle: "@dchen", text: "Cashback ID gave our team the confidence to go multi-chain. The ENS routing kept us accountable every step of the way." },
                    { name: "Sarah Johnson", handle: "@sarahj", text: "The milestone-based escrow changed everything. Backers trusted us because they knew funds would only unlock on real progress." },
                    { name: "Alex Rivera", handle: "@alexr", text: "It feels like the future of cross-chain finance. Simple, transparent, and incredibly fast on Sui." },
                    { name: "Emma Liu", handle: "@emmaliu", text: "Finally a cashback system that respects my preferences. I set my .eth records once and everything just works." },
                    // Duplicate for seamless loop
                    { name: "David Chen", handle: "@dchen", text: "Cashback ID gave our team the confidence to go multi-chain. The ENS routing kept us accountable every step of the way." },
                    { name: "Sarah Johnson", handle: "@sarahj", text: "The milestone-based escrow changed everything. Backers trusted us because they knew funds would only unlock on real progress." },
                    { name: "Alex Rivera", handle: "@alexr", text: "It feels like the future of cross-chain finance. Simple, transparent, and incredibly fast on Sui." },
                    { name: "Emma Liu", handle: "@emmaliu", text: "Finally a cashback system that respects my preferences. I set my .eth records once and everything just works." },
                  ].map((t, i) => (
                    <div key={i} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 space-y-3 hover:border-primary/30 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.handle}</p>
                        </div>
                        <Quote className="h-4 w-4 text-primary/40 ml-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2 - scrolls down */}
              <div className="overflow-hidden hidden md:block">
                <div className="animate-marquee-down space-y-4">
                  {[
                    { name: "Maria Garcia", handle: "@mariag", text: "Raising funds on Cashback ID was simple, transparent, and faster than I imagined. The Filecoin proofs give real trust." },
                    { name: "James Wilson", handle: "@jamesw", text: "Every startup needs this kind of system. Cross-chain cashback with zero friction." },
                    { name: "Priya Patel", handle: "@priyap", text: "The zkLogin on Sui is a game changer. My parents could use this, no seed phrases needed." },
                    { name: "Marcus Thompson", handle: "@marcust", text: "I love that my cashback auto-invests into yield pools. Set it and forget it, but fully on-chain." },
                    // Duplicate for seamless loop
                    { name: "Maria Garcia", handle: "@mariag", text: "Raising funds on Cashback ID was simple, transparent, and faster than I imagined. The Filecoin proofs give real trust." },
                    { name: "James Wilson", handle: "@jamesw", text: "Every startup needs this kind of system. Cross-chain cashback with zero friction." },
                    { name: "Priya Patel", handle: "@priyap", text: "The zkLogin on Sui is a game changer. My parents could use this, no seed phrases needed." },
                    { name: "Marcus Thompson", handle: "@marcust", text: "I love that my cashback auto-invests into yield pools. Set it and forget it, but fully on-chain." },
                  ].map((t, i) => (
                    <div key={i} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 space-y-3 hover:border-primary/30 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.handle}</p>
                        </div>
                        <Quote className="h-4 w-4 text-primary/40 ml-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3 - scrolls up (slightly different speed) */}
              <div className="overflow-hidden hidden md:block">
                <div className="animate-marquee-up space-y-4" style={{ animationDuration: '40s' }}>
                  {[
                    { name: "Lisa Park", handle: "@lisap", text: "Community voting gave us early validation before launch. It felt amazing to know backers believed in our vision from day one." },
                    { name: "Michael Brown", handle: "@michaelb", text: "Before Cashback ID, managing rewards across chains was overwhelming. Now I can focus on building while the platform handles trust and transparency." },
                    { name: "Aiden Nakamura", handle: "@aidenn", text: "The Safe multi-sig control for ENS records is brilliant. Enterprise-grade security without the complexity." },
                    { name: "Sophie Martinez", handle: "@sophiem", text: "Sub-second Sui finality + Filecoin proofs = the best combo in Web3 cashback. Period." },
                    // Duplicate for seamless loop
                    { name: "Lisa Park", handle: "@lisap", text: "Community voting gave us early validation before launch. It felt amazing to know backers believed in our vision from day one." },
                    { name: "Michael Brown", handle: "@michaelb", text: "Before Cashback ID, managing rewards across chains was overwhelming. Now I can focus on building while the platform handles trust and transparency." },
                    { name: "Aiden Nakamura", handle: "@aidenn", text: "The Safe multi-sig control for ENS records is brilliant. Enterprise-grade security without the complexity." },
                    { name: "Sophie Martinez", handle: "@sophiem", text: "Sub-second Sui finality + Filecoin proofs = the best combo in Web3 cashback. Period." },
                  ].map((t, i) => (
                    <div key={i} className="rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm p-5 space-y-3 hover:border-primary/30 transition-colors duration-300">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.handle}</p>
                        </div>
                        <Quote className="h-4 w-4 text-primary/40 ml-auto" />
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{t.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="cta" className="py-32 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 overflow-hidden relative max-w-5xl mx-auto">
              <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
              
              <CardContent className="p-16 md:p-20 text-center relative">
                <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                  The card that reads your name, not your magnetic strip
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Unify your economy: spend on any chain, receive on your name. 
                  Powered by ENS, routed by LI.FI, settled on Sui.
                </p>
                <Button
                  size="lg"
                  onClick={() => connect("google")}
                  disabled={isConnecting}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 px-10 text-base"
                >
                  <ArrowUpRight className="mr-2 h-5 w-5" />
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
