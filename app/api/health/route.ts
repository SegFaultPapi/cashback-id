/**
 * GET /api/health
 * Lightweight health check for deploy and monitoring.
 * Returns config status without exposing secrets.
 */

import { NextResponse } from "next/server"
import { getCashbackPackageId } from "@/lib/sui-server"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const suiConfigured = Boolean(process.env.SUI_PRIVATE_KEY)
  const network = process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet"
  const packageId = getCashbackPackageId()

  return NextResponse.json({
    ok: true,
    suiConfigured,
    network,
    packageId,
  })
}
