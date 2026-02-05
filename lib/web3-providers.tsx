"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

interface WalletState {
  isConnected: boolean
  address: string | null
  balance: string
  chainId: number | null
  chainName: string
}

interface WalletContextType {
  wallet: WalletState
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
}

const WalletContext = createContext<WalletContextType | null>(null)

export function useWallet() {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error("useWallet must be used within a Web3Provider")
  }
  return context
}

// Mock Web3 functions
export async function claimRewards(amount: bigint): Promise<void> {
  console.log("[v0] Claiming rewards:", amount.toString())
  await new Promise((resolve) => setTimeout(resolve, 2000))
  console.log("[v0] Rewards claimed successfully")
}

export async function generateIdentityProof(provider: string): Promise<string> {
  console.log("[v0] Generating identity proof with:", provider)
  await new Promise((resolve) => setTimeout(resolve, 3000))
  const proofHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}`
  console.log("[v0] Proof generated:", proofHash)
  return proofHash
}

export async function activateMerchant(merchantId: string): Promise<void> {
  console.log("[v0] Activating merchant:", merchantId)
  await new Promise((resolve) => setTimeout(resolve, 1500))
  console.log("[v0] Merchant activated successfully")
}

export async function getRewardsBalance(): Promise<bigint> {
  console.log("[v0] Getting rewards balance")
  return BigInt("1234000000000") // 1.234 SUI
}

const MOCK_ADDRESSES = [
  "0x742d35Cc6634C0532925a3b844Bc9e7595f8fE0C",
  "0x8ba1f109551bD432803012645Hac136E8a50C87",
  "0x1234567890abcdef1234567890abcdef12345678",
]

export function Web3Provider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: "0",
    chainId: null,
    chainName: "",
  })
  const [isConnecting, setIsConnecting] = useState(false)

  const connect = useCallback(async () => {
    setIsConnecting(true)
    console.log("[v0] Connecting wallet...")

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const randomAddress = MOCK_ADDRESSES[Math.floor(Math.random() * MOCK_ADDRESSES.length)]

    setWallet({
      isConnected: true,
      address: randomAddress,
      balance: "124.58",
      chainId: 101,
      chainName: "Sui Mainnet",
    })

    setIsConnecting(false)
    console.log("[v0] Wallet connected:", randomAddress)
  }, [])

  const disconnect = useCallback(() => {
    console.log("[v0] Disconnecting wallet")
    setWallet({
      isConnected: false,
      address: null,
      balance: "0",
      chainId: null,
      chainName: "",
    })
  }, [])

  return (
    <WalletContext.Provider value={{ wallet, connect, disconnect, isConnecting }}>
      {children}
    </WalletContext.Provider>
  )
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
