/**
 * POST /api/pay
 * Processes a cashback payment on Sui (Move: checkout::process_payment).
 * Pattern from Hackmoney; requires SUI_PRIVATE_KEY and package with checkout module.
 */

import { NextResponse } from "next/server"
import { Transaction } from "@mysten/sui/transactions"
import { getServerSuiClient, getServerKeypair, getCashbackPackageId } from "@/lib/sui-server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const {
      packageId: bodyPackageId,
      profileId,
      amount,
      merchantAddress,
    } = body as {
      packageId?: string
      profileId?: string
      amount?: number | string
      merchantAddress?: string
    }

    if (!profileId || amount == null) {
      return NextResponse.json(
        { error: "profileId and amount are required" },
        { status: 400 }
      )
    }

    const packageId = bodyPackageId || getCashbackPackageId()
    const privateKey = process.env.SUI_PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json({ error: "SUI_PRIVATE_KEY is not set" }, { status: 500 })
    }

    const client = getServerSuiClient()
    const keypair = getServerKeypair()
    const amountU64 = BigInt(amount)
    const merchant = merchantAddress || keypair.toSuiAddress()

    const tx = new Transaction()
    tx.setGasBudget(100_000_000)

    const [coin] = tx.splitCoins(tx.gas, [amountU64])

    tx.moveCall({
      target: `${packageId}::checkout::process_payment`,
      arguments: [tx.object(profileId), coin, tx.pure.address(merchant)],
    })

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true, showEvents: true },
    })

    return NextResponse.json({
      digest: result.digest,
      events: result.events ?? [],
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[pay]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
