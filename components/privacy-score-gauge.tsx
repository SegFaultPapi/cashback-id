"use client"

import { cn } from "@/lib/utils"

interface PrivacyScoreGaugeProps {
  score: number
  size?: "sm" | "md" | "lg"
}

export function PrivacyScoreGauge({ score, size = "md" }: PrivacyScoreGaugeProps) {
  const sizeConfig = {
    sm: { width: 120, strokeWidth: 8, fontSize: "text-2xl" },
    md: { width: 160, strokeWidth: 10, fontSize: "text-4xl" },
    lg: { width: 200, strokeWidth: 12, fontSize: "text-5xl" },
  }

  const config = sizeConfig[size]
  const radius = (config.width - config.strokeWidth) / 2
  const circumference = radius * Math.PI
  const progress = (score / 100) * circumference

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-primary"
    if (score >= 60) return "text-accent"
    if (score >= 40) return "text-chart-4"
    return "text-destructive"
  }

  const getStrokeColor = (score: number) => {
    if (score >= 80) return "stroke-primary"
    if (score >= 60) return "stroke-accent"
    if (score >= 40) return "stroke-chart-4"
    return "stroke-destructive"
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={config.width}
        height={config.width / 2 + 20}
        className="overflow-visible"
      >
        {/* Background arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={config.strokeWidth}
          className="text-secondary"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={`M ${config.strokeWidth / 2} ${config.width / 2} A ${radius} ${radius} 0 0 1 ${config.width - config.strokeWidth / 2} ${config.width / 2}`}
          fill="none"
          strokeWidth={config.strokeWidth}
          className={cn("transition-all duration-1000", getStrokeColor(score))}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
        />
      </svg>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 text-center">
        <span className={cn("font-bold", config.fontSize, getScoreColor(score))}>
          {score}
        </span>
        <p className="text-xs text-muted-foreground mt-1">de 100</p>
      </div>
    </div>
  )
}
