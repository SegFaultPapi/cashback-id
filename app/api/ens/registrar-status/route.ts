import { NextResponse } from "next/server"
import { getRegistrarStatus } from "@/lib/ens-registrar-server"

/**
 * GET /api/ens/registrar-status
 * Returns the config status for on-chain registration (key, RPC, wallet).
 * Does not expose secrets. Useful to check if subdomains will be registered on-chain.
 */
export async function GET() {
  const status = getRegistrarStatus()
  return NextResponse.json({
    keyConfigured: status.keyConfigured,
    keySource: status.keySource,
    keyValid: status.keyValid,
    rpcConfigured: status.rpcConfigured,
    rpcSource: status.rpcSource,
    walletAddress: status.walletAddress,
    ready: status.ready,
    message: status.ready
      ? "On-chain registration active: new claims will be submitted to Ethereum."
      : !status.keyConfigured
        ? "PRIVATE_KEY or ETH_REGISTRAR_OWNER_PRIVATE_KEY missing in .env"
        : !status.keyValid
          ? "Key must be hex with 0x and 64 characters"
          : !status.rpcConfigured
            ? "ETH_RPC_URL or NEXT_PUBLIC_ETH_RPC_URL missing (demo RPC may return 429)"
            : "Check key and RPC in .env",
  })
}
