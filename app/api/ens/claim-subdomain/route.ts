import { NextResponse } from "next/server"
import { claimSubdomain, getSubdomain } from "@/lib/ens-subdomain-store"
import { validateSuiAddress } from "@/lib/api-validate"

/**
 * POST /api/ens/claim-subdomain
 * Asigna un subdominio usuario.cashbackid.eth al Sui address del usuario.
 * Body: { suiAddress: string, preferredLabel?: string }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const suiAddress = typeof body.suiAddress === "string" ? body.suiAddress.trim() : ""
    const preferredLabel =
      typeof body.preferredLabel === "string" ? body.preferredLabel.trim() : undefined

    const addrCheck = validateSuiAddress(suiAddress)
    if (!addrCheck.ok) {
      return NextResponse.json({ error: addrCheck.error }, { status: 400 })
    }

    const existing = getSubdomain(suiAddress)
    if (existing) {
      return NextResponse.json({ ensName: existing.ensName, label: existing.label })
    }

    const entry = claimSubdomain(suiAddress, preferredLabel)
    if (!entry) {
      return NextResponse.json(
        { error: "Label not available (taken or invalid). Try another." },
        { status: 409 }
      )
    }

    return NextResponse.json({ ensName: entry.ensName, label: entry.label })
  } catch (e) {
    console.error("[claim-subdomain]", e)
    return NextResponse.json({ error: "Failed to claim subdomain" }, { status: 500 })
  }
}
