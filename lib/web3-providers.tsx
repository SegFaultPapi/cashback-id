/**
 * Web3 Orchestrator for Cashback ID
 *
 * Central context that unifies:
 *   - Sui (zkLogin for retail settlement)
 *   - ENS (payment preferences via Custom Text Records)
 *   - LI.FI (cross-chain cashback routing)
 *   - Filecoin (immutable proof persistence)
 *
 * Hierarchy:
 *   <Web3Provider>          ← This file: top-level orchestrator
 *     <SuiProvider>         ← lib/sui-client.tsx
 *       {children}
 *     </SuiProvider>
 *   </Web3Provider>
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
import { SuiProvider, useSui, formatSuiAddress } from "./sui-client"
import {
  resolvePaymentPreferences,
  resolveEnsName,
  resolveEnsAvatar,
  buildSetPreferencesTx,
  isValidEnsName,
  formatPreferencesSummary,
  CASHBACKID_ENS_PARENT,
  isCashbackIdSubdomain,
  getCashbackIdSubdomainLabel,
  type CashbackPreferences,
  SUPPORTED_CHAINS,
  SUPPORTED_ASSETS,
} from "./ens-resolver"
import {
  buildCashbackRoute,
  getCashbackQuote,
  checkTransferStatus,
  evaluateOmnipinSweep,
  type CashbackRoute,
  type OmnipinSweepResult,
} from "./lifi-client"
import {
  createCashbackProof,
  uploadCashbackProof,
  type CashbackProof,
  type IPFSUploadResult,
} from "./filecoin-persistence"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WalletState {
  isConnected: boolean
  /** Sui address */
  address: string | null
  /** SUI balance */
  balance: string
  /** Chain name display */
  chainName: string
  /** Chain ID (101 for Sui) */
  chainId: number | null
  /** zkLogin provider */
  provider: string | null
  /** ENS name (if resolved) */
  ensName: string | null
  /** ENS avatar URL */
  ensAvatar: string | null
  /** ENS payment preferences */
  preferences: CashbackPreferences | null
}

