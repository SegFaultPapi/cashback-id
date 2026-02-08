/**
 * ENS Text Record Resolver for Cashback ID
 *
 * Reads and writes Custom Text Records from a user's ENS name.
 * These records store DeFi patterns and payment preferences:
 *   - cashbackid.chain     → Preferred destination chain ID (e.g. "8453" for Base)
 *   - cashbackid.asset     → Preferred payout asset (e.g. "usdc.tkn.eth")
 *   - cashbackid.pool      → Auto-invest pool preference
 *   - cashbackid.sui       → Sui address for settlement
 *   - cashbackid.threshold → Min amount before cross-chain sweep
 *
 * Architecture:
 *   ENS Name → Custom Text Records → LI.FI reads → Cross-chain execution
 */

import {
  createPublicClient,
  http,
  type PublicClient,
  type Address,
  namehash,
  encodeFunctionData,
} from "viem"
import { mainnet } from "viem/chains"
import { normalize } from "viem/ens"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CashbackPreferences {
  /** Destination chain ID (e.g. 8453 for Base, 101 for Sui) */
  chainId: number | null
  /** Preferred payout asset ENS-style (e.g. "usdc.tkn.eth") or address */
  asset: string | null
  /** Auto-invest pool id */
  pool: string | null
  /** Sui address for final settlement */
  suiAddress: string | null
  /** Minimum threshold (in USD) before sweeping cross-chain */
  threshold: number | null
  /** Sui CashbackProfile object ID — para que quien pague a este ENS sepa a qué perfil acreditar */
  profileId: string | null
  /** Raw ENS name */
  ensName: string
}

/** Keys we write/read under the ENS text records */
export const ENS_RECORD_KEYS = {
  chain: "cashbackid.chain",
  asset: "cashbackid.asset",
  pool: "cashbackid.pool",
  sui: "cashbackid.sui",
  threshold: "cashbackid.threshold",
  profileId: "cashbackid.profile_id",
} as const

// ---------------------------------------------------------------------------
// Chain Registry (chains we support for cashback routing)
// ---------------------------------------------------------------------------

export const SUPPORTED_CHAINS: Record<number, { name: string; logo: string; color: string }> = {
  1: { name: "Ethereum", logo: "ETH", color: "#627EEA" },
  10: { name: "Optimism", logo: "OP", color: "#FF0420" },
  137: { name: "Polygon", logo: "MATIC", color: "#8247E5" },
  8453: { name: "Base", logo: "BASE", color: "#0052FF" },
  42161: { name: "Arbitrum", logo: "ARB", color: "#28A0F0" },
  101: { name: "Sui", logo: "SUI", color: "#4DA2FF" },
}

export const SUPPORTED_ASSETS: Record<string, { symbol: string; name: string; decimals: number }> = {
  "usdc.tkn.eth": { symbol: "USDC", name: "USD Coin", decimals: 6 },
  "usdt.tkn.eth": { symbol: "USDT", name: "Tether", decimals: 6 },
  "dai.tkn.eth": { symbol: "DAI", name: "Dai", decimals: 18 },
  "weth.tkn.eth": { symbol: "WETH", name: "Wrapped Ether", decimals: 18 },
  "sui": { symbol: "SUI", name: "Sui", decimals: 9 },
}

// ---------------------------------------------------------------------------
// Public Client (read-only, mainnet for ENS resolution)
// ---------------------------------------------------------------------------

let _publicClient: PublicClient | null = null

function getPublicClient(): PublicClient {
  if (!_publicClient) {
    _publicClient = createPublicClient({
      chain: mainnet,
      transport: http(
        process.env.NEXT_PUBLIC_ETH_RPC_URL ||
          "https://eth-mainnet.g.alchemy.com/v2/demo"
      ),
    }) as PublicClient
  }
  return _publicClient
}

// ---------------------------------------------------------------------------
// Read: Resolve ENS → Cashback Preferences
// ---------------------------------------------------------------------------

/**
 * Resolves a `.eth` name and reads all cashbackid.* text records.
 * Returns structured preferences that LI.FI and the UI can consume.
 */
export async function resolvePaymentPreferences(
  ensName: string
): Promise<CashbackPreferences> {
  const client = getPublicClient()
  const normalizedName = normalize(ensName)

  // Read all custom text records in parallel
  const [chainRaw, asset, pool, suiAddress, thresholdRaw, profileId] = await Promise.all([
    client.getEnsText({ name: normalizedName, key: ENS_RECORD_KEYS.chain }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: ENS_RECORD_KEYS.asset }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: ENS_RECORD_KEYS.pool }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: ENS_RECORD_KEYS.sui }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: ENS_RECORD_KEYS.threshold }).catch(() => null),
    client.getEnsText({ name: normalizedName, key: ENS_RECORD_KEYS.profileId }).catch(() => null),
  ])

  return {
    chainId: chainRaw ? parseInt(chainRaw, 10) : null,
    asset: asset || null,
    pool: pool || null,
    suiAddress: suiAddress || null,
    threshold: thresholdRaw ? parseFloat(thresholdRaw) : null,
    profileId: profileId || null,
    ensName: normalizedName,
  }
}

/**
 * Resolves an ENS name to its Ethereum address.
 */
export async function resolveEnsAddress(ensName: string): Promise<Address | null> {
  const client = getPublicClient()
  try {
    const address = await client.getEnsAddress({ name: normalize(ensName) })
    return address
  } catch {
    return null
  }
}

/**
 * Reverse-resolves an Ethereum address to its primary ENS name.
 */
export async function resolveEnsName(address: Address): Promise<string | null> {
  const client = getPublicClient()
  try {
    const name = await client.getEnsName({ address })
    return name
  } catch {
    return null
  }
}

