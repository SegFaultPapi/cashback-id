/**
 * Store para subdominios *.cashbackid.eth y preferencias.
 * Persiste en data/ens-store.json cuando hay fs disponible (dev/local);
 * en Vercel/serverless usar DB (Postgres, KV). Datos en memoria como fallback.
 */

const CASHBACKID_PARENT = "cashbackid.eth"

const DATA_DIR = "data"
const STORE_FILE = "ens-store.json"

export interface SubdomainEntry {
  ensName: string
  label: string
  createdAt: string
}

/** suiAddress (lowercase) -> SubdomainEntry */
const subdomainsByAddress = new Map<string, SubdomainEntry>()
/** label (lowercase) -> true si ya está tomado */
const claimedLabels = new Map<string, boolean>()

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

let loaded = false

function normalizeAddress(addr: string): string {
  return (addr || "").toLowerCase().trim()
}

function normalizeLabel(label: string): string {
  return label.toLowerCase().trim().replace(/[^a-z0-9-_]/g, "")
}

function normalizeEnsName(name: string): string {
  return (name || "").toLowerCase().trim()
}

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
 * Carga subdominios y preferencias desde data/ens-store.json (si existe).
 * Solo se ejecuta una vez por proceso. En serverless puede no existir el archivo.
 */
function loadFromFileSync(): void {
  if (loaded) return
  loaded = true
  try {
    const fs = require("fs") as typeof import("fs")
    const path = require("path") as typeof import("path")
    const cwd = process.cwd()
    const filePath = path.join(cwd, DATA_DIR, STORE_FILE)
    if (!fs.existsSync(filePath)) return
    const raw = fs.readFileSync(filePath, "utf-8")
    const data = JSON.parse(raw) as {
      subdomains?: Array<{ address: string; entry: SubdomainEntry }>
      preferences?: Array<{ ensName: string; prefs: StoredPreferences }>
    }
    if (data.subdomains) {
      for (const { address, entry } of data.subdomains) {
        const addr = normalizeAddress(address)
        subdomainsByAddress.set(addr, entry)
        claimedLabels.set(entry.label.toLowerCase(), true)
      }
    }
    if (data.preferences) {
      for (const { ensName, prefs } of data.preferences) {
        const key = normalizeEnsName(ensName)
        if (key.endsWith(".cashbackid.eth")) preferencesByEnsName.set(key, prefs)
      }
    }
  } catch {
    // ignore: no file, no fs, or invalid JSON
  }
}

/**
 * Guarda el estado actual en data/ens-store.json. Mejor esfuerzo; en Vercel no hay write.
 */
export function persistToFile(): void {
  loadFromFileSync()
  try {
    const fs = require("fs") as typeof import("fs")
    const path = require("path") as typeof import("path")
    const cwd = process.cwd()
    const dir = path.join(cwd, DATA_DIR)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const filePath = path.join(dir, STORE_FILE)
    const subdomains = Array.from(subdomainsByAddress.entries()).map(([address, entry]) => ({
      address,
      entry,
    }))
    const preferences = Array.from(preferencesByEnsName.entries()).map(([ensName, prefs]) => ({
      ensName,
      prefs,
    }))
    fs.writeFileSync(filePath, JSON.stringify({ subdomains, preferences }, null, 2), "utf-8")
  } catch {
    // ignore: read-only fs (e.g. Vercel)
  }
}

export function getSubdomain(suiAddress: string): SubdomainEntry | null {
  loadFromFileSync()
  const addr = normalizeAddress(suiAddress)
  return subdomainsByAddress.get(addr) ?? null
}

export function claimSubdomain(
  suiAddress: string,
  preferredLabel?: string
): SubdomainEntry | null {
  loadFromFileSync()
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
  persistToFile()
  return entry
}

export function isLabelAvailable(label: string): boolean {
  loadFromFileSync()
  return !claimedLabels.has(normalizeLabel(label))
}

export function setStoredPreferences(ensName: string, prefs: StoredPreferences): void {
  loadFromFileSync()
  const key = normalizeEnsName(ensName)
  if (!key.endsWith(".cashbackid.eth")) return
  const existing = preferencesByEnsName.get(key) || {}
  preferencesByEnsName.set(key, { ...existing, ...prefs })
  persistToFile()
}

export function getStoredPreferences(ensName: string): StoredPreferences | null {
  loadFromFileSync()
  const key = normalizeEnsName(ensName)
  const prefs = preferencesByEnsName.get(key)
  return prefs && Object.keys(prefs).length > 0 ? prefs : null
}

export function isOurSubdomain(ensName: string): boolean {
  loadFromFileSync()
  const key = normalizeEnsName(ensName)
  if (!key.endsWith(".cashbackid.eth")) return false
  const label = key.slice(0, -".cashbackid.eth".length)
  return claimedLabels.has(label)
}
