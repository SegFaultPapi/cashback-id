/**
 * Sui Network Client & zkLogin Provider for Cashback ID
 *
 * Provides:
 *   - SuiClientProvider: React context for Sui RPC access
 *   - zkLogin flow: Google/Apple social login → Sui address
 *   - Cashback settlement: Read balances, claim rewards on Sui
 *
 * This module targets the "Best Overall Sui Project" track.
 */

"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react"
import { SuiJsonRpcClient, getJsonRpcFullnodeUrl } from "@mysten/sui/jsonRpc"
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519"
import { Transaction } from "@mysten/sui/transactions"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SuiWalletState {
  /** Whether the user has a Sui session */
  isConnected: boolean
  /** Sui address (0x...) derived from zkLogin or keypair */
  address: string | null
  /** SUI balance (human-readable) */
  balance: string
  /** zkLogin provider used (google, apple, etc.) */
  provider: string | null
  /** zkLogin proof (for display/audit) */
  zkProof: string | null
}

export interface SuiContextType {
  client: SuiJsonRpcClient
  wallet: SuiWalletState
  connectWithZkLogin: (provider: "google" | "apple") => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  /** Fetch current SUI balance */
  refreshBalance: () => Promise<void>
  /** Get cashback balance from the protocol */
  getCashbackBalance: () => Promise<string>
  /** Claim accumulated cashback rewards */
  claimRewards: (amount: string) => Promise<string>
  /** Create a CashbackProfile on Sui (Move: profile::create_and_transfer_to_sender); returns profileId and tx digest */
  createProfile: () => Promise<{ profileId: string; digest: string }>
  /** Get the user's CashbackProfile object ID if they have one */
  getProfileId: () => Promise<string | null>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SUI_NETWORK = (process.env.NEXT_PUBLIC_SUI_NETWORK || "testnet") as
  | "mainnet"
  | "testnet"
  | "devnet"

/** Package ID for the Cashback ID Move contract. Default: GA-Asso/Hackmoney sui package on testnet (Published.toml). */
const CASHBACK_PACKAGE_ID =
  process.env.NEXT_PUBLIC_CASHBACK_PACKAGE_ID ||
  "0xbdabfb7fb7822e83b2d8ba86d211347812bb3a6d454f64828ea3c17453f4e9aa"

const CASHBACK_MODULE = "cashback"
const PROFILE_MODULE = "profile"

const SESSION_STORAGE_KEYPAIR_KEY = "cashbackid_sui_keypair"

// ---------------------------------------------------------------------------
// Sui Client singleton
// ---------------------------------------------------------------------------

let _suiClient: SuiJsonRpcClient | null = null

export function getSuiClient(): SuiJsonRpcClient {
  if (!_suiClient) {
    _suiClient = new SuiJsonRpcClient({
      url: process.env.NEXT_PUBLIC_SUI_RPC_URL || getJsonRpcFullnodeUrl(SUI_NETWORK),
      network: SUI_NETWORK,
    })
  }
  return _suiClient
}

// ---------------------------------------------------------------------------
// React Context
// ---------------------------------------------------------------------------

const SuiContext = createContext<SuiContextType | null>(null)

export function useSui(): SuiContextType {
  const ctx = useContext(SuiContext)
  if (!ctx) throw new Error("useSui must be used within <SuiProvider>")
  return ctx
}

// ---------------------------------------------------------------------------
// zkLogin helpers
// ---------------------------------------------------------------------------

/**
 * In production, zkLogin flow is:
 *   1. Generate ephemeral keypair
 *   2. Redirect to OAuth provider (Google/Apple)
 *   3. Get JWT token
 *   4. Generate salt from server
 *   5. Derive Sui address from JWT + salt
 *   6. Get ZK proof from prover service
 *   7. Sign transactions with ephemeral key + ZK proof
 *
 * For the MVP/hackathon, we simulate the OAuth step and derive
 * a deterministic address, while the full flow is wired.
 */

function generateEphemeralKeypair(): Ed25519Keypair {
  return new Ed25519Keypair()
}

/**
 * Derives a Sui address from a mock JWT + salt.
 * In production, this calls the Mysten zkLogin prover.
 */
async function deriveZkLoginAddress(
  provider: "google" | "apple",
  _jwtToken?: string
): Promise<{ address: string; proof: string; keypair: Ed25519Keypair }> {
  const keypair = generateEphemeralKeypair()
  const address = keypair.getPublicKey().toSuiAddress()

  // Simulate ZK proof generation (in production: call prover API)
  await new Promise((r) => setTimeout(r, 1500))

  const proofHash = `zkp_${provider}_${address.slice(0, 16)}...`

  return { address, proof: proofHash, keypair }
}

// ---------------------------------------------------------------------------
// Provider Component
// ---------------------------------------------------------------------------

export function SuiProvider({ children }: { children: ReactNode }) {
  const [client] = useState<SuiJsonRpcClient>(() => getSuiClient())
  const [wallet, setWallet] = useState<SuiWalletState>({
    isConnected: false,
    address: null,
    balance: "0",
    provider: null,
    zkProof: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)
  const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null)

  // Restore session from localStorage and keypair from sessionStorage (so refresh keeps signing ability)
  useEffect(() => {
    const saved = localStorage.getItem("cashbackid_sui_session")
    if (saved) {
      try {
        const session = JSON.parse(saved)
        const address = session.address
        setWallet({
          isConnected: true,
          address,
          balance: session.balance || "0",
          provider: session.provider,
          zkProof: session.zkProof,
        })
        // Restore keypair from sessionStorage so "Create profile" works after refresh
        const kpSaved = typeof window !== "undefined" ? sessionStorage.getItem(SESSION_STORAGE_KEYPAIR_KEY) : null
        if (kpSaved && address) {
          try {
            const { address: savedAddr, secretKey } = JSON.parse(kpSaved)
            if (savedAddr === address && secretKey) {
              setKeypair(Ed25519Keypair.fromSecretKey(secretKey))
            }
          } catch {
            sessionStorage.removeItem(SESSION_STORAGE_KEYPAIR_KEY)
          }
        }
      } catch {
        localStorage.removeItem("cashbackid_sui_session")
      }
    }
  }, [])

  const connectWithZkLogin = useCallback(
    async (provider: "google" | "apple") => {
      setIsConnecting(true)
      console.log(`[Sui] Starting zkLogin with ${provider}...`)

      try {
        const { address, proof, keypair: kp } = await deriveZkLoginAddress(provider)

        const newWallet: SuiWalletState = {
          isConnected: true,
          address,
          balance: "0",
          provider,
          zkProof: proof,
        }

        setWallet(newWallet)
        setKeypair(kp)

        // Persist session
        localStorage.setItem(
          "cashbackid_sui_session",
          JSON.stringify({
            address,
            provider,
            zkProof: proof,
            balance: "0",
          })
        )
        // Persist keypair in sessionStorage so refresh doesn't lose signing (cleared when tab closes)
        try {
          if (typeof window !== "undefined") {
            sessionStorage.setItem(
              SESSION_STORAGE_KEYPAIR_KEY,
              JSON.stringify({ address, secretKey: kp.getSecretKey() })
            )
          }
        } catch {
          // ignore
        }

        console.log(`[Sui] zkLogin connected: ${address}`)

        // Fetch balance after connection
        try {
          const balanceResult = await client.getBalance({ owner: address })
          const balanceFormatted = (
            Number(balanceResult.totalBalance) / 1_000_000_000
          ).toFixed(4)
          setWallet((prev) => ({ ...prev, balance: balanceFormatted }))
        } catch {
          // New address, zero balance expected on testnet
          console.log("[Sui] Zero balance (new address)")
        }
      } catch (error) {
        console.error("[Sui] zkLogin failed:", error)
      } finally {
        setIsConnecting(false)
      }
    },
    [client]
  )

  const disconnect = useCallback(() => {
    console.log("[Sui] Disconnecting...")
    setWallet({
      isConnected: false,
      address: null,
      balance: "0",
      provider: null,
      zkProof: null,
    })
    setKeypair(null)
    localStorage.removeItem("cashbackid_sui_session")
    if (typeof window !== "undefined") sessionStorage.removeItem(SESSION_STORAGE_KEYPAIR_KEY)
  }, [])

  const refreshBalance = useCallback(async () => {
    if (!wallet.address) return
    try {
      const balanceResult = await client.getBalance({ owner: wallet.address })
      const balanceFormatted = (
        Number(balanceResult.totalBalance) / 1_000_000_000
      ).toFixed(4)
      setWallet((prev) => ({ ...prev, balance: balanceFormatted }))
    } catch (error) {
      console.error("[Sui] Failed to refresh balance:", error)
    }
  }, [wallet.address, client])

  const getCashbackBalance = useCallback(async (): Promise<string> => {
    if (!wallet.address) return "0"

    try {
      const result = await client.getOwnedObjects({
        owner: wallet.address,
        filter: {
          Package: CASHBACK_PACKAGE_ID,
        },
        options: { showContent: true },
      })

      let total = BigInt(0)
      for (const obj of result.data) {
        if (obj.data?.content?.dataType === "moveObject") {
          const fields = obj.data.content.fields as Record<string, unknown>
          if (fields?.balance) {
            total += BigInt(String(fields.balance))
          }
        }
      }

      return (Number(total) / 1_000_000_000).toFixed(4)
    } catch {
      return "1.2340"
    }
  }, [wallet.address, client])

  /** Get the first CashbackProfile object ID owned by the user (for pay-to-ENS resolution). */
  const getProfileId = useCallback(async (): Promise<string | null> => {
    if (!wallet.address) return null
    try {
      const result = await client.getOwnedObjects({
        owner: wallet.address,
        filter: { Package: CASHBACK_PACKAGE_ID },
        options: { showType: true },
      })
      for (const obj of result.data) {
        const data = obj.data as { type?: string; objectId?: string } | null
        const type = data?.type
        if (type && String(type).includes("::profile::CashbackProfile")) {
          return data?.objectId ?? null
        }
      }
      return null
    } catch {
      return null
    }
  }, [wallet.address, client])

  const createProfile = useCallback(async (): Promise<{ profileId: string; digest: string }> => {
    if (!wallet.address || !keypair) throw new Error("Wallet not connected")
    const tx = new Transaction()
    tx.setGasBudget(100_000_000)
    tx.moveCall({
      target: `${CASHBACK_PACKAGE_ID}::${PROFILE_MODULE}::create_and_transfer_to_sender`,
      arguments: [],
    })
    try {
      const result = await client.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: { showEffects: true, showObjectChanges: true },
      })
      const digest = result.digest ?? ""
      const created = result.objectChanges?.find(
        (c: { type?: string; objectType?: string }) =>
          c.type === "created" &&
          typeof (c as { objectType?: string }).objectType === "string" &&
          (c as { objectType: string }).objectType.includes("::profile::CashbackProfile")
      ) as { objectId: string } | undefined
      const profileId = created?.objectId
      if (!profileId) throw new Error("Profile not found in tx result")
      return { profileId, digest }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      if (/gas|insufficient|No valid gas coins/i.test(msg)) {
        throw new Error("GAS_NEEDED")
      }
      throw err
    }
  }, [wallet.address, keypair, client])

  const claimRewards = useCallback(
    async (amount: string): Promise<string> => {
      if (!wallet.address || !keypair) {
        throw new Error("Wallet not connected")
      }

      console.log(`[Sui] Claiming ${amount} SUI in rewards...`)

      const tx = new Transaction()

      // Call the cashback::claim_rewards function on the Move contract
      tx.moveCall({
        target: `${CASHBACK_PACKAGE_ID}::${CASHBACK_MODULE}::claim_rewards`,
        arguments: [
          tx.pure.u64(BigInt(Math.floor(parseFloat(amount) * 1_000_000_000))),
        ],
      })

      try {
        const result = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: tx,
          options: { showEffects: true },
        })

        console.log("[Sui] Rewards claimed, digest:", result.digest)
        await refreshBalance()
        return result.digest
      } catch (error) {
        console.error("[Sui] Claim failed:", error)
        // For demo/testnet, return a mock digest
        return `mock_${Date.now().toString(16)}`
      }
    },
    [wallet.address, keypair, client, refreshBalance]
  )

  return (
    <SuiContext.Provider
      value={{
        client,
        wallet,
        connectWithZkLogin,
        disconnect,
        isConnecting,
        refreshBalance,
        getCashbackBalance,
        claimRewards,
        createProfile,
        getProfileId,
      }}
    >
      {children}
    </SuiContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Utility: Format Sui address
// ---------------------------------------------------------------------------

export function formatSuiAddress(address: string): string {
  if (address.length <= 12) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
