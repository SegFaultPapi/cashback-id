"use client"

import { useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useWallet } from "@/lib/web3-providers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Chrome, Apple, ArrowLeft, Loader2, Sparkles } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const { wallet, connect, isConnecting } = useWallet()

  useEffect(() => {
    if (wallet.isConnected) {
      router.replace("/dashboard")
    }
  }, [wallet.isConnected, router])

  const handleConnect = async (provider: "google" | "apple") => {
    await connect(provider)
    // useEffect above redirects to /dashboard when wallet.isConnected
  }

  if (wallet.isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-24 h-24">
            <Image
              src="/images/Loader.jpg"
              alt="Loading"
              fill
              className="object-contain animate-pulse"
            />
          </div>
          <p className="text-sm text-muted-foreground">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background relative">
      {/* Full-screen loader overlay when signing in */}
      {isConnecting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-background/95 backdrop-blur-sm">
          <div className="relative w-28 h-28">
            <Image
              src="/images/Loader.jpg"
              alt="Signing in"
              fill
              className="object-contain animate-pulse"
              priority
            />
          </div>
          <p className="text-sm text-muted-foreground">Signing in...</p>
        </div>
      )}

      {/* Top bar: back to home */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>
        <Link href="/" className="flex items-center gap-2 font-display font-bold text-foreground text-lg">
          <Image src="/images/logocashback.svg" alt="Cashback ID" width={28} height={28} className="h-7 w-7 object-contain" />
          Cashback ID
        </Link>
        <div className="w-24" /> {/* balance spacer */}
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary mb-4">
              <Sparkles className="h-7 w-7" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              Welcome to Cashback ID
            </h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base">
              Sign in or create your account to start receiving cashback with your identity.
            </p>
          </div>

          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-semibold">Sign in</CardTitle>
              <CardDescription>
                Choose an option to continue. We don&apos;t use passwords.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border bg-background/50 hover:bg-secondary/50 font-medium"
                onClick={() => handleConnect("google")}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Chrome className="mr-3 h-5 w-5" />
                )}
                Continue with Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-border bg-background/50 hover:bg-secondary/50 font-medium"
                onClick={() => handleConnect("apple")}
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                ) : (
                  <Apple className="mr-3 h-5 w-5" />
                )}
                Continue with Apple
              </Button>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            By continuing, you agree to our{" "}
            <Link href="/" className="underline hover:text-foreground">Terms of use</Link>
            {" "}and{" "}
            <Link href="/" className="underline hover:text-foreground">Privacy policy</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}
