/**
 * POST /api/pay
 * Processes a cashback payment on Sui (Move: checkout::process_payment).
 */

import { NextResponse } from "next/server"
import { Transaction } from "@mysten/sui/transactions"
import { getServerSuiClient, getServerKeypair, getCashbackPackageId } from "@/lib/sui-server"
import { validateProfileId, validateAmount } from "@/lib/api-validate"

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

    const profileCheck = validateProfileId(profileId ?? "")
    if (!profileCheck.ok) {
      return NextResponse.json({ error: profileCheck.error }, { status: 400 })
    }

    const amountCheck = validateAmount(amount)
    if (!amountCheck.ok) {
      return NextResponse.json({ error: amountCheck.error }, { status: 400 })
    }

    const packageId = bodyPackageId || getCashbackPackageId()
    const privateKey = process.env.SUI_PRIVATE_KEY
    if (!privateKey) {
      return NextResponse.json(
        { error: "Server not configured: SUI_PRIVATE_KEY is missing" },
        { status: 500 }
      )
    }

    const client = getServerSuiClient()
    const keypair = getServerKeypair()
    const amountU64 = amountCheck.value
    const merchant = merchantAddress || keypair.toSuiAddress()

    const tx = new Transaction()
    tx.setGasBudget(100_000_000)

    const [coin] = tx.splitCoins(tx.gas, [amountU64])

    tx.moveCall({
      target: `${packageId}::checkout::process_payment`,
      arguments: [tx.object(profileId as string), coin, tx.pure.address(merchant)],
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
    const isGas =
      /insufficient|gas|No valid gas coins|balance/i.test(message) || message.includes("0x1::coin::InsufficientBalance")
    return NextResponse.json(
      {
        error: isGas
          ? "Server wallet has insufficient SUI for this payment. Fund the SUI_PRIVATE_KEY address on testnet."
          : message,
      },
      { status: 500 }
    )
  }
}
