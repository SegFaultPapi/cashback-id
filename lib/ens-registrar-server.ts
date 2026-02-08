/**
 * Server-only: register *.cashbackid.eth subdomains on-chain (custodial).
 * Uses registerFor(label, backendAddress) so the app holds all subdomains;
 * the link to the user is in the store (suiAddress → ensName).
 *
 * Requires:
 *   - ETH_REGISTRAR_OWNER_PRIVATE_KEY or PRIVATE_KEY (hex, with 0x) = owner of CashbackIdRegistrar
 *   - ETH_RPC_URL or NEXT_PUBLIC_ETH_RPC_URL = Ethereum mainnet RPC for sending txs
 * That wallet must have ETH for gas. Same key used to deploy the contract is the owner.
 */

import { createWalletClient, http, type Address } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { mainnet } from "viem/chains"
import { ENS_REGISTRAR_ADDRESS } from "@/lib/ens-resolver"

/** ABI del CashbackIdRegistrar + errores del Name Wrapper que pueden hacer revert. */
const REGISTRAR_ABI = [
  {
    name: "registerFor",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "label", type: "string", internalType: "string" },
      { name: "registrant", type: "address", internalType: "address" },
    ],
    outputs: [{ name: "node", type: "bytes32", internalType: "bytes32" }],
  },
  // Errores del CashbackIdRegistrar
  { type: "error" as const, name: "OnlyOwner", inputs: [] },
  { type: "error" as const, name: "LabelEmpty", inputs: [] },
  { type: "error" as const, name: "LabelInvalid", inputs: [] },
  // Errores del Name Wrapper
  {
    type: "error" as const,
    name: "Unauthorised",
    inputs: [
      { name: "node", type: "bytes32", internalType: "bytes32" },
      { name: "addr", type: "address", internalType: "address" },
    ],
  },
  {
    type: "error" as const,
    name: "OperationProhibited",
    inputs: [{ name: "node", type: "bytes32", internalType: "bytes32" }],
  },
] as const

function getRegistrarOwnerKey(): `0x${string}` | null {
  const raw =
    process.env.ETH_REGISTRAR_OWNER_PRIVATE_KEY ?? process.env.PRIVATE_KEY
  if (!raw || typeof raw !== "string") return null
  const key = raw.trim().startsWith("0x") ? raw.trim() : `0x${raw.trim()}`
  if (key.length !== 66) return null
  return key as `0x${string}`
}

function getEthRpcUrl(): string {
  return (
    process.env.ETH_RPC_URL ||
    process.env.NEXT_PUBLIC_ETH_RPC_URL ||
    "https://eth-mainnet.g.alchemy.com/v2/demo"
  )
}

export type RegistrarStatus = {
  keyConfigured: boolean
  keySource: "PRIVATE_KEY" | "ETH_REGISTRAR_OWNER_PRIVATE_KEY" | null
  keyValid: boolean
  rpcConfigured: boolean
  rpcSource: "ETH_RPC_URL" | "NEXT_PUBLIC_ETH_RPC_URL" | "default"
  walletAddress: string | null
  ready: boolean
}

/**
 * Estado del registrar on-chain (para logs y /api/ens/registrar-status).
 * No expone la clave ni el RPC completo.
 */
export function getRegistrarStatus(): RegistrarStatus {
  const keyRaw =
    process.env.ETH_REGISTRAR_OWNER_PRIVATE_KEY ?? process.env.PRIVATE_KEY
  const keyConfigured = Boolean(keyRaw && typeof keyRaw === "string")
  const keySource = keyConfigured
    ? process.env.ETH_REGISTRAR_OWNER_PRIVATE_KEY
      ? "ETH_REGISTRAR_OWNER_PRIVATE_KEY"
      : "PRIVATE_KEY"
    : null
  const key = getRegistrarOwnerKey()
  const keyValid = key !== null
  let walletAddress: string | null = null
  if (key) {
    try {
      walletAddress = privateKeyToAccount(key as `0x${string}`).address
    } catch {
      walletAddress = null
    }
  }
  const hasRpcEnv = Boolean(
    process.env.ETH_RPC_URL || process.env.NEXT_PUBLIC_ETH_RPC_URL
  )
  const rpcSource = process.env.ETH_RPC_URL
    ? "ETH_RPC_URL"
    : process.env.NEXT_PUBLIC_ETH_RPC_URL
      ? "NEXT_PUBLIC_ETH_RPC_URL"
      : "default"
  return {
    keyConfigured,
    keySource,
    keyValid,
    rpcConfigured: hasRpcEnv,
    rpcSource,
    walletAddress,
    ready: keyValid && hasRpcEnv,
  }
}

