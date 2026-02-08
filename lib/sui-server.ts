/**
 * Sui server-side client and keypair for API routes.
 * Used by /api/create-profile and /api/pay (pattern from Hackmoney).
 * Requires SUI_PRIVATE_KEY (base64) and NEXT_PUBLIC_CASHBACK_PACKAGE_ID.
 */

import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"

const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as
  | "mainnet"
  | "testnet"
  | "devnet"

let _serverClient: SuiJsonRpcClient | null = null

export function getServerSuiClient(): SuiJsonRpcClient {
  if (!_serverClient) {
    _serverClient = new SuiJsonRpcClient({
      url: process.env.NEXT_PUBLIC_SUI_RPC_URL || getJsonRpcFullnodeUrl(SUI_NETWORK),
      network: SUI_NETWORK,
    })
  }
  return _serverClient
}

/**
 * Builds an Ed25519 keypair from SUI_PRIVATE_KEY (base64).
 * Handles 33-byte format (first byte = 0) as in Hackmoney.
 */
export function getServerKeypair(): Ed25519Keypair {
  const raw = process.env.SUI_PRIVATE_KEY
  if (!raw) throw new Error("SUI_PRIVATE_KEY is not set")
  const bytes = new Uint8Array(Buffer.from(raw, "base64"))
  const secretKey = bytes.length === 33 && bytes[0] === 0 ? bytes.slice(1) : bytes
  return Ed25519Keypair.fromSecretKey(secretKey)
}

/** Default: GA-Asso/Hackmoney sui package on testnet (sui/Published.toml). */
export function getCashbackPackageId(): string {
  return (
    process.env.NEXT_PUBLIC_CASHBACK_PACKAGE_ID ||
    process.env.CASHBACK_PACKAGE_ID ||
    "0xbdabfb7fb7822e83b2d8ba86d211347812bb3a6d454f64828ea3c17453f4e9aa"
  )
}
