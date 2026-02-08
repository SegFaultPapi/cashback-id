"use client"

import { useMemo } from "react"

// World map continents as polygons in normalized coordinates
// x: 0 = 180°W → 1 = 180°E, y: 0 = 90°N → 1 = 90°S
const CONTINENTS: number[][][] = [
  // North America
  [
    [0.03, 0.11], [0.10, 0.06], [0.17, 0.08], [0.25, 0.14],
    [0.33, 0.19], [0.31, 0.25], [0.28, 0.36], [0.23, 0.34],
    [0.21, 0.38], [0.17, 0.33], [0.16, 0.26], [0.16, 0.23],
    [0.08, 0.17],
  ],
  // Greenland
  [
    [0.30, 0.04], [0.36, 0.03], [0.42, 0.05],
    [0.40, 0.12], [0.36, 0.16], [0.32, 0.14],
  ],
  // Central America
  [
    [0.21, 0.38], [0.25, 0.38], [0.27, 0.42],
    [0.27, 0.47], [0.24, 0.47], [0.21, 0.42],
  ],
  // South America
  [
    [0.27, 0.46], [0.32, 0.44], [0.38, 0.46], [0.40, 0.52],
    [0.40, 0.56], [0.38, 0.63], [0.35, 0.68], [0.33, 0.73],
    [0.31, 0.80], [0.29, 0.78], [0.28, 0.64], [0.28, 0.50],
  ],
  // Europe (UK through Eastern Europe + Scandinavia)
  [
    [0.47, 0.18], [0.48, 0.15], [0.50, 0.13], [0.53, 0.10],
    [0.56, 0.10], [0.58, 0.14], [0.58, 0.18], [0.57, 0.22],
    [0.55, 0.26], [0.53, 0.28], [0.50, 0.30], [0.48, 0.28],
    [0.47, 0.24],
  ],
  // Russia
  [
    [0.58, 0.14], [0.63, 0.08], [0.72, 0.06], [0.82, 0.08],
    [0.90, 0.10], [0.95, 0.14], [0.93, 0.18], [0.85, 0.19],
    [0.75, 0.18], [0.65, 0.18], [0.60, 0.20],
  ],
  // Africa
  [
    [0.47, 0.30], [0.52, 0.28], [0.58, 0.30], [0.60, 0.36],
    [0.64, 0.46], [0.60, 0.52], [0.58, 0.56], [0.56, 0.62],
    [0.55, 0.68], [0.53, 0.69], [0.52, 0.64], [0.52, 0.56],
    [0.50, 0.48], [0.48, 0.44], [0.46, 0.38],
  ],
  // Middle East / Arabian Peninsula
  [
    [0.58, 0.28], [0.62, 0.27], [0.66, 0.30],
    [0.66, 0.36], [0.63, 0.40], [0.60, 0.40], [0.58, 0.36],
  ],
  // India
  [
    [0.69, 0.30], [0.73, 0.28], [0.75, 0.32],
    [0.74, 0.38], [0.72, 0.44], [0.70, 0.46],
    [0.68, 0.42], [0.68, 0.36],
  ],
  // East Asia (China, Mongolia, Korea)
  [
    [0.72, 0.20], [0.78, 0.18], [0.85, 0.20], [0.87, 0.24],
    [0.86, 0.30], [0.83, 0.35], [0.78, 0.38], [0.75, 0.36],
    [0.72, 0.30],
  ],
  // Japan
  [
    [0.87, 0.25], [0.89, 0.24], [0.90, 0.27],
    [0.90, 0.32], [0.88, 0.33], [0.87, 0.30],
  ],
  // SE Asia (mainland)
  [
    [0.76, 0.38], [0.80, 0.38], [0.81, 0.42],
    [0.80, 0.47], [0.77, 0.47], [0.75, 0.42],
  ],
  // Indonesia
  [
    [0.78, 0.47], [0.82, 0.48], [0.86, 0.49],
    [0.89, 0.51], [0.88, 0.54], [0.84, 0.54],
    [0.80, 0.52], [0.77, 0.50],
  ],
  // Australia
  [
    [0.83, 0.58], [0.88, 0.57], [0.92, 0.59],
    [0.93, 0.64], [0.92, 0.70], [0.88, 0.72],
    [0.84, 0.70], [0.82, 0.65],
  ],
  // New Zealand
  [
    [0.96, 0.70], [0.97, 0.69], [0.98, 0.72],
    [0.97, 0.78], [0.96, 0.76],
  ],
]

function pointInPolygon(px: number, py: number, polygon: number[][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (
      (yi > py) !== (yj > py) &&
      px < ((xj - xi) * (py - yi)) / (yj - yi) + xi
    ) {
      inside = !inside
    }
  }
  return inside
}

function isLand(x: number, y: number): boolean {
  return CONTINENTS.some((poly) => pointInPolygon(x, y, poly))
}

interface DotWorldMapProps {
  className?: string
}

export function DotWorldMap({ className }: DotWorldMapProps) {
  const COLS = 80
  const ROWS = 40
  const GAP = 12
  const DOT_R = 1.5

  const dots = useMemo(() => {
    const result: { cx: number; cy: number; opacity: number }[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const nx = c / (COLS - 1)
        const ny = r / (ROWS - 1)
        result.push({
          cx: c * GAP + GAP / 2,
          cy: r * GAP + GAP / 2,
          opacity: isLand(nx, ny) ? 0.35 : 0.06,
        })
      }
    }
    return result
  }, [])

  return (
    <svg
      className={className}
      viewBox={`0 0 ${COLS * GAP} ${ROWS * GAP}`}
      preserveAspectRatio="xMidYMid meet"
      fill="none"
    >
      {dots.map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r={DOT_R}
          fill="currentColor"
          opacity={dot.opacity}
        />
      ))}
    </svg>
  )
}
