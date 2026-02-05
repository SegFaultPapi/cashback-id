"use client"

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { mockCashbackHistory } from "@/lib/mock-data"

export function CashbackChart() {
  return (
    <div className="h-[120px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={mockCashbackHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="cashbackGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-popover border border-border rounded-lg px-3 py-2 shadow-lg">
                    <p className="text-sm font-medium text-foreground">
                      ${payload[0].value}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {payload[0].payload.month}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Area
            type="monotone"
            dataKey="amount"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#cashbackGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
