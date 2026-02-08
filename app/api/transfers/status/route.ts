/**
 * GET /api/transfers/status?txHash=0x...&fromChainId=8453&toChainId=42161
 * Checks LiFi cross-chain transfer status by tx hash and chains.
 */

import { NextResponse } from "next/server"
import { checkTransferStatus } from "@/lib/lifi-client"

export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const txHash = searchParams.get("txHash")?.trim()
    const fromChainIdStr = searchParams.get("fromChainId")
    const toChainIdStr = searchParams.get("toChainId")

    if (!txHash) {
      return NextResponse.json({ error: "txHash is required" }, { status: 400 })
    }
    const fromChainId = fromChainIdStr ? parseInt(fromChainIdStr, 10) : undefined
    const toChainId = toChainIdStr ? parseInt(toChainIdStr, 10) : undefined
    if (fromChainId === undefined || Number.isNaN(fromChainId)) {
      return NextResponse.json({ error: "fromChainId is required and must be a number" }, { status: 400 })
    }
    if (toChainId === undefined || Number.isNaN(toChainId)) {
      return NextResponse.json({ error: "toChainId is required and must be a number" }, { status: 400 })
    }

    const result = await checkTransferStatus(txHash, fromChainId, toChainId)
    return NextResponse.json(result)
  } catch (e) {
    console.error("[transfers/status]", e)
    return NextResponse.json({ error: "Failed to get transfer status" }, { status: 500 })
  }
}
