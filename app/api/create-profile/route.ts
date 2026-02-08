/**
 * POST /api/create-profile
 * Creates a CashbackProfile on Sui (Move: profile::create_and_transfer_to_sender).
 * Pattern from Hackmoney; requires SUI_PRIVATE_KEY and package with profile module.
 */

import { NextResponse } from "next/server"
import { Transaction } from "@mysten/sui/transactions"
import { getServerSuiClient, getServerKeypair, getCashbackPackageId } from "@/lib/sui-server"

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { packageId: bodyPackageId, name: _name } = body as { packageId?: string; name?: string }

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

    const tx = new Transaction()
    tx.setGasBudget(100_000_000)

    tx.moveCall({
      target: `${packageId}::profile::create_and_transfer_to_sender`,
      arguments: [],
    })

    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: { showEffects: true, showObjectChanges: true },
    })

    const created = result.objectChanges?.find(
      (change: { type: string; objectType?: string }) =>
        change.type === "created" &&
        typeof change === "object" &&
        "objectType" in change &&
        String(change.objectType).includes("::profile::CashbackProfile")
    ) as { objectId: string } | undefined

    const profileId = created && "objectId" in created ? created.objectId : null
    if (!profileId) {
      return NextResponse.json(
        { error: "Profile object not found in transaction result", digest: result.digest },
        { status: 500 }
      )
    }

    return NextResponse.json({ digest: result.digest, profileId })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    console.error("[create-profile]", message)
    const isGas =
      /insufficient|gas|No valid gas coins|balance/i.test(message) || message.includes("0x1::coin::InsufficientBalance")
    return NextResponse.json(
      {
        error: isGas
          ? "Server wallet has insufficient SUI. Fund the SUI_PRIVATE_KEY address on testnet (faucet)."
          : message,
      },
      { status: 500 }
    )
  }
}
