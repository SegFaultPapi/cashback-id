# MVP Checklist – Cashback ID

What’s in place and what’s left for a **functional MVP**.

---

## ✅ Done (ready for demo)

| Area | Status |
|------|--------|
| **Auth** | zkLogin-style connect (simulated: random keypair, no OAuth). User gets a Sui address. |
| **Free ENS** | Claim `you.cashbackid.eth` (no pay, no sign). Stored in memory; preferences saved via API. |
| **Dashboard** | Overview, Pay, Activity in one place; bottom nav (Home, Pay, Activity, Profile). |
| **Pay** | Resolve ENS (including `.cashbackid.eth` via API) → enter amount → POST `/api/pay` (profileId + amount). |
| **Receive** | Copy payment link `/pay?to=you.cashbackid.eth`; payer uses it and cashback is sent to your profile. |
| **Verify / Profile** | Link ENS or use subdomain; set preferences (for subdomain: save via API, no signing). |
| **Create profile (Sui)** | Button in Verify calls `createProfile()` (user signs, **user needs SUI for gas**). Clear error + faucet link if no gas. |
| **APIs** | `POST /api/ens/claim-subdomain`, `POST /api/ens/set-preferences`, `GET /api/ens/resolve`, `POST /api/create-profile`, `POST /api/pay`. |

---

## ⚠️ Required for a fully functional MVP

### 1. Sui contract on testnet

- **Contract:** El repo **GA-Asso/Hackmoney** tiene el package Move (`profile`, `checkout`) desplegado en testnet. Package ID: `0xbdabfb7fb7822e83b2d8ba86d211347812bb3a6d454f64828ea3c17453f4e9aa` (está en `sui/Published.toml`).
- **App:** Cashback usa ese ID por defecto; no hace falta configurar `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` salvo que uses otro despliegue.

### 2. Environment variables (deploy)

Set in production / Vercel (or `.env.local` for local):

| Variable | Purpose |
|----------|--------|
| `SUI_PRIVATE_KEY` | Base64 keypair for server (create-profile API and pay API sign with this). |
| `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` | Deployed Move package ID (profile + checkout). |
| `NEXT_PUBLIC_SUI_NETWORK` | `testnet` or `mainnet`. |
| `NEXT_PUBLIC_SUI_RPC_URL` | (Optional) Custom RPC. |
| `NEXT_PUBLIC_ETH_RPC_URL` | (Optional) For ENS resolution. |

For **Pay** to work, the wallet that holds `SUI_PRIVATE_KEY` must have enough SUI to execute `process_payment` (server pays gas and sends the coin to the recipient profile).

### 3. Gas for new users (create profile)

- **Today:** User must have SUI to create a profile (they sign the tx). We show “No valid gas coins” + link to faucet.
- **Optional improvement:** Server-sponsored flow: backend creates the profile and transfers it to the user’s address (would require a Move entry like `create_and_transfer_to(address)` and the server to pass the user’s address).

---

## 🔶 Optional (post-MVP)

| Item | Note |
|------|------|
| **Real zkLogin** | Replace simulated flow with Mysten zkLogin (OAuth + prover). |
| **ENS on-chain** | Own `cashbackid.eth`, wrap it, deploy subdomain registrar so `*.cashbackid.eth` exist on mainnet. Until then, subdomains live in app memory and resolve via `/api/ens/resolve`. |
| **Persistent subdomain store** | Replace in-memory store with DB (e.g. Postgres, Vercel KV) so claims survive restarts. |
| **LiFi / Omnipin** | Connect sweep/claim UI to real routes and status (already in code, partially wired in dashboard). |
| **Filecoin proof** | `recordCashback` is available; optional to surface it more in UI. |
| **Real balances** | Replace mock “Total invested”, “This month”, “Purchases” with data from contracts or APIs when available. |

---

## Minimal path to “it works end-to-end”

1. **Deploy Move package** (profile + checkout) on Sui testnet and set `NEXT_PUBLIC_CASHBACK_PACKAGE_ID`.
2. **Set `SUI_PRIVATE_KEY`** (server keypair with SUI for gas) and fund that wallet so `/api/pay` can run.
3. **User flow:** Sign in → Claim `you.cashbackid.eth` → Get testnet SUI from faucet → Verify → Create profile → Set preferences (saved via API for subdomain) → Share payment link → Someone pays via app → Cashback appears on the profile.

With 1–2 and the current app, the MVP is functionally complete for a testnet demo; 3 is the user path to validate it.
