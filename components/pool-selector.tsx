"use client"

import React from "react"

import { useState } from "react"
import { DollarSign, TrendingUp, Leaf, ChevronDown, Check, Info } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface Pool {
  id: string
  name: string
  description: string
  apr: number
  icon: React.ReactNode
  details: string
}

const pools: Pool[] = [
  {
    id: "stablecoins",
    name: "Stablecoins Seguros",
    description: "USDC/DAI - Bajo riesgo",
    apr: 4.2,
    icon: <DollarSign className="h-5 w-5" />,
    details: "Deposito en pools de stablecoins con rendimiento estable. Ideal para preservar capital con crecimiento moderado.",
  },
  {
    id: "eth-growth",
    name: "SUI Growth",
    description: "Pools de SUI - Riesgo medio",
    apr: 8.5,
    icon: <TrendingUp className="h-5 w-5" />,
    details: "Exposicion a SUI con rendimientos mas altos. El valor puede fluctuar con el mercado.",
  },
  {
    id: "green-tokens",
    name: "Tokens Ambientales",
    description: "ReFi - Impacto positivo",
    apr: 6.8,
    icon: <Leaf className="h-5 w-5" />,
    details: "Invierte en proyectos de finanzas regenerativas. Tu cashback ayuda al planeta mientras crece.",
  },
]

interface PoolSelectorProps {
  value?: string
  onChange?: (poolId: string) => void
  className?: string
}

export function PoolSelector({ value, onChange, className }: PoolSelectorProps) {
  const [selectedPool, setSelectedPool] = useState<string>(value || pools[0].id)
  const [hoveredPool, setHoveredPool] = useState<string | null>(null)

  const currentPool = pools.find((p) => p.id === selectedPool) || pools[0]

  const handleSelect = (poolId: string) => {
    setSelectedPool(poolId)
    onChange?.(poolId)
  }

  return (
    <TooltipProvider>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-between border-border hover:bg-secondary bg-card h-auto py-3 px-4",
              className
            )}
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                {currentPool.icon}
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">{currentPool.name}</p>
                <p className="text-xs text-muted-foreground">{currentPool.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-sm font-bold text-primary">{currentPool.apr}%</p>
                <p className="text-[10px] text-muted-foreground">APR</p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="start" 
          className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card border-border p-2"
        >
          {pools.map((pool) => (
            <Tooltip key={pool.id}>
              <TooltipTrigger asChild>
                <DropdownMenuItem
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all",
                    selectedPool === pool.id 
                      ? "bg-primary/10 border border-primary/30" 
                      : "hover:bg-secondary"
                  )}
                  onClick={() => handleSelect(pool.id)}
                  onMouseEnter={() => setHoveredPool(pool.id)}
                  onMouseLeave={() => setHoveredPool(null)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center transition-colors",
                        selectedPool === pool.id 
                          ? "bg-primary text-primary-foreground" 
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      {pool.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">{pool.name}</p>
                      <p className="text-xs text-muted-foreground">{pool.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="text-sm font-bold text-primary">{pool.apr}%</p>
                      <p className="text-[10px] text-muted-foreground">APR</p>
                    </div>
                    {selectedPool === pool.id && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                  </div>
                </DropdownMenuItem>
              </TooltipTrigger>
              <TooltipContent 
                side="right" 
                className="max-w-xs bg-card border-border text-foreground p-3"
              >
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
                  <p className="text-sm">{pool.details}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}
