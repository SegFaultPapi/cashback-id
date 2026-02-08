import { NextResponse } from "next/server"
import { getRegistrarStatus } from "@/lib/ens-registrar-server"

/**
 * GET /api/ens/registrar-status
 * Devuelve el estado de la config para registro on-chain (clave, RPC, wallet).
 * No expone secretos. Útil para comprobar si los subdominios se registrarán on-chain.
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
      ? "Registro on-chain activo: los nuevos claims se subirán a Ethereum."
      : !status.keyConfigured
        ? "Falta PRIVATE_KEY o ETH_REGISTRAR_OWNER_PRIVATE_KEY en .env"
        : !status.keyValid
          ? "La clave debe ser hex con 0x y 64 caracteres"
          : !status.rpcConfigured
            ? "Falta ETH_RPC_URL o NEXT_PUBLIC_ETH_RPC_URL (se usa RPC demo, puede dar 429)"
            : "Revisa clave y RPC en .env",
  })
}