/**
 * Returns the Ethereum address used as registrar owner (and custodial registrant).
 * Null if no key is configured.
 */
export function getRegistrarOwnerAddress(): Address | null {
  const key = getRegistrarOwnerKey()
  if (!key) return null
  try {
    const account = privateKeyToAccount(key as `0x${string}`)
    return account.address
  } catch {
    return null
  }
}

/**
 * Registers label.cashbackid.eth on-chain and assigns it to the backend wallet (custodial).
 * Call this from API routes only (uses server env).
 *
 * @returns { hash } tx hash on success
 * @returns { error } message on failure
 */
export async function registerSubdomainOnChain(
  label: string
): Promise<{ hash?: `0x${string}`; error?: string }> {
  const status = getRegistrarStatus()
  console.log("[ENS registrar] status:", {
    keyConfigured: status.keyConfigured,
    keySource: status.keySource,
    keyValid: status.keyValid,
    rpcConfigured: status.rpcConfigured,
    rpcSource: status.rpcSource,
    walletAddress: status.walletAddress,
    ready: status.ready,
  })

  if (!status.ready) {
    if (!status.keyConfigured) {
      console.warn("[ENS registrar] PRIVATE_KEY / ETH_REGISTRAR_OWNER_PRIVATE_KEY not set")
      return { error: "ETH_REGISTRAR_OWNER_PRIVATE_KEY or PRIVATE_KEY not set" }
    }
    if (!status.keyValid) {
      console.warn("[ENS registrar] Private key invalid (must be 0x + 64 hex chars)")
      return { error: "Invalid private key format (expected 0x + 64 hex)" }
    }
    if (!status.rpcConfigured) {
      console.warn("[ENS registrar] ETH_RPC_URL / NEXT_PUBLIC_ETH_RPC_URL not set (using default demo RPC, may rate-limit)")
    }
  }

  const key = getRegistrarOwnerKey()
  if (!key) {
    return { error: "ETH_REGISTRAR_OWNER_PRIVATE_KEY or PRIVATE_KEY not set" }
  }

  const account = privateKeyToAccount(key as `0x${string}`)
  const backendAddress = account.address
  const rpcUrl = getEthRpcUrl()
  console.log("[ENS registrar] registerFor", { label, walletAddress: backendAddress, rpcHint: rpcUrl.slice(0, 30) + "..." })

  const client = createWalletClient({
    account,
    chain: mainnet,
    transport: http(rpcUrl),
  })

  try {
    const hash = await client.writeContract({
      address: ENS_REGISTRAR_ADDRESS,
      abi: REGISTRAR_ABI,
      functionName: "registerFor",
      args: [label, backendAddress],
    })
    console.log("[ENS registrar] tx sent:", hash)
    return { hash }
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.warn("[ENS registrar] tx failed:", message)
    // Name Wrapper reverte con Unauthorised(bytes32,address) (0xb455aae8) si el registrar no está aprobado
    if (message.includes("0xb455aae8") || message.includes("Unauthorised")) {
      return {
        error:
          "Name Wrapper: Unauthorised. El dueño del nombre cashbackid.eth (wrapped) debe llamar setApprovalForAll(registrar, true) en el Name Wrapper (0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401). Registrar: " +
          ENS_REGISTRAR_ADDRESS,
      }
    }
    if (message.includes("0xa2a72013") || message.includes("OperationProhibited")) {
      return {
        error:
          "Name Wrapper: OperationProhibited. El subdominio puede que ya exista on-chain; prueba con otro label (ej. pumatest4).",
      }
    }
    return { error: message }
  }
}
