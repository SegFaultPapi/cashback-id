"use client"

import { TrendingUp } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface GrowthIndicatorProps {
  amount: number
  earned: number
  percentage: number
  startDate?: string
}

export function GrowthIndicator({ amount, earned, percentage, startDate = "15 Dic 2025" }: GrowthIndicatorProps) {
  const [displayedEarned, setDisplayedEarned] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setIsAnimating(true)
    const duration = 1500
    const steps = 60
    const increment = earned / steps
    let current = 0
    
    const timer = setInterval(() => {
      current += increment
      if (current >= earned) {
        setDisplayedEarned(earned)
        clearInterval(timer)
        setIsAnimating(false)
      } else {
        setDisplayedEarned(current)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [earned])

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex flex-col gap-1 cursor-help">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">
                ${amount.toFixed(2)}
              </span>
              <span className="text-sm text-muted-foreground">inicial</span>
            </div>
            <div 
              className={cn(
                "flex items-center gap-1.5 transition-all duration-300",
                isAnimating && "animate-pulse"
              )}
            >
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-lg font-semibold text-primary">
                +${displayedEarned.toFixed(2)}
              </span>
              <span className="text-sm text-primary/80">
                ({percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent 
          side="bottom" 
          className="bg-card border-border text-foreground"
        >
          <p className="text-sm">
            Generado automaticamente desde <span className="font-semibold">{startDate}</span>
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
