import { NextResponse } from "next/server"
import {
  getSubdomain,
  setStoredPreferences,
  isOurSubdomain,
  type StoredPreferences,
} from "@/lib/ens-subdomain-store"
import { validateSuiAddress } from "@/lib/api-validate"

/**
 * POST /api/ens/set-preferences
 * Guarda preferencias para el subdominio cashbackid.eth del usuario.
 * Body: { ensName?: string, suiAddress?: string, preferences: { chainId?, asset?, profileId?, ... } }
 * If ensName is provided and is a claimed subdomain, save by ENS name (works even if wallet address changed).
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const ensName = typeof body.ensName === "string" ? body.ensName.trim().toLowerCase() : ""
    const suiAddress = typeof body.suiAddress === "string" ? body.suiAddress.trim() : ""
    const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences : {}

    let targetEnsName: string | null = null

    if (ensName && ensName.endsWith(".cashbackid.eth") && isOurSubdomain(ensName)) {
      targetEnsName = ensName
    } else if (suiAddress) {
      const addrCheck = validateSuiAddress(suiAddress)
      if (!addrCheck.ok) {
        return NextResponse.json({ error: addrCheck.error }, { status: 400 })
      }
      const entry = getSubdomain(suiAddress)
      if (!entry) {
        return NextResponse.json(
          { error: "No subdomain claimed for this address. Claim one first." },
          { status: 404 }
        )
      }
      targetEnsName = entry.ensName
    }

    if (!targetEnsName) {
      return NextResponse.json(
        { error: "Provide ensName (your subdomain) or suiAddress to save preferences." },
        { status: 400 }
      )
    }

    const prefs: StoredPreferences = {}
    if (preferences.chainId != null) prefs.chainId = Number(preferences.chainId)
    if (preferences.asset != null) prefs.asset = String(preferences.asset)
    if (preferences.pool != null) prefs.pool = String(preferences.pool)
    if (preferences.suiAddress != null) prefs.suiAddress = String(preferences.suiAddress)
    if (preferences.threshold != null) prefs.threshold = Number(preferences.threshold)
    if (preferences.profileId != null) prefs.profileId = String(preferences.profileId)

    setStoredPreferences(targetEnsName, prefs)

    return NextResponse.json({ ensName: targetEnsName, saved: true })
  } catch (e) {
    console.error("[set-preferences]", e)
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}
