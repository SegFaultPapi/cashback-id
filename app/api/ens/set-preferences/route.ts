import { NextResponse } from "next/server"
import {
  getSubdomain,
  setStoredPreferences,
  type StoredPreferences,
} from "@/lib/ens-subdomain-store"
import { validateSuiAddress } from "@/lib/api-validate"

/**
 * POST /api/ens/set-preferences
 * Guarda preferencias para el subdominio cashbackid.eth del usuario.
 * Body: { suiAddress: string, preferences: { chainId?, asset?, profileId?, ... } }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const suiAddress = typeof body.suiAddress === "string" ? body.suiAddress.trim() : ""
    const preferences = body.preferences && typeof body.preferences === "object" ? body.preferences : {}

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

    const prefs: StoredPreferences = {}
    if (preferences.chainId != null) prefs.chainId = Number(preferences.chainId)
    if (preferences.asset != null) prefs.asset = String(preferences.asset)
    if (preferences.pool != null) prefs.pool = String(preferences.pool)
    if (preferences.suiAddress != null) prefs.suiAddress = String(preferences.suiAddress)
    if (preferences.threshold != null) prefs.threshold = Number(preferences.threshold)
    if (preferences.profileId != null) prefs.profileId = String(preferences.profileId)

    setStoredPreferences(entry.ensName, prefs)

    return NextResponse.json({ ensName: entry.ensName, saved: true })
  } catch (e) {
    console.error("[set-preferences]", e)
    return NextResponse.json({ error: "Failed to save preferences" }, { status: 500 })
  }
}
