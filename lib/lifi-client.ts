/**
 * LI.FI Cross-Chain Execution Client for Cashback ID
 *
 * Orchestrates swaps and bridges based on the user's ENS payment preferences.
 * Flow:
 *   1. Read ENS text records (cashbackid.chain, cashbackid.asset)
 *   2. Build a LI.FI route: source chain/token → destination chain/token
 *   3. Execute the cross-chain transfer (swap + bridge in one tx)
 *
 * This module targets the "Best Use of LI.FI Composer" track.
 */

import { getRoutes, getQuote, getStatus, type Route, type Step } from "@lifi/sdk"
import type { CashbackPreferences } from "./ens-resolver"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CashbackRoute {
  /** The LI.FI route object */
  route: Route
  /** Estimated output amount (human-readable) */
  estimatedOutput: string
  /** Estimated gas cost in USD */
  estimatedGasCostUSD: string
  /** Total execution time estimate in seconds */
  estimatedTimeSeconds: number
  /** Summary for the UI */
  summary: string
}

export interface CrossChainTransferRequest {
  /** Source chain ID where the cashback was earned */
  fromChainId: number
  /** Source token address (e.g., USDC on Arbitrum) */
  fromTokenAddress: string
  /** Amount in smallest unit (wei, etc.) */
  fromAmount: string
  /** User's wallet address on the source chain */
  fromAddress: string
  /** Destination chain ID (from ENS preferences) */
  toChainId: number
  /** Destination token address (from ENS preferences) */
  toTokenAddress: string
  /** Destination wallet address */
  toAddress: string
}

export type TransferStatus = "PENDING" | "STARTED" | "ACTION_REQUIRED" | "DONE" | "FAILED" | "NOT_FOUND"

export interface TransferStatusResult {
  status: TransferStatus
  substatus?: string
  sendingChain: number
  receivingChain: number
  sendingAmount: string
  receivingAmount?: string
  txHash?: string
  bridgeName?: string
}

// ---------------------------------------------------------------------------
// Token Address Registry (common tokens per chain for routing)
// ---------------------------------------------------------------------------

export const TOKEN_ADDRESSES: Record<number, Record<string, string>> = {
  // Ethereum Mainnet
  1: {
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    DAI: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    WETH: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
    ETH: "0x0000000000000000000000000000000000000000",
  },
  // Optimism
  10: {
    USDC: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
    USDT: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WETH: "0x4200000000000000000000000000000000000006",
    ETH: "0x0000000000000000000000000000000000000000",
  },
  // Polygon
  137: {
    USDC: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359",
    USDT: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F",
    DAI: "0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063",
    WETH: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619",
  },
  // Base
  8453: {
    USDC: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
    USDT: "0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2",
    DAI: "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
    WETH: "0x4200000000000000000000000000000000000006",
    ETH: "0x0000000000000000000000000000000000000000",
  },
  // Arbitrum
  42161: {
    USDC: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    USDT: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    DAI: "0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1",
    WETH: "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1",
    ETH: "0x0000000000000000000000000000000000000000",
  },
}

// Map ENS-style asset names to token symbols
const ENS_ASSET_TO_SYMBOL: Record<string, string> = {
  "usdc.tkn.eth": "USDC",
  "usdt.tkn.eth": "USDT",
  "dai.tkn.eth": "DAI",
  "weth.tkn.eth": "WETH",
  sui: "SUI",
}

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Resolves a token address from ENS preferences for a given chain.
 */
export function resolveTokenAddress(
  chainId: number,
  ensAsset: string
): string | null {
  const symbol = ENS_ASSET_TO_SYMBOL[ensAsset] || ensAsset.toUpperCase()
  return TOKEN_ADDRESSES[chainId]?.[symbol] ?? null
}

/**
 * Builds a LI.FI route based on the user's ENS payment preferences.
 * This is the core of the cross-chain cashback routing.
 *
 * @param sourceChainId - Chain where cashback was earned
 * @param sourceTokenAddress - Token received as cashback
 * @param amount - Amount in smallest unit
 * @param fromAddress - User's address on source chain
 * @param preferences - Parsed from ENS text records
 */
export async function buildCashbackRoute(
  sourceChainId: number,
  sourceTokenAddress: string,
  amount: string,
  fromAddress: string,
  preferences: CashbackPreferences
): Promise<CashbackRoute | null> {
  const destChainId = preferences.chainId
  if (!destChainId) return null

  // Resolve the destination token from ENS preference
  const destTokenAddress = preferences.asset
    ? resolveTokenAddress(destChainId, preferences.asset)
    : null

  if (!destTokenAddress) return null

  // Determine destination address (Sui address or same EVM address)
  const toAddress = preferences.suiAddress || fromAddress

  try {
    const routeResult = await getRoutes({
      fromChainId: sourceChainId,
      fromTokenAddress: sourceTokenAddress,
      fromAmount: amount,
      fromAddress,
      toChainId: destChainId,
      toTokenAddress: destTokenAddress,
      toAddress,
      options: {
        slippage: 0.005, // 0.5%
        order: "RECOMMENDED",
        allowSwitchChain: true,
      },
    })

    if (!routeResult.routes || routeResult.routes.length === 0) {
      return null
    }

    const bestRoute = routeResult.routes[0]

    return {
      route: bestRoute,
      estimatedOutput: bestRoute.toAmountMin || bestRoute.toAmount,
      estimatedGasCostUSD: bestRoute.gasCostUSD || "0",
      estimatedTimeSeconds: bestRoute.steps.reduce(
        (sum: number, step: Step) => sum + (step.estimate?.executionDuration || 0),
        0
      ),
      summary: formatRouteSummary(bestRoute, sourceChainId, destChainId),
    }
  } catch (error) {
    console.error("[LI.FI] Failed to build route:", error)
    return null
  }
}

