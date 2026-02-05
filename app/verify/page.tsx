"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet, generateIdentityProof } from "@/lib/web3-providers"
import { verificationProviders } from "@/lib/mock-data"
import { Footer } from "@/components/footer" // Import Footer component
import {
  Shield,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Fingerprint,
  Lock,
  ExternalLink,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Step = "choose" | "generate" | "success"

export default function VerifyPage() {
  const { wallet } = useWallet()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("choose")
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [proofHash, setProofHash] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    if (!wallet.isConnected) {
      router.push("/")
    }
  }, [wallet.isConnected, router])

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId)
  }

  const handleGenerateProof = async () => {
    if (!selectedProvider) return

    setCurrentStep("generate")
    setIsGenerating(true)
    setProgress(0)

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval)
          return prev
        }
        return prev + Math.random() * 15
      })
    }, 500)

    try {
      const hash = await generateIdentityProof(selectedProvider)
      clearInterval(progressInterval)
      setProgress(100)
      setProofHash(hash)
      setTimeout(() => {
        setIsGenerating(false)
        setCurrentStep("success")
      }, 500)
    } catch (error) {
      console.error("Failed to generate proof:", error)
      clearInterval(progressInterval)
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setCurrentStep("choose")
    setSelectedProvider(null)
    setProofHash(null)
    setProgress(0)
  }

  if (!wallet.isConnected) {
    return null
  }

  const steps = [
    { id: "choose", label: "Elegir Proveedor", number: 1 },
    { id: "generate", label: "Generar Prueba", number: 2 },
    { id: "success", label: "Verificacion Completa", number: 3 },
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
              Volver al Dashboard
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Verificacion de Identidad</h1>
            <p className="text-muted-foreground mt-1">
              Verifica tu identidad con pruebas zero-knowledge para desbloquear todas las recompensas.
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
                          ? "bg-success text-success-foreground"
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
                        "h-0.5 w-12 sm:w-24 mx-2 transition-all",
                        index < currentStepIndex ? "bg-success" : "bg-secondary"
                      )}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          {currentStep === "choose" && (
            <Card>
              <CardHeader>
                <CardTitle>Selecciona un Proveedor</CardTitle>
                <CardDescription>
                  Elige un proveedor de verificación para continuar.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {verificationProviders.map((provider) => (
                  <Button
                    key={provider.id}
                    onClick={() => handleProviderSelect(provider.id)}
                    className="mb-4"
                  >
                    {provider.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
          )}

          {currentStep === "generate" && (
            <Card>
              <CardHeader>
                <CardTitle>Generando Prueba</CardTitle>
                <CardDescription>
                  Estamos generando tu prueba de identidad. Esto puede tardar unos momentos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin" />
                </div>
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">
                    Progreso: {progress.toFixed(0)}%
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === "success" && (
            <Card>
              <CardHeader>
                <CardTitle>Verificación Exitosa</CardTitle>
                <CardDescription>
                  Tu prueba de identidad ha sido generada con éxito.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center">
                  <Sparkles className="h-10 w-10 text-accent" />
                </div>
                <div className="mt-4">
                  <span className="text-sm text-muted-foreground">
                    Hash de la Prueba: {proofHash}
                  </span>
                </div>
                <div className="mt-8 flex justify-center">
                  <Button onClick={handleReset}>Realizar Otra Verificación</Button>
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