export interface WalletContextType {
  wallet: WalletState
  /** Connect via zkLogin (Google/Apple) */
  connect: (provider?: "google" | "apple") => Promise<void>
  /** Disconnect all sessions */
  disconnect: () => void
  isConnecting: boolean
  /** Link an ENS name to the session */
  linkEnsName: (ensName: string) => Promise<void>
  /** Update ENS payment preferences (returns tx data for Safe) */
  updatePreferences: (
    prefs: Partial<Omit<CashbackPreferences, "ensName">>
  ) => { to: string; data: string } | null
  /** Save preferences via backend (for *.cashbackid.eth; no signing) */
  setPreferencesViaApi: (
    prefs: Partial<Omit<CashbackPreferences, "ensName">>
  ) => Promise<boolean>
  /** Get a cross-chain route for cashback claim */
  getClaimRoute: (
    sourceChainId: number,
    sourceTokenAddress: string,
    amount: string
  ) => Promise<CashbackRoute | null>
  /** Record a cashback event to IPFS/Filecoin */
  recordCashback: (params: {
    sourceChainId: number
    sourceTxHash: string
    sourceAsset: string
    cashbackAmount: string
    merchant: string
  }) => Promise<IPFSUploadResult | null>
  /** Check Omnipin sweep eligibility */
  checkSweep: (
    balances: Array<{
      chainId: number
      tokenAddress: string
      amount: string
      amountUSD: number
    }>
  ) => Promise<OmnipinSweepResult[]>
  /** Create CashbackProfile on Sui (user signs); returns profileId and tx digest */
  createProfile: () => Promise<{ profileId: string; digest: string }>
  /** Get current user's Sui CashbackProfile object ID */
  getProfileId: () => Promise<string | null>
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet(): WalletContextType {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error("useWallet must be used within <Web3Provider>")
  return ctx
}

// ---------------------------------------------------------------------------
// Inner provider (has access to useSui)
// ---------------------------------------------------------------------------

function WalletOrchestrator({ children }: { children: ReactNode }) {
  const sui = useSui()

  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: "0",
    chainName: "",
    chainId: null,
    provider: null,
    ensName: null,
    ensAvatar: null,
    preferences: null,
  })
  const [isConnecting, setIsConnecting] = useState(false)

  // Sync Sui wallet state → unified wallet
  useEffect(() => {
    if (sui.wallet.isConnected) {
      setWallet((prev) => ({
        ...prev,
        isConnected: true,
        address: sui.wallet.address,
        balance: sui.wallet.balance,
        chainName: "Sui Network",
        chainId: 101,
        provider: sui.wallet.provider,
      }))
    }
  }, [
    sui.wallet.isConnected,
    sui.wallet.address,
    sui.wallet.balance,
    sui.wallet.provider,
  ])

  // Restore ENS link from localStorage
  useEffect(() => {
    const savedEns = localStorage.getItem("cashbackid_ens_name")
    if (savedEns && wallet.isConnected) {
      linkEnsName(savedEns).catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallet.isConnected])

  // ------ Connect (zkLogin) ------

  const connect = useCallback(
    async (provider: "google" | "apple" = "google") => {
      setIsConnecting(true)
      try {
        await sui.connectWithZkLogin(provider)
      } finally {
        setIsConnecting(false)
      }
    },
    [sui]
  )

  // ------ Disconnect ------

  const disconnect = useCallback(() => {
    sui.disconnect()
    setWallet({
      isConnected: false,
      address: null,
      balance: "0",
      chainName: "",
      chainId: null,
      provider: null,
      ensName: null,
      ensAvatar: null,
      preferences: null,
    })
    localStorage.removeItem("cashbackid_ens_name")
  }, [sui])

  // ------ ENS Linking ------

  const linkEnsName = useCallback(
    async (ensName: string) => {
      if (!isValidEnsName(ensName)) {
        console.warn("[ENS] Invalid name:", ensName)
        return
      }

      console.log("[ENS] Linking:", ensName)

      try {
        const normalized = ensName.trim().toLowerCase()
        if (normalized.endsWith(".cashbackid.eth")) {
          const resolved = await fetch(`/api/ens/resolve?name=${encodeURIComponent(normalized)}`).then((r) =>
            r.ok ? r.json() : null
          )
          // Skip resolveEnsAvatar for our subdomains (client-side RPC hits CORS; avatar rarely set)
          const avatar: string | null = null
          const preferences: CashbackPreferences = resolved
            ? {
                ensName: normalized,
                chainId: resolved.chainId ?? null,
                asset: resolved.asset ?? null,
                pool: resolved.pool ?? null,
                suiAddress: resolved.suiAddress ?? null,
                threshold: resolved.threshold ?? null,
                profileId: resolved.profileId ?? null,
              }
            : {
                ensName: normalized,
                chainId: null,
                asset: null,
                pool: null,
                suiAddress: null,
                threshold: null,
                profileId: null,
              }
          setWallet((prev) => ({
            ...prev,
            ensName: normalized,
            ensAvatar: avatar,
            preferences,
          }))
          localStorage.setItem("cashbackid_ens_name", normalized)
          console.log("[ENS] Subdomain linked:", normalized, preferences)
          return
        }

        const [preferences, avatar] = await Promise.all([
          resolvePaymentPreferences(ensName),
          resolveEnsAvatar(ensName),
        ])

        setWallet((prev) => ({
          ...prev,
          ensName,
          ensAvatar: avatar,
          preferences,
        }))

        localStorage.setItem("cashbackid_ens_name", ensName)
        console.log(
          "[ENS] Preferences loaded:",
          formatPreferencesSummary(preferences)
        )
      } catch (error) {
        console.error("[ENS] Failed to resolve:", error)
      }
    },
    []
  )

  // ------ Update ENS Preferences ------

  const updatePreferences = useCallback(
    (prefs: Partial<Omit<CashbackPreferences, "ensName">>) => {
      if (!wallet.ensName) return null

      const txData = buildSetPreferencesTx(wallet.ensName, prefs)

      // Also update local state immediately (optimistic)
      setWallet((prev) => ({
        ...prev,
        preferences: prev.preferences
          ? { ...prev.preferences, ...prefs }
          : null,
      }))

      return { to: txData.to, data: txData.data }
    },
    [wallet.ensName]
  )

  const setPreferencesViaApi = useCallback(
    async (prefs: Partial<Omit<CashbackPreferences, "ensName">>) => {
      if (!wallet.address || !wallet.ensName) return false
      try {
        const res = await fetch("/api/ens/set-preferences", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ensName: wallet.ensName ?? undefined,
            suiAddress: wallet.address,
            preferences: prefs,
          }),
        })
        if (!res.ok) return false
        setWallet((prev) => ({
          ...prev,
          preferences: {
            ...(prev.preferences || {
              ensName: prev.ensName!,
              chainId: null,
              asset: null,
              pool: null,
              suiAddress: null,
              threshold: null,
              profileId: null,
            }),
            ...prefs,
            ensName: prev.ensName!,
          },
        }))
        return true
      } catch {
        return false
      }
    },
    [wallet.address, wallet.ensName]
  )

  // ------ LI.FI Cross-Chain Route ------

  const getClaimRoute = useCallback(
    async (
      sourceChainId: number,
      sourceTokenAddress: string,
      amount: string
    ) => {
      if (!wallet.address || !wallet.preferences) return null

      return buildCashbackRoute(
        sourceChainId,
        sourceTokenAddress,
        amount,
        wallet.address,
        wallet.preferences
      )
    },
    [wallet.address, wallet.preferences]
  )

  // ------ Filecoin Persistence ------

  const recordCashback = useCallback(
    async (params: {
      sourceChainId: number
      sourceTxHash: string
      sourceAsset: string
      cashbackAmount: string
      merchant: string
    }) => {
      if (!wallet.ensName || !wallet.address) return null

      const proof = createCashbackProof({
        ensName: wallet.ensName,
        suiAddress: wallet.address,
        sourceChainId: params.sourceChainId,
        sourceTxHash: params.sourceTxHash,
        sourceAsset: params.sourceAsset,
        cashbackAmount: params.cashbackAmount,
        destChainId: wallet.preferences?.chainId || 101,
        destAsset: wallet.preferences?.asset || "sui",
        merchant: params.merchant,
        zkProofHash: sui.wallet.zkProof || undefined,
      })

      return uploadCashbackProof(proof)
    },
    [wallet.ensName, wallet.address, wallet.preferences, sui.wallet.zkProof]
  )

  // ------ Omnipin Sweep ------

  const checkSweep = useCallback(
    async (
      balances: Array<{
        chainId: number
        tokenAddress: string
        amount: string
        amountUSD: number
      }>
    ) => {
      if (!wallet.address || !wallet.preferences) return []

      return evaluateOmnipinSweep(balances, wallet.address, wallet.preferences)
    },
    [wallet.address, wallet.preferences]
  )

  const createProfile = useCallback(() => sui.createProfile(), [sui])
  const getProfileId = useCallback(() => sui.getProfileId(), [sui])

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connect,
        disconnect,
        isConnecting,
        linkEnsName,
        updatePreferences,
        setPreferencesViaApi,
        getClaimRoute,
        recordCashback,
        checkSweep,
        createProfile,
        getProfileId,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

