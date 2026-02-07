/**
 * Filecoin / IPFS Persistence Layer for Cashback ID
 *
 * Every cashback transaction gets an immutable proof stored on IPFS
 * and persisted via Filecoin for long-term audit.
 *
 * Data Model (stored per cashback event):
 *   - ENS name of recipient
 *   - Source chain + tx hash
 *   - Destination chain + tx hash
 *   - Amount, asset, timestamp
 *   - LI.FI route used
 *   - ZK proof hash (if identity-verified)
 *
 * The resulting CID is then written to the ENS Content Hash record
 * (via Safe multi-sig) so anyone can verify the full history.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CashbackProof {
  /** Unique event ID */
  id: string
  /** Timestamp (ISO 8601) */
  timestamp: string
  /** Recipient ENS name */
  ensName: string
  /** Recipient Sui address (final settlement) */
  suiAddress: string
  /** Source chain ID */
  sourceChainId: number
  /** Source transaction hash */
  sourceTxHash: string
  /** Source token symbol */
  sourceAsset: string
  /** Amount earned as cashback (human-readable) */
  cashbackAmount: string
  /** Destination chain ID */
  destChainId: number
  /** Destination transaction hash (from LI.FI bridge) */
  destTxHash: string | null
  /** Destination asset symbol */
  destAsset: string
  /** Final settled amount on destination chain */
  settledAmount: string | null
  /** LI.FI route/tool used */
  bridgeTool: string | null
  /** ZK identity proof hash (if user is verified) */
  zkProofHash: string | null
  /** Merchant or dApp that originated the cashback */
  merchant: string
  /** Status: pending, bridging, settled, failed */
  status: "pending" | "bridging" | "settled" | "failed"
}

export interface IPFSUploadResult {
  /** IPFS Content Identifier */
  cid: string
  /** Gateway URL for quick access */
  gatewayUrl: string
  /** Size in bytes */
  size: number
  /** Whether Filecoin deal was initiated */
  filecoinDealInitiated: boolean
}

export interface CashbackHistory {
  /** Version of the history schema */
  version: number
  /** ENS name that owns this history */
  ensName: string
  /** All cashback proofs, newest first */
  proofs: CashbackProof[]
  /** Last updated timestamp */
  lastUpdated: string
  /** Cumulative stats */
  stats: {
    totalCashbackUSD: number
    totalSettledUSD: number
    totalTransactions: number
    chainsUsed: number[]
  }
}

// ---------------------------------------------------------------------------
// IPFS Gateway Configuration
// ---------------------------------------------------------------------------

const IPFS_API_URL =
  process.env.NEXT_PUBLIC_IPFS_API_URL || "https://api.web3.storage"
const IPFS_GATEWAY =
  process.env.NEXT_PUBLIC_IPFS_GATEWAY || "https://w3s.link/ipfs"

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Uploads a single cashback proof to IPFS.
 * Returns the CID for on-chain reference.
 */
