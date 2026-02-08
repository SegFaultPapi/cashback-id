# Opción custodial: registro on-chain desde el backend

Para que cada claim de subdominio (`POST /api/ens/claim-subdomain`) también registre el nombre en Ethereum con `registerFor(label, backendWallet)`, necesitas lo siguiente.

## Requisitos

| Requisito | Dónde configurarlo |
|-----------|--------------------|
| **Clave privada del owner del registrar** | En `.env` en la raíz del repo: `PRIVATE_KEY` (la misma que usaste para desplegar el contrato) o `ETH_REGISTRAR_OWNER_PRIVATE_KEY`. Solo esa wallet puede llamar `registerFor`. |
| **RPC Ethereum mainnet** | En `.env`: `ETH_RPC_URL` o `NEXT_PUBLIC_ETH_RPC_URL` (para que el backend envíe la transacción). |
| **ETH para gas** | La wallet que es owner del CashbackIdRegistrar debe tener ETH en mainnet. Cada `registerFor` consume ~100k–200k gas (orden de ~0.002–0.01 ETH según gas price). |

## Comportamiento

- Si **no** configuras clave o RPC, el claim sigue funcionando: el usuario obtiene un subdominio solo en el store (Sui address → `label.cashbackid.eth`). La respuesta incluye `registeredOnChain: false`.
- Si **sí** configuras clave y RPC, tras asignar el label en el store el backend llama a `registerFor(entry.label, backendAddress)`. El subdominio queda registrado on-chain a nombre de la wallet del backend (custodial). La respuesta incluye `registeredOnChain: true` y opcionalmente `txHash`.
- El vínculo “a qué usuario pertenece” sigue en el store: **suiAddress → ensName**. On-chain el “owner” del ENS es la wallet del backend.

## Resumen

1. **PRIVATE_KEY** (o **ETH_REGISTRAR_OWNER_PRIVATE_KEY**) = owner del CashbackIdRegistrar, con ETH.
2. **ETH_RPC_URL** (o **NEXT_PUBLIC_ETH_RPC_URL**) = RPC mainnet.
3. La app ya integra la llamada en `lib/ens-registrar-server.ts` y en `POST /api/ens/claim-subdomain`.
