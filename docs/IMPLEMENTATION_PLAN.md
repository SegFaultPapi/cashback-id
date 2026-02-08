# Plan de implementación – Cashback ID

Flujo objetivo: **Shop (EVM) → ENS Read → Bridge (LI.FI) → Proof (Filecoin) → Settle (Sui)**.

---

## Estado actual

| Capa | Backend | UI conectada |
|------|--------|---------------|
| **ENS** | ✅ resolvePaymentPreferences, buildSetPreferencesTx | ✅ Verify, WalletButton (link ENS, copy Safe) |
| **LiFi** | ✅ getRoutes, getQuote, getStatus, evaluateOmnipinSweep | ❌ getClaimRoute / checkSweep no usados en UI |
| **Sui** | ✅ zkLogin, balance, getCashbackBalance, claimRewards | ✅ Landing, Dashboard balance, Rewards (claim) |
| **Filecoin** | ✅ createCashbackProof, uploadCashbackProof, recordCashback | ❌ recordCashback no usado en UI |

---

## Siguientes pasos (orden sugerido)

1. **Dashboard – Omnipin / Sweep**
   - Card que llame `checkSweep` con balances mock (ej. Base, Arbitrum).
   - Mostrar “Tienes $X en Chain Y → listo para sweep” o “Por debajo del umbral”.
   - Opcional: botón “Ver ruta” con `getClaimRoute` para una cadena.

2. **Dashboard – Claim Rewards**
   - El botón “Claim Rewards” debe llevar a `/rewards` (o abrir modal de claim).
   - Ya existe flujo completo en Rewards; con enlazar basta.

3. **Record proof (Filecoin)**
   - En Dashboard o Rewards: acción “Registrar prueba de cashback” (demo) que llame `recordCashback` con datos mock.
   - Mostrar CID y gateway URL para cerrar el flujo Shop → ENS → Bridge → **Proof** → Sui.

4. **Transactions – Estado de transferencia**
   - Si hay txHash (mock o real): “Comprobar estado” con `checkTransferStatus` de LiFi.
   - Prioridad menor.

5. **Datos reales en Dashboard**
   - Sustituir mock (totalInvested, monthlyReturn, purchases, Chains Active) cuando exista API/contract que los exponga.

---

## API routes (patrón Hackmoney)

Backend Sui vía API (servidor firma con `SUI_PRIVATE_KEY`):

| Ruta | Uso | Move |
|------|-----|------|
| `POST /api/create-profile` | Crear CashbackProfile en Sui | `profile::create_and_transfer_to_sender` |
| `POST /api/pay` | Procesar pago cashback | `checkout::process_payment` |

**Env:** `SUI_PRIVATE_KEY` (base64), `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` (o `CASHBACK_PACKAGE_ID`). El package de Move debe exponer los módulos `profile` y `checkout` como en Hackmoney.

**Package ID (testnet):** El proyecto usa por defecto el package de **GA-Asso/Hackmoney** en testnet: `0xbdabfb7fb7822e83b2d8ba86d211347812bb3a6d454f64828ea3c17453f4e9aa` (ver `sui/Published.toml` en [github.com/GA-Asso/Hackmoney](https://github.com/GA-Asso/Hackmoney)). Para usar otro despliegue, define `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` en `.env.local`.

---

## Resumen

- **Hecho:** ENS + Sui + LiFi backend + Verify + Rewards (balance y claim) + Dashboard Omnipin/Proof + API create-profile y pay (guía Hackmoney).
- **Opcional:** Conectar UI a `/api/create-profile` y `/api/pay` (ej. onboarding o demo), y Transactions con `checkTransferStatus`.
