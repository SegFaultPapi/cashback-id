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
} from "lucide-react"
import { useEffect, useState } from "react"

export default function LandingPage() {
  const { wallet, connect, isConnecting } = useWallet()
  const router = useRouter()
  const [heroOpacity, setHeroOpacity] = useState(1)

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
          <div className="w-full relative z-10 pt-6">
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

                {/* CTA Button */}
                <Button
                  onClick={connect}
                  disabled={isConnecting}
                  className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors animate-pulse hover:animate-none shadow-lg shadow-primary/20"
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>

          {/* Hero Content */}
          <div className="flex-1 flex items-center w-full max-w-7xl mx-auto relative px-4 md:px-6">
            <div className="max-w-4xl mx-auto text-center space-y-8 py-20">
              <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
                <span className="text-foreground">Turn purchases into </span>
                <span className="text-primary">investments</span>
              </h1>

              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto text-balance leading-relaxed">
                Every time you shop, your money goes to work. Get cashback that grows automatically. 
                No confusing terms, just returns.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
                <Button
                  size="lg"
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 px-10 text-base"
                >
                  <Apple className="mr-2 h-5 w-5" />
                  Continue with Apple
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={connect}
                  disabled={isConnecting}
                  className="w-full sm:w-auto border-border hover:bg-card h-14 px-10 bg-transparent text-base"
                >
                  <Chrome className="mr-2 h-5 w-5" />
                  Continue with Google
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                One-tap signup. No credit check. No hidden fees.
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
                  Your Identity is Your Account
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  No long account numbers to remember. Your unique identity (like <span className="text-primary font-mono">vitalik.eth</span>) 
                  is all you need. Use it at any partner merchant to earn instant cashback that grows automatically.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-32 w-full">
          <div className="w-full max-w-7xl mx-auto px-4 md:px-6">
            <div className="text-center mb-20 max-w-3xl mx-auto">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-6">
                Shopping that pays back
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                Your purchases automatically generate returns. No extra steps, no complicated setup.
              </p>
            </div>

            <ul className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-2 lg:gap-4 max-w-6xl mx-auto">
              {/* Card 1 */}
              <li className="list-none min-h-[14rem] md:[grid-area:1/1/2/7]">
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
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          Automatic Growth
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Your cashback is automatically invested in yield-generating pools. 
                          Watch your money grow without lifting a finger.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Card 2 */}
              <li className="list-none min-h-[14rem] md:[grid-area:1/7/2/13]">
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
                          Privacy First
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          Your data stays yours. We use advanced cryptography to verify eligibility 
                          without collecting personal information.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </li>

              {/* Card 3 */}
              <li className="list-none min-h-[14rem] md:[grid-area:2/1/3/13]">
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
                        <LineChart className="h-4 w-4" />
                      </div>
                      <div className="space-y-3">
                        <h3 className="font-display text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                          Real-Time Tracking
                        </h3>
                        <p className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground">
                          See exactly how your money is working for you. Track growth, 
                          monitor returns, withdraw anytime.
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
                onClick={connect}
                disabled={isConnecting}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 px-10 text-base"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Explore All Features
              </Button>
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
                  Ready to make your money work?
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  Join thousands earning returns on everyday purchases.
                </p>
                <Button
                  size="lg"
                  onClick={connect}
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