/**
 * Gets a direct quote for a cross-chain transfer.
 */
export async function getCashbackQuote(
  request: CrossChainTransferRequest
): Promise<CashbackRoute | null> {
  try {
    const quote = await getQuote({
      fromChain: request.fromChainId,
      fromToken: request.fromTokenAddress,
      fromAmount: request.fromAmount,
      fromAddress: request.fromAddress,
      toChain: request.toChainId,
      toToken: request.toTokenAddress,
      toAddress: request.toAddress,
      slippage: 0.005,
    })

    return {
      route: quote as unknown as Route,
      estimatedOutput: quote.estimate?.toAmountMin || quote.estimate?.toAmount || "0",
      estimatedGasCostUSD: quote.estimate?.gasCosts?.[0]?.amountUSD || "0",
      estimatedTimeSeconds: quote.estimate?.executionDuration || 0,
      summary: `Route via ${quote.toolDetails?.name || "LI.FI"} — est. ${Math.ceil((quote.estimate?.executionDuration || 60) / 60)} min`,
    }
  } catch (error) {
    console.error("[LI.FI] Failed to get quote:", error)
    return null
  }
}

/**
 * Checks the status of an in-flight cross-chain transfer.
 */
export async function checkTransferStatus(
  txHash: string,
  fromChainId: number,
  toChainId: number
): Promise<TransferStatusResult> {
  try {
    const status = await getStatus({
      txHash,
      fromChain: fromChainId,
      toChain: toChainId,
      bridge: undefined,
    })

    return {
      status: (status.status as TransferStatus) || "NOT_FOUND",
      substatus: status.substatus,
      sendingChain: fromChainId,
      receivingChain: toChainId,
      sendingAmount: status.sending?.amount || "0",
      receivingAmount: status.receiving?.amount,
      txHash: status.sending?.txHash || txHash,
      bridgeName: status.tool,
    }
  } catch (error) {
    console.error("[LI.FI] Failed to check status:", error)
    return {
      status: "NOT_FOUND",
      sendingChain: fromChainId,
      receivingChain: toChainId,
      sendingAmount: "0",
      txHash,
    }
  }
}

// ---------------------------------------------------------------------------
// Omnipin Coordinator (Automated cashback sweep)
// ---------------------------------------------------------------------------

/**
 * The Omnipin coordinator checks if accumulated cashback on any chain
 * exceeds the user's threshold, then triggers a sweep to their preferred
 * destination via LI.FI.
 *
 * This would run server-side or via a cron/keeper in production.
 */
export interface OmnipinSweepResult {
  triggered: boolean
  sourceChain: number
  sourceAmount: string
  route: CashbackRoute | null
  reason: string
}

export async function evaluateOmnipinSweep(
  balances: Array<{ chainId: number; tokenAddress: string; amount: string; amountUSD: number }>,
  fromAddress: string,
  preferences: CashbackPreferences
): Promise<OmnipinSweepResult[]> {
  const threshold = preferences.threshold || 10 // Default $10 minimum
  const results: OmnipinSweepResult[] = []

  for (const balance of balances) {
    // Skip if already on preferred chain
    if (balance.chainId === preferences.chainId) {
      results.push({
        triggered: false,
        sourceChain: balance.chainId,
        sourceAmount: balance.amount,
        route: null,
        reason: "Already on preferred chain",
      })
      continue
    }

    // Check threshold
    if (balance.amountUSD < threshold) {
      results.push({
        triggered: false,
        sourceChain: balance.chainId,
        sourceAmount: balance.amount,
        route: null,
        reason: `Below threshold ($${balance.amountUSD.toFixed(2)} < $${threshold})`,
      })
      continue
    }

    // Build route
    const route = await buildCashbackRoute(
      balance.chainId,
      balance.tokenAddress,
      balance.amount,
      fromAddress,
      preferences
    )

    results.push({
      triggered: route !== null,
      sourceChain: balance.chainId,
      sourceAmount: balance.amount,
      route,
      reason: route ? "Ready for sweep" : "No route available",
    })
  }

  return results
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatRouteSummary(
  route: Route,
  fromChain: number,
  toChain: number
): string {
  const steps = route.steps.length
  const tools = route.steps.map((s: Step) => s.toolDetails?.name || s.tool).join(" → ")
  const time = Math.ceil(
    route.steps.reduce((sum: number, s: Step) => sum + (s.estimate?.executionDuration || 0), 0) / 60
  )
  return `${steps} step(s) via ${tools} — est. ${time} min`
}

/**
 * Formats a token amount from its smallest unit to human-readable.
 */
export function formatTokenAmount(amount: string, decimals: number): string {
  const value = BigInt(amount)
  const divisor = BigInt(10 ** decimals)
  const whole = value / divisor
  const fraction = value % divisor
  const fractionStr = fraction.toString().padStart(decimals, "0").slice(0, 4)
  return `${whole}.${fractionStr}`
}