/**
 * Gets the ENS avatar for a name.
 */
export async function resolveEnsAvatar(ensName: string): Promise<string | null> {
  const client = getPublicClient()
  try {
    const avatar = await client.getEnsAvatar({ name: normalize(ensName) })
    return avatar
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Write: Build transaction data for setting ENS Text Records
// ---------------------------------------------------------------------------

/** ABI for ENS PublicResolver setText */
const RESOLVER_SET_TEXT_ABI = [
  {
    name: "setText",
    type: "function",
    inputs: [
      { name: "node", type: "bytes32" },
      { name: "key", type: "string" },
      { name: "value", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    name: "multicall",
    type: "function",
    inputs: [{ name: "data", type: "bytes[]" }],
    outputs: [{ name: "results", type: "bytes[]" }],
    stateMutability: "nonpayable",
  },
] as const

/** Default ENS Public Resolver on mainnet */
const ENS_PUBLIC_RESOLVER = "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63" as Address

/** Parent ENS name for Cashback ID subdomains (e.g. alice.cashbackid.eth). Must be owned and wrapped to create subdomains. */
export const CASHBACKID_ENS_PARENT = "cashbackid.eth"

/**
 * Builds the calldata for a multicall that sets all cashbackid.* text records
 * on the user's ENS name in a single transaction.
 *
 * This can be sent through a Safe for multi-sig or directly from an EOA.
 */
export function buildSetPreferencesTx(
  ensName: string,
  preferences: Partial<Omit<CashbackPreferences, "ensName">>
): { to: Address; data: `0x${string}` } {
  const node = namehash(normalize(ensName))

  // Build individual setText calldata entries
  const calls: `0x${string}`[] = []

  if (preferences.chainId !== undefined) {
    calls.push(
      encodeFunctionData({
        abi: RESOLVER_SET_TEXT_ABI,
        functionName: "setText",
        args: [node, ENS_RECORD_KEYS.chain, String(preferences.chainId)],
      })
    )
  }

  if (preferences.asset !== undefined) {
    calls.push(
      encodeFunctionData({
        abi: RESOLVER_SET_TEXT_ABI,
        functionName: "setText",
        args: [node, ENS_RECORD_KEYS.asset, preferences.asset || ""],
      })
    )
  }

  if (preferences.pool !== undefined) {
    calls.push(
      encodeFunctionData({
        abi: RESOLVER_SET_TEXT_ABI,
        functionName: "setText",
        args: [node, ENS_RECORD_KEYS.pool, preferences.pool || ""],
      })
    )
  }

  if (preferences.suiAddress !== undefined) {
    calls.push(
      encodeFunctionData({
        abi: RESOLVER_SET_TEXT_ABI,
        functionName: "setText",
        args: [node, ENS_RECORD_KEYS.sui, preferences.suiAddress || ""],
      })
    )
  }

  if (preferences.threshold !== undefined) {
    calls.push(
      encodeFunctionData({
        abi: RESOLVER_SET_TEXT_ABI,
        functionName: "setText",
        args: [node, ENS_RECORD_KEYS.threshold, String(preferences.threshold ?? "")],
      })
    )
  }

  if (preferences.profileId !== undefined) {
    calls.push(
      encodeFunctionData({
        abi: RESOLVER_SET_TEXT_ABI,
        functionName: "setText",
        args: [node, ENS_RECORD_KEYS.profileId, preferences.profileId || ""],
      })
    )
  }

  // Wrap in multicall for a single tx
  const data = encodeFunctionData({
    abi: RESOLVER_SET_TEXT_ABI,
    functionName: "multicall",
    args: [calls],
  })

  return {
    to: ENS_PUBLIC_RESOLVER,
    data,
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Validates that an ENS name looks correct (ends in .eth, non-empty label).
 * Accepts both primary names (alice.eth) and subdomains (alice.cashbackid.eth).
 */
export function isValidEnsName(name: string): boolean {
  if (!name || !name.endsWith(".eth")) return false
  const label = name.slice(0, -4)
  return label.length >= 3
}

/**
 * Returns true if the ENS name is a Cashback ID subdomain (e.g. alice.cashbackid.eth).
 */
export function isCashbackIdSubdomain(name: string): boolean {
  if (!name || typeof name !== "string") return false
  const normalized = name.toLowerCase().trim()
  return normalized.endsWith(`.${CASHBACKID_ENS_PARENT}`)
}

/**
 * Extracts the subdomain label from a *.cashbackid.eth name (e.g. "alice" from "alice.cashbackid.eth").
 * Returns null if the name is not a cashbackid subdomain.
 */
export function getCashbackIdSubdomainLabel(name: string): string | null {
  if (!isCashbackIdSubdomain(name)) return null
  const normalized = name.toLowerCase().trim()
  const suffix = `.${CASHBACKID_ENS_PARENT}`
  const label = normalized.slice(0, -suffix.length)
  return label.length >= 3 ? label : null
}

/**
 * Formats preferences into a human-readable summary for the UI.
 */
export function formatPreferencesSummary(prefs: CashbackPreferences): string {
  const parts: string[] = []

  if (prefs.chainId && SUPPORTED_CHAINS[prefs.chainId]) {
    parts.push(`Chain: ${SUPPORTED_CHAINS[prefs.chainId].name}`)
  }

  if (prefs.asset && SUPPORTED_ASSETS[prefs.asset]) {
    parts.push(`Asset: ${SUPPORTED_ASSETS[prefs.asset].symbol}`)
  }

  if (prefs.pool) {
    parts.push(`Pool: ${prefs.pool}`)
  }

  if (prefs.threshold) {
    parts.push(`Min sweep: $${prefs.threshold}`)
  }

  return parts.length > 0 ? parts.join(" | ") : "No preferences configured"
}
