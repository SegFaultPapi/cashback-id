"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useWallet } from "@/lib/web3-providers"
import { SUPPORTED_CHAINS, SUPPORTED_ASSETS, ENS_RECORD_KEYS } from "@/lib/ens-resolver"
import { Footer } from "@/components/footer"
import {
  Shield,
  CheckCircle2,
  ArrowLeft,
  Loader2,
  Globe,
  Lock,
  Sparkles,
  Link2,
  Layers,
  Coins,
  ArrowRight,
  Copy,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "ens" | "preferences" | "confirm" | "success"

export default function VerifyPage() {
  const { wallet, linkEnsName, updatePreferences } = useWallet()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("ens")
  const [ensInput, setEnsInput] = useState(wallet.ensName || "")
  const [isLinking, setIsLinking] = useState(false)

  // Preference form state
  const [selectedChain, setSelectedChain] = useState<string>(
    wallet.preferences?.chainId?.toString() || ""
  )
  const [selectedAsset, setSelectedAsset] = useState<string>(
    wallet.preferences?.asset || ""
  )
  const [selectedPool, setSelectedPool] = useState<string>(
    wallet.preferences?.pool || "stablecoins"
  )
  const [threshold, setThreshold] = useState<string>(
    wallet.preferences?.threshold?.toString() || "10"
  )
  const [suiAddress, setSuiAddress] = useState<string>(
    wallet.preferences?.suiAddress || wallet.address || ""
  )
  const [txData, setTxData] = useState<{ to: string; data: string } | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  useEffect(() => {
    if (wallet.ensName) {
      setEnsInput(wallet.ensName)
      setCurrentStep("preferences")
    }
    if (wallet.address && !suiAddress) {
      setSuiAddress(wallet.address)
    }
  }, [wallet.ensName, wallet.address, suiAddress])

  const handleLinkEns = async () => {
    if (!ensInput.endsWith(".eth")) return
    setIsLinking(true)
    try {
      await linkEnsName(ensInput)
      setCurrentStep("preferences")
    } finally {
      setIsLinking(false)
    }
  }

  const handleBuildTx = () => {
    const tx = updatePreferences({
      chainId: selectedChain ? parseInt(selectedChain) : null,
      asset: selectedAsset || null,
      pool: selectedPool || null,
      threshold: threshold ? parseFloat(threshold) : null,
      suiAddress: suiAddress || null,
    })
    setTxData(tx)
    setCurrentStep("confirm")
  }

  const handleConfirm = () => {
    // In production: send tx via Safe or direct wallet
    console.log("[ENS] Transaction data:", txData)
    setCurrentStep("success")
  }

  const handleCopyTxData = () => {
    if (!txData) return
    const payload = JSON.stringify({ to: txData.to, data: txData.data })
    navigator.clipboard.writeText(payload)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!wallet.isConnected) {
    return null
  }

  const steps = [
    { id: "ens", label: "Link ENS", number: 1 },
    { id: "preferences", label: "Set Preferences", number: 2 },
    { id: "confirm", label: "Confirm via Safe", number: 3 },
    { id: "success", label: "Done", number: 4 },
  ]

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Payment Profile</h1>
            <p className="text-muted-foreground mt-1">
              Configure your ENS Custom Text Records to control where and how you receive cashback.
            </p>
          </div>

          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
                        index < currentStepIndex
                          ? "bg-primary text-primary-foreground"
                          : index === currentStepIndex
                            ? "bg-gradient-to-br from-primary to-accent text-primary-foreground"
                            : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {index < currentStepIndex ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        step.number
                      )}
                    </div>
                    <span
                      className={cn(
                        "text-xs mt-2 hidden sm:block",
                        index <= currentStepIndex ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 w-8 sm:w-16 mx-2 transition-all",
                        index < currentStepIndex ? "bg-primary" : "bg-secondary"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Link ENS */}
          {currentStep === "ens" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Link Your ENS Name
                </CardTitle>
                <CardDescription>
                  Your <span className="text-primary font-mono">.eth</span> name becomes your payment profile. 
                  We'll read existing preferences and let you configure new ones.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">ENS Name</label>
                  <Input
                    placeholder="yourname.eth"
                    value={ensInput}
                    onChange={(e) => setEnsInput(e.target.value)}
                    className="bg-background border-border text-foreground font-mono text-lg placeholder:text-muted-foreground"
                  />
                </div>

                <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
                  <p className="text-sm font-medium text-foreground">What we'll store in your ENS:</p>
                  <div className="space-y-1">
                    {Object.entries(ENS_RECORD_KEYS).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <code className="text-xs font-mono text-primary bg-primary/10 px-2 py-0.5 rounded">
                          {value}
                        </code>
                        <span className="text-xs text-muted-foreground">
                          {key === "chain" && "→ Preferred destination chain"}
                          {key === "asset" && "→ Preferred payout asset"}
                          {key === "pool" && "→ Auto-invest pool"}
                          {key === "sui" && "→ Sui settlement address"}
                          {key === "threshold" && "→ Minimum sweep amount"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={handleLinkEns}
                  disabled={!ensInput.endsWith(".eth") || isLinking}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  {isLinking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Resolving ENS Records...
                    </>
                  ) : (
                    <>
                      <Link2 className="mr-2 h-4 w-4" />
                      Link & Continue
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Set Preferences */}
          {currentStep === "preferences" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5 text-primary" />
                  Payment Preferences
                </CardTitle>
                <CardDescription>
                  Configure how your cashback is routed. These are saved as ENS Custom Text Records 
                  that LI.FI reads to execute cross-chain transfers.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {wallet.ensName && (
                  <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <Globe className="h-4 w-4 text-primary" />
                    <span className="text-sm font-mono text-primary">{wallet.ensName}</span>
                    <Badge variant="outline" className="ml-auto border-primary/30 text-primary text-xs">
                      Linked
                    </Badge>
                  </div>
                )}

                {/* Destination Chain */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Destination Chain</label>
                  <p className="text-xs text-muted-foreground">Where should cashback be sent?</p>
                  <Select value={selectedChain} onValueChange={setSelectedChain}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select chain" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Object.entries(SUPPORTED_CHAINS).map(([id, chain]) => (
                        <SelectItem key={id} value={id} className="text-foreground hover:bg-secondary">
                          {chain.logo} {chain.name} (Chain {id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Payout Asset */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Payout Asset</label>
                  <p className="text-xs text-muted-foreground">What token do you want to receive?</p>
                  <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {Object.entries(SUPPORTED_ASSETS).map(([id, asset]) => (
                        <SelectItem key={id} value={id} className="text-foreground hover:bg-secondary">
                          {asset.symbol} — {asset.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Auto-Invest Pool */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Auto-Invest Pool</label>
                  <p className="text-xs text-muted-foreground">Automatically invest cashback into a yield pool</p>
                  <Select value={selectedPool} onValueChange={setSelectedPool}>
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Select pool" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="stablecoins" className="text-foreground hover:bg-secondary">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4" />
                          Stablecoins Pool (4.2% APR)
                        </div>
                      </SelectItem>
                      <SelectItem value="sui-growth" className="text-foreground hover:bg-secondary">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          SUI Growth (8.5% APR)
                        </div>
                      </SelectItem>
                      <SelectItem value="green-tokens" className="text-foreground hover:bg-secondary">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4" />
                          ReFi / Green Tokens (6.8% APR)
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sui Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sui Settlement Address</label>
                  <p className="text-xs text-muted-foreground">Your Sui address for final cashback settlement</p>
                  <Input
                    placeholder="0x..."
                    value={suiAddress}
                    onChange={(e) => setSuiAddress(e.target.value)}
                    className="bg-background border-border text-foreground font-mono text-sm placeholder:text-muted-foreground"
                  />
                </div>

                {/* Threshold */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sweep Threshold (USD)</label>
                  <p className="text-xs text-muted-foreground">Minimum amount before triggering a cross-chain sweep</p>
                  <Input
                    type="number"
                    placeholder="10"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    className="bg-background border-border text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <Button
                  onClick={handleBuildTx}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Review & Confirm
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Confirm via Safe */}
          {currentStep === "confirm" && (
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5 text-primary" />
                  Security Confirmation
                </CardTitle>
                <CardDescription>
                  Review your preferences before signing. In production, this transaction 
                  goes through your Safe multi-sig for institutional-grade security.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">ENS Name</span>
                    <span className="text-sm font-mono text-primary">{wallet.ensName}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Destination Chain</span>
                    <span className="text-sm text-foreground">
                      {selectedChain ? SUPPORTED_CHAINS[parseInt(selectedChain)]?.name : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Payout Asset</span>
                    <span className="text-sm text-foreground">
                      {selectedAsset ? SUPPORTED_ASSETS[selectedAsset]?.symbol : "—"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Pool</span>
                    <span className="text-sm text-foreground">{selectedPool}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-sm text-muted-foreground">Sweep Threshold</span>
                    <span className="text-sm text-foreground">${threshold}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-muted-foreground">Sui Address</span>
                    <span className="text-sm font-mono text-foreground truncate max-w-[200px]">
                      {suiAddress}
                    </span>
                  </div>
                </div>

                {/* TX Data Preview */}
                {txData && (
                  <div className="bg-background rounded-lg p-4 space-y-2">
                    <p className="text-xs text-muted-foreground">Transaction (ENS PublicResolver multicall)</p>
                    <p className="text-xs font-mono text-foreground break-all">
                      To: {txData.to}
                    </p>
                    <p className="text-xs font-mono text-muted-foreground break-all">
                      Data: {txData.data.slice(0, 66)}...
                    </p>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleCopyTxData}
                      className="mt-2 border-border hover:bg-secondary bg-transparent"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      {copied ? "Copied!" : "Copy for Safe"}
                    </Button>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("preferences")}
                    className="flex-1 border-border hover:bg-secondary bg-transparent"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    onClick={handleConfirm}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Sign & Save
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Success */}
          {currentStep === "success" && (
            <Card className="bg-card border-border">
              <CardHeader className="text-center">
                <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-8 w-8 text-primary" />
                </div>
                <CardTitle>Payment Profile Updated</CardTitle>
                <CardDescription>
                  Your ENS Custom Text Records have been configured. LI.FI will now route 
                  your cashback according to these preferences.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-primary/5 rounded-lg p-4 border border-primary/20 space-y-3">
                  <p className="text-sm font-medium text-primary">Active Configuration</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Chain</p>
                      <p className="text-sm text-foreground">
                        {selectedChain ? SUPPORTED_CHAINS[parseInt(selectedChain)]?.name : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Asset</p>
                      <p className="text-sm text-foreground">
                        {selectedAsset ? SUPPORTED_ASSETS[selectedAsset]?.symbol : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pool</p>
                      <p className="text-sm text-foreground">{selectedPool}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Threshold</p>
                      <p className="text-sm text-foreground">${threshold}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link href="/dashboard" className="flex-1">
                    <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep("preferences")}
                    className="flex-1 border-border hover:bg-secondary bg-transparent"
                  >
                    Edit Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
