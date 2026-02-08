import { NextResponse } from "next/server"
import { isOurSubdomain } from "@/lib/ens-subdomain-store"
import { registerSubdomainOnChain } from "@/lib/ens-registrar-server"

/**
 * POST /api/ens/register-onchain
 * Registers a subdomain on-chain.
 * Body: { label: string [, allowUnclaimed?: boolean] }
 *   - label: e.g. "pumatest" for pumatest.cashbackid.eth
 *   - allowUnclaimed: if true, allows registering even if not in the store (useful for testing).
 * By default only allows labels that are already in our store (claimed).
 *
 * Requires PRIVATE_KEY (or ETH_REGISTRAR_OWNER_PRIVATE_KEY) and ETH_RPC_URL in .env.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const rawLabel = typeof body.label === "string" ? body.label.trim() : ""
    const label = rawLabel.toLowerCase().replace(/[^a-z0-9-]/g, "")
    const allowUnclaimed = body.allowUnclaimed === true
    if (!label || label.length < 3) {
      return NextResponse.json(
        { error: "label is required (min 3 chars, only a-z 0-9 -)" },
        { status: 400 }
      )
    }

    const ensName = `${label}.cashbackid.eth`
    if (!allowUnclaimed && !isOurSubdomain(ensName)) {
      return NextResponse.json(
        { error: "Subdomain not claimed in this app. Claim it first from the dashboard." },
        { status: 404 }
      )
    }

    const result = await registerSubdomainOnChain(label)
    if (result.error) {
      return NextResponse.json(
        { error: result.error, ensName },
        { status: 502 }
      )
    }

    return NextResponse.json({
      ensName,
      label,
      txHash: result.hash,
      registeredOnChain: true,
    })
  } catch (e) {
    console.error("[register-onchain]", e)
    return NextResponse.json({ error: "Failed to register on-chain" }, { status: 500 })
  }
}
