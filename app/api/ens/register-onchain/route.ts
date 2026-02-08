import { NextResponse } from "next/server"
import { isOurSubdomain } from "@/lib/ens-subdomain-store"
import { registerSubdomainOnChain } from "@/lib/ens-registrar-server"

/**
 * POST /api/ens/register-onchain
 * Registra on-chain un subdominio.
 * Body: { label: string [, allowUnclaimed?: boolean] }
 *   - label: ej. "pumatest" para pumatest.cashbackid.eth
 *   - allowUnclaimed: si true, permite registrar aunque no esté en el store (útil para pruebas).
 * Por defecto solo permite labels que ya están en nuestro store (reclamados).
 *
 * Requiere PRIVATE_KEY (o ETH_REGISTRAR_OWNER_PRIVATE_KEY) y ETH_RPC_URL en .env.
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
