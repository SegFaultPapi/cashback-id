/**
 * Store para subdominios *.cashbackid.eth asignados por usuario (Sui address).
 * En producción reemplazar por DB (Postgres, Vercel KV, etc.).
 */

const CASHBACKID_PARENT = "cashbackid.eth"

export interface SubdomainEntry {
  ensName: string
  label: string
  createdAt: string
}

/** suiAddress (lowercase) -> SubdomainEntry */
const subdomainsByAddress = new Map<string, SubdomainEntry>()

/** label (lowercase) -> true si ya está tomado */
const claimedLabels = new Map<string, boolean>()

function normalizeAddress(addr: string): string {
  return (addr || "").toLowerCase().trim()
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "")
}

/**
 * Genera un label único a partir de la dirección Sui (primeros 8 chars del hash).
 */
function suggestLabelFromAddress(suiAddress: string): string {
  const hex = suiAddress.replace(/^0x/, "")
  let hash = 0
  for (let i = 0; i < hex.length; i++) {
    hash = (hash << 5) - hash + hex.charCodeAt(i)
    hash |= 0
  }
  const base = Math.abs(hash).toString(36).slice(0, 8)
  let label = base
  let n = 0
  while (claimedLabels.has(label)) {
    label = `${base}${n}`
    n++
  }
  return label
}

/**
 * Obtiene el subdominio asignado a una dirección Sui.
 */
export function getSubdomain(suiAddress: string): SubdomainEntry | null {
  const addr = normalizeAddress(suiAddress)
  return subdomainsByAddress.get(addr) ?? null
}

/**
 * Asigna un subdominio a la dirección. Si preferredLabel viene, se usa si está libre;
 * si no, se genera uno. Devuelve el entry o null si el label está tomado.
 */
export function claimSubdomain(
  suiAddress: string,
  preferredLabel?: string
): SubdomainEntry | null {
  const addr = normalizeAddress(suiAddress)
  const existing = subdomainsByAddress.get(addr)
  if (existing) return existing

  const label = preferredLabel
    ? normalizeLabel(preferredLabel)
    : suggestLabelFromAddress(addr)

  if (label.length < 3) return null
  if (claimedLabels.has(label)) return null

  const ensName = `${label}.${CASHBACKID_PARENT}`
  const entry: SubdomainEntry = {
    ensName,
    label,
    createdAt: new Date().toISOString(),
  }
  subdomainsByAddress.set(addr, entry)
  claimedLabels.set(label, true)
  return entry
}

/**
 * Comprueba si un label está disponible.
 */
export function isLabelAvailable(label: string): boolean {
  return !claimedLabels.has(normalizeLabel(label))
}

// ---------------------------------------------------------------------------
// Preferencias guardadas para subdominios (hasta que se escriban on-chain)
// ---------------------------------------------------------------------------

export type StoredPreferences = Partial<{
  chainId: number
  asset: string
  pool: string
  suiAddress: string
  threshold: number
  profileId: string
}>

/** ensName (normalized lower) -> preferences */
const preferencesByEnsName = new Map<string, StoredPreferences>()

function normalizeEnsName(name: string): string {
  return (name || "").toLowerCase().trim()
}

export function setStoredPreferences(ensName: string, prefs: StoredPreferences): void {
  const key = normalizeEnsName(ensName)
  if (!key.endsWith(".cashbackid.eth")) return
  const existing = preferencesByEnsName.get(key) || {}
  preferencesByEnsName.set(key, { ...existing, ...prefs })
}

export function getStoredPreferences(ensName: string): StoredPreferences | null {
  const key = normalizeEnsName(ensName)
  const prefs = preferencesByEnsName.get(key)
  return prefs && Object.keys(prefs).length > 0 ? prefs : null
}

/**
 * Comprueba si el nombre es un subdominio nuestro y tenemos entrada en el store.
 */
export function isOurSubdomain(ensName: string): boolean {
  const key = normalizeEnsName(ensName)
  if (!key.endsWith(".cashbackid.eth")) return false
  const label = key.slice(0, -".cashbackid.eth".length)
  return claimedLabels.has(label)
}
