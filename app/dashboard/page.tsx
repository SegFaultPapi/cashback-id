import { Suspense } from "react"
import DashboardContent from "./dashboard-content"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
          Loading…
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  )
}
