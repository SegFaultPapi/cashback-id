/**
 * Validación ligera para las APIs del backend.
 */

/** Sui address: 0x + 64 hex chars (32 bytes) */
export function isValidSuiAddress(addr: string): boolean {
  if (!addr || typeof addr !== "string") return false
  const s = addr.trim()
  if (!s.startsWith("0x")) return false
  const hex = s.slice(2)
  return hex.length === 64 && /^[a-fA-F0-9]+$/.test(hex)
}

/** Sui object ID: mismo formato que address */
export function isValidSuiObjectId(id: string): boolean {
  return isValidSuiAddress(id)
}

export function validateSuiAddress(addr: string): { ok: true } | { ok: false; error: string } {
  if (!addr?.trim()) return { ok: false, error: "suiAddress is required" }
  if (!isValidSuiAddress(addr)) return { ok: false, error: "Invalid Sui address format (expected 0x + 64 hex)" }
  return { ok: true }
}

export function validateProfileId(profileId: string): { ok: true } | { ok: false; error: string } {
  if (!profileId?.trim()) return { ok: false, error: "profileId is required" }
  if (!isValidSuiObjectId(profileId)) return { ok: false, error: "Invalid profileId (expected Sui object ID: 0x + 64 hex)" }
  return { ok: true }
}

/** Accepts amount in SUI (decimal) or MIST (integer). Returns value in MIST (bigint). */
export function validateAmount(amount: unknown): { ok: true; value: bigint } | { ok: false; error: string } {
  if (amount == null || amount === "") return { ok: false, error: "amount is required" }
  const n = Number(amount)
  if (Number.isNaN(n)) return { ok: false, error: "amount must be a number" }
  if (n <= 0) return { ok: false, error: "amount must be greater than 0" }
  try {
    const isDecimal = typeof amount === "string" && amount.includes(".")
    const value = isDecimal ? BigInt(Math.floor(n * 1_000_000_000)) : BigInt(Math.floor(n))
    if (value <= 0n) return { ok: false, error: "amount must be greater than 0" }
    return { ok: true, value }
  } catch {
    return { ok: false, error: "amount is invalid" }
  }
}
