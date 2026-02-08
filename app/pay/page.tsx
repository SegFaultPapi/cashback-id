"use client"

import { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useWallet } from "@/lib/web3-providers"
import { resolvePaymentPreferences } from "@/lib/ens-resolver"
import { ArrowLeft, Loader2, Send, Wallet } from "lucide-react"

function PayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const toEns = searchParams.get("to")?.trim() || ""
  const { wallet } = useWallet()
  const [ensName, setEnsName] = useState(toEns)
  const [amount, setAmount] = useState("")
  const [profileId, setProfileId] = useState<string | null>(null)
  const [suiAddress, setSuiAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [payResult, setPayResult] = useState<{ digest: string } | null>(null)
  const [payError, setPayError] = useState<string | null>(null)

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  useEffect(() => {
    if (toEns) setEnsName(toEns)
  }, [toEns])

  useEffect(() => {
    if (!ensName.endsWith(".eth")) {
      setProfileId(null)
      setSuiAddress(null)
      return
    }
    setResolving(true)
    const normalized = ensName.trim().toLowerCase()
    if (normalized.endsWith(".cashbackid.eth")) {
      fetch(`/api/ens/resolve?name=${encodeURIComponent(normalized)}`)
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("Not found"))))
        .then((data) => {
          setProfileId(data.profileId || null)
          setSuiAddress(data.suiAddress || null)
        })
        .catch(() => {
          setProfileId(null)
          setSuiAddress(null)
        })
        .finally(() => setResolving(false))
    } else {
      resolvePaymentPreferences(ensName)
        .then((prefs) => {
          setProfileId(prefs.profileId || null)
          setSuiAddress(prefs.suiAddress || null)
        })
        .catch(() => {
          setProfileId(null)
          setSuiAddress(null)
        })
        .finally(() => setResolving(false))
    }
  }, [ensName])

  const handlePay = async () => {
    if (!profileId || !amount) return
    setPayError(null)
    setLoading(true)
    try {
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId,
          amount: Math.floor(parseFloat(amount) * 1_000_000_000),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Payment processing failed")
      setPayResult({ digest: data.digest })
    } catch (e) {
      setPayError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  if (!wallet.isConnected) return null

  return (
    <div className="min-h-screen flex flex-col bg-background min-w-0 overflow-x-hidden">
      <Header />

      <main className="flex-1 container px-4 py-8 max-w-full min-w-0">
        <div className="max-w-lg mx-auto min-w-0">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back
          </Link>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Pay to ENS
              </CardTitle>
              <CardDescription>
                Enter an .eth name that has a cashback profile. The payment will be credited as cashback to the ENS owner.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Recipient (ENS)</label>
                <Input
                  placeholder="name.eth"
                  value={ensName}
                  onChange={(e) => setEnsName(e.target.value)}
                  className="bg-background border-border font-mono"
                />
              </div>

              {resolving && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resolving profile...
                </div>
              )}

              {!resolving && ensName.endsWith(".eth") && (
                <>
                  {profileId ? (
                    <>
                      <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                        <p className="text-muted-foreground">Profile found</p>
                        <p className="font-mono text-foreground truncate">{profileId}</p>
                        {suiAddress && (
                          <p className="text-xs text-muted-foreground mt-1 truncate">Sui: {suiAddress}</p>
                        )}
                      </div>

                      {!payResult ? (
                        <>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">Amount (SUI)</label>
                            <Input
                              type="number"
                              placeholder="0.1"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              className="bg-background border-border"
                            />
                          </div>
                          {payError && (
                            <p className="text-sm text-destructive">{payError}</p>
                          )}
                          <Button
                            onClick={handlePay}
                            disabled={loading || !amount || parseFloat(amount) <= 0}
                            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Send className="mr-2 h-4 w-4" />
                                Enviar pago
                              </>
                            )}
                          </Button>
                        </>
                      ) : (
                        <div className="rounded-lg bg-primary/10 border border-primary/20 p-4 text-center">
                          <p className="text-sm font-medium text-primary">Payment sent</p>
                          <p className="text-xs font-mono text-muted-foreground mt-1 break-all">{payResult.digest}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Cashback will be credited to {ensName}&apos;s account.
                          </p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      This ENS has no cashback profile (cashbackid.profile_id). The owner must create a profile and save it to ENS from Settings.
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function PayPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PayContent />
    </Suspense>
  )
}
