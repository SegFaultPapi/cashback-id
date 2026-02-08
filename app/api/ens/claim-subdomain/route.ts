import { NextResponse } from "next/server"
import { claimSubdomain, getSubdomain } from "@/lib/ens-subdomain-store"
import { validateSuiAddress } from "@/lib/api-validate"
import { registerSubdomainOnChain } from "@/lib/ens-registrar-server"

/**
 * POST /api/ens/claim-subdomain
 * Asigna un subdominio usuario.cashbackid.eth al Sui address del usuario.
 * Body: { suiAddress: string, preferredLabel?: string }
 *
 * If ETH_REGISTRAR_OWNER_PRIVATE_KEY (or PRIVATE_KEY) and ETH RPC are set,
 * also registers the subdomain on-chain (custodial: app holds the ENS NFT).
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
      // Sync to chain if not yet (e.g. claimed before on-chain was enabled)
      const onChain = await registerSubdomainOnChain(existing.label)
      const registeredOnChain = Boolean(onChain.hash)
      if (onChain.error) {
        console.warn("[claim-subdomain] on-chain sync for existing failed:", onChain.error)
      }
      return NextResponse.json({
        ensName: existing.ensName,
        label: existing.label,
        registeredOnChain,
        txHash: onChain.hash ?? undefined,
        onChainError: onChain.error ?? undefined,
      })
    }

    const entry = claimSubdomain(suiAddress, preferredLabel)
    if (!entry) {
      return NextResponse.json(
        { error: "Label not available (taken or invalid). Try another." },
        { status: 409 }
      )
    }

    // Optional: register on-chain (custodial). If key/RPC not set or tx fails, we still return success.
    const onChain = await registerSubdomainOnChain(entry.label)
    const registeredOnChain = Boolean(onChain.hash)
    if (onChain.error) {
      console.warn("[claim-subdomain] on-chain register failed:", onChain.error)
    }

    return NextResponse.json({
      ensName: entry.ensName,
      label: entry.label,
      registeredOnChain,
      txHash: onChain.hash ?? undefined,
      onChainError: onChain.error ?? undefined,
    })
  } catch (e) {
    console.error("[claim-subdomain]", e)
    return NextResponse.json({ error: "Failed to claim subdomain" }, { status: 500 })
  }
}
