"use client"

import { useState } from "react"
import { Settings, QrCode, Copy, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DynamicCardProps {
  ensName: string
  balance: number
  growthScore: number
  address?: string
}

export function DynamicCard({ ensName, balance, growthScore, address = "0x1234...5678" }: DynamicCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [copied, setCopied] = useState(false)

  const glowIntensity = Math.min(growthScore / 100, 1)
  
  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div 
      className="perspective-1000 w-full max-w-sm mx-auto cursor-pointer"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div 
        className={cn(
          "relative w-full aspect-[1.586/1] transition-transform duration-700 transform-style-preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front of Card */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: `0 0 ${30 + glowIntensity * 40}px ${glowIntensity * 20}px rgba(0, 255, 163, ${0.1 + glowIntensity * 0.2})`,
          }}
        >
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-card/90 via-card/80 to-secondary/90 backdrop-blur-xl border border-primary/20" />
          
          {/* Rotating gears background */}
          <div className="absolute inset-0 overflow-hidden opacity-10">
            <Settings 
              className="absolute -right-8 -top-8 h-32 w-32 text-primary animate-spin" 
              style={{ animationDuration: "20s" }}
            />
            <Settings 
              className="absolute -left-4 -bottom-4 h-24 w-24 text-accent animate-spin" 
              style={{ animationDuration: "15s", animationDirection: "reverse" }}
            />
            <Settings 
              className="absolute right-12 bottom-8 h-16 w-16 text-primary animate-spin" 
              style={{ animationDuration: "25s" }}
            />
          </div>

          {/* Card content */}
          <div className="relative h-full flex flex-col justify-between p-6 z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Cashback ID</p>
                <h3 className="text-xl font-bold text-foreground">{ensName}</h3>
              </div>
              <div 
                className="h-10 w-10 rounded-full flex items-center justify-center"
                style={{
                  background: `conic-gradient(var(--primary) ${growthScore}%, transparent ${growthScore}%)`,
                }}
              >
                <div className="h-8 w-8 rounded-full bg-card flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{growthScore}</span>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs text-muted-foreground mb-1">Saldo disponible</p>
              <p className="text-3xl font-bold text-foreground">
                ${balance.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] text-muted-foreground">CRECIMIENTO</p>
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-sm font-semibold text-primary">Activo</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Toca para voltear</p>
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div 
          className="absolute inset-0 backface-hidden rounded-2xl overflow-hidden rotate-y-180"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: `0 0 ${30 + glowIntensity * 40}px ${glowIntensity * 20}px rgba(0, 255, 163, ${0.1 + glowIntensity * 0.2})`,
          }}
        >
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-gradient-to-br from-card/90 via-card/80 to-secondary/90 backdrop-blur-xl border border-primary/20" />

          {/* Card content */}
          <div className="relative h-full flex flex-col items-center justify-center gap-4 p-6 z-10">
            {/* QR Code placeholder */}
            <div className="h-28 w-28 bg-foreground rounded-lg flex items-center justify-center">
              <QrCode className="h-24 w-24 text-background" />
            </div>
            
            <p className="text-sm text-muted-foreground text-center">
              Escanea para recibir pagos
            </p>

            <Button
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary bg-transparent"
              onClick={(e) => {
                e.stopPropagation()
                handleCopy()
              }}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar direccion
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">Toca para voltear</p>
          </div>
        </div>
      </div>
    </div>
  )
}