// ---------------------------------------------------------------------------
// Top-Level Provider (exported)
// ---------------------------------------------------------------------------

export function Web3Provider({ children }: { children: ReactNode }) {
  return (
    <SuiProvider>
      <WalletOrchestrator>{children}</WalletOrchestrator>
    </SuiProvider>
  )
}

// ---------------------------------------------------------------------------
// Re-exports for backward compatibility
// ---------------------------------------------------------------------------

export { formatSuiAddress as formatAddress }
export {
  SUPPORTED_CHAINS,
  SUPPORTED_ASSETS,
  CASHBACKID_ENS_PARENT,
  isCashbackIdSubdomain,
  getCashbackIdSubdomainLabel,
}

// Legacy function stubs (kept for pages that import them directly)
export async function claimRewards(amount: bigint): Promise<void> {
  console.log("[Legacy] claimRewards called with:", amount.toString())
}

export async function generateIdentityProof(provider: string): Promise<string> {
  console.log("[Legacy] generateIdentityProof called with:", provider)
  await new Promise((resolve) => setTimeout(resolve, 2000))
  return `zkp_${provider}_${Date.now().toString(16)}`
}

export async function activateMerchant(merchantId: string): Promise<void> {
  console.log("[Legacy] activateMerchant called with:", merchantId)
}

export async function getRewardsBalance(): Promise<bigint> {
  return BigInt("1234000000000")
}
