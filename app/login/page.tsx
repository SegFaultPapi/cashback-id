"use client"

import { useEffect } from "react"
import Link from "next/link"
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirigiendo al dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top bar: back to home */}
      <header className="flex items-center justify-between p-4 md:p-6 border-b border-border/50">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>
        <Link href="/" className="font-display font-bold text-foreground text-lg">
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
              Bienvenido a Cashback ID
            </h1>
            <p className="mt-2 text-muted-foreground text-sm md:text-base">
              Inicia sesión o crea tu cuenta para empezar a recibir cashback con tu identidad.
            </p>
          </div>

          <Card className="border-border bg-card/80 backdrop-blur-sm shadow-xl">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-lg font-semibold">Iniciar sesión</CardTitle>
              <CardDescription>
                Elige una opción para continuar. No usamos contraseñas.
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
                Continuar con Google
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
                Continuar con Apple
              </Button>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <Link href="/" className="underline hover:text-foreground">Términos de uso</Link>
            {" "}y{" "}
            <Link href="/" className="underline hover:text-foreground">Política de privacidad</Link>.
          </p>
        </div>
      </main>
    </div>
  )
}