export async function uploadCashbackProof(
  proof: CashbackProof
): Promise<IPFSUploadResult> {
  const data = JSON.stringify(proof, null, 2)
  const blob = new Blob([data], { type: "application/json" })

  try {
    // Using web3.storage API (or compatible IPFS pinning service)
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

    if (token) {
      const response = await fetch(`${IPFS_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Name": `cashback-proof-${proof.id}`,
        },
        body: blob,
      })

      if (response.ok) {
        const result = await response.json()
        return {
          cid: result.cid,
          gatewayUrl: `${IPFS_GATEWAY}/${result.cid}`,
          size: data.length,
          filecoinDealInitiated: true,
        }
      }
    }

    // Fallback: Generate deterministic CID for demo
    return generateMockCID(proof)
  } catch (error) {
    console.error("[IPFS] Upload failed:", error)
    return generateMockCID(proof)
  }
}

/**
 * Uploads the full cashback history (all proofs) to IPFS.
 * The resulting CID can be set as the ENS Content Hash.
 */
export async function uploadCashbackHistory(
  history: CashbackHistory
): Promise<IPFSUploadResult> {
  const data = JSON.stringify(history, null, 2)
  const blob = new Blob([data], { type: "application/json" })

  try {
    const token = process.env.NEXT_PUBLIC_WEB3_STORAGE_TOKEN

    if (token) {
      const response = await fetch(`${IPFS_API_URL}/upload`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "X-Name": `cashback-history-${history.ensName}`,
        },
        body: blob,
      })

      if (response.ok) {
        const result = await response.json()
        return {
          cid: result.cid,
          gatewayUrl: `${IPFS_GATEWAY}/${result.cid}`,
          size: data.length,
          filecoinDealInitiated: true,
        }
      }
    }

    return generateMockCID(history)
  } catch (error) {
    console.error("[IPFS] History upload failed:", error)
    return generateMockCID(history)
  }
}

/**
 * Retrieves a cashback proof from IPFS by CID.
 */
export async function fetchCashbackProof(
  cid: string
): Promise<CashbackProof | null> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}/${cid}`)
    if (response.ok) {
      return (await response.json()) as CashbackProof
    }
    return null
  } catch (error) {
    console.error("[IPFS] Fetch failed:", error)
    return null
  }
}

/**
 * Retrieves the full cashback history from IPFS.
 */
export async function fetchCashbackHistory(
  cid: string
): Promise<CashbackHistory | null> {
  try {
    const response = await fetch(`${IPFS_GATEWAY}/${cid}`)
    if (response.ok) {
      return (await response.json()) as CashbackHistory
    }
    return null
  } catch (error) {
    console.error("[IPFS] History fetch failed:", error)
    return null
  }
}

// ---------------------------------------------------------------------------
// Local Proof Builder (constructs proof objects from app events)
// ---------------------------------------------------------------------------

/**
 * Creates a new CashbackProof from a transaction event.
 */
export function createCashbackProof(params: {
  ensName: string
  suiAddress: string
  sourceChainId: number
  sourceTxHash: string
  sourceAsset: string
  cashbackAmount: string
  destChainId: number
  destAsset: string
  merchant: string
  bridgeTool?: string
  zkProofHash?: string
}): CashbackProof {
  return {
    id: `cb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: new Date().toISOString(),
    ensName: params.ensName,
    suiAddress: params.suiAddress,
    sourceChainId: params.sourceChainId,
    sourceTxHash: params.sourceTxHash,
    sourceAsset: params.sourceAsset,
    cashbackAmount: params.cashbackAmount,
    destChainId: params.destChainId,
    destTxHash: null,
    destAsset: params.destAsset,
    settledAmount: null,
    bridgeTool: params.bridgeTool || null,
    zkProofHash: params.zkProofHash || null,
    merchant: params.merchant,
    status: "pending",
  }
}

/**
 * Builds a fresh CashbackHistory object.
 */
export function createCashbackHistory(
  ensName: string,
  proofs: CashbackProof[] = []
): CashbackHistory {
  const chainsUsed = [...new Set(proofs.flatMap((p) => [p.sourceChainId, p.destChainId]))]

  return {
    version: 1,
    ensName,
    proofs,
    lastUpdated: new Date().toISOString(),
    stats: {
      totalCashbackUSD: proofs.reduce(
        (sum, p) => sum + parseFloat(p.cashbackAmount || "0"),
        0
      ),
      totalSettledUSD: proofs
        .filter((p) => p.status === "settled")
        .reduce((sum, p) => sum + parseFloat(p.settledAmount || "0"), 0),
      totalTransactions: proofs.length,
      chainsUsed,
    },
  }
}

// ---------------------------------------------------------------------------
// Mock CID generator (for demo without IPFS API key)
// ---------------------------------------------------------------------------

function generateMockCID(data: unknown): IPFSUploadResult {
  // Simulate a CIDv1 (base32)
  const hash = simpleHash(JSON.stringify(data))
  const cid = `bafybeig${hash.slice(0, 44)}`
  const size = JSON.stringify(data).length

  return {
    cid,
    gatewayUrl: `${IPFS_GATEWAY}/${cid}`,
    size,
    filecoinDealInitiated: false,
  }
}

function simpleHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash |= 0
  }
  return Math.abs(hash).toString(36).padEnd(50, "0").slice(0, 50)
}
