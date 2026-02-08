import { NextResponse } from "next/server"
import { getStoredPreferences, isOurSubdomain } from "@/lib/ens-subdomain-store"

/**
 * GET /api/ens/resolve?name=alice.cashbackid.eth
 * Resuelve un subdominio cashbackid.eth a las preferencias guardadas.
 * Usado por /pay para obtener profileId cuando el destinatario es un subdominio nuestro.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    if (!name || !name.trim()) {
      return NextResponse.json({ error: "name is required" }, { status: 400 })
    }

    const normalized = name.trim().toLowerCase()
    if (!normalized.endsWith(".cashbackid.eth")) {
      return NextResponse.json(
        { error: "Only cashbackid.eth subdomains can be resolved here" },
        { status: 400 }
      )
    }

    if (!isOurSubdomain(normalized)) {
      return NextResponse.json({ error: "Subdomain not found" }, { status: 404 })
    }

    const prefs = getStoredPreferences(normalized)
    if (!prefs) {
      return NextResponse.json(
        { error: "No preferences set for this subdomain" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      ensName: normalized,
      chainId: prefs.chainId ?? null,
      asset: prefs.asset ?? null,
      pool: prefs.pool ?? null,
      suiAddress: prefs.suiAddress ?? null,
      threshold: prefs.threshold ?? null,
      profileId: prefs.profileId ?? null,
    })
  } catch (e) {
    console.error("[ens/resolve]", e)
    return NextResponse.json({ error: "Resolve failed" }, { status: 500 })
  }
}
