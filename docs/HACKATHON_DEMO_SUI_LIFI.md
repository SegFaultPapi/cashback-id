# Hackathon demo: Sui + LI.FI implementation

Guide to **test** and **demonstrate** Cashback ID’s Sui and LI.FI integration for judges.

---

## What is implemented (ready to show)

### Sui

| Feature | Where to show | What it does |
|--------|----------------|--------------|
| **zkLogin-style connect** | Landing / Login | “Sign In” or “Continue with Google/Apple” → simulated flow → Sui address in session (no extension). |
| **Create profile** | Verify (Payment profile step) | “Create profile” → Move `profile::create_and_transfer_to_sender` (user signs; needs SUI for gas on testnet). |
| **ENS → profileId** | Verify → set preferences | Profile ID is saved so Pay can credit cashback to this profile. |
| **Receive payment (Pay)** | Dashboard → Pay tab, or `/pay` | Enter ENS (e.g. `alice.cashbackid.eth`) → amount → **POST /api/pay** → server calls Move `checkout::process_payment` on Sui → cashback credited to recipient profile. |
| **Cashback balance** | Dashboard Overview | “Cashback balance (Sui)” from `getCashbackBalance()` (reads Sui objects). Refreshes on load, on tab focus, and via refresh button. |
| **Claim rewards** | Dashboard → “Claim rewards” or `/rewards` | User claims accumulated cashback from profile on Sui (Move call from app). |

### LI.FI

| Feature | Where to show | What it does |
|--------|----------------|--------------|
| **Preferences → destination** | Verify | Chain, asset, pool (and threshold) stored; LI.FI uses these as destination for routes. |
| **Omnipin sweep** | Dashboard Overview | Card “Omnipin sweep”: for each mock balance (Base, Arbitrum) we call `evaluateOmnipinSweep` → “Ready to sweep” or “Below threshold” / “Already on preferred chain”. |
| **View route** | Dashboard → Omnipin card | For “Ready to sweep” rows, “View route” opens a dialog with LI.FI route summary (steps, estimated output, gas, time) and link to [li.fi](https://li.fi). |
| **Route building** | Under the hood | `buildCashbackRoute()` uses `@lifi/sdk` `getRoutes()` from source chain/token to user’s preferred chain/token (from ENS preferences). |

---

## What’s optional / not required for demo

- **Activity tab:** Still mock data; real events would need Sui events or an API.
- **Record proof (Filecoin):** “Record proof (demo)” exists in Dashboard; not required to show Sui/LI.FI.
- **Real per-chain balances:** Omnipin uses mock balances; real balances would need a backend or wallet aggregation.
- **Merchant / real spend:** Post-MVP; not needed to prove Sui + LI.FI.

---

## How to test locally (full flow)

### 1. Environment

In `.env.local` (or `.env`):

```bash
# Required for Pay and Create Profile
SUI_PRIVATE_KEY=<base64-keypair>   # Server signs pay; must have SUI for gas
NEXT_PUBLIC_CASHBACK_PACKAGE_ID=0xbdabfb7fb7822e83b2d8ba86d211347812bb3a6d454f64828ea3c17453f4e9aa
NEXT_PUBLIC_SUI_NETWORK=testnet

# Optional
NEXT_PUBLIC_SUI_RPC_URL=https://fullnode.testnet.sui.io
```

- **SUI_PRIVATE_KEY:** Generate a Sui keypair, export as base64. Fund that address on [Sui testnet faucet](https://faucet.sui.io/) so the server can pay gas for `process_payment`.
- **Package ID:** Default is GA-Asso/Hackmoney testnet; override only if you deploy your own.

### 2. Run the app

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### 3. Demo flow (two roles: Receiver + Payer)

**Receiver (Alice):**

1. **Sign in** — Click “Sign In” or “Continue with Google” on landing. No wallet extension; you get a Sui address in session.
2. **Claim subdomain** — Dashboard → “Get my .cashbackid.eth” (e.g. label `alice`). You see “Welcome, alice.cashbackid.eth” (and on-chain if ENS is configured).
3. **Get testnet SUI** — For “Create profile”, you need SUI for gas. Use [faucet.sui.io](https://faucet.sui.io/) and your session address (e.g. copy from Verify or wallet button if you show it).
4. **Verify** — Go to **Verify** (Profile):
   - ENS step: already linked (`alice.cashbackid.eth`).
   - Preferences: set **Destination Chain** (e.g. Sui), **Payout Asset**, **Pool**, **Sweep Threshold** (e.g. 10).
   - **Payment profile (Sui):** Click “Create profile” (sign tx; gas from step 3). Profile ID appears.
   - **Save preferences** (for subdomain, saved via API).
5. **Copy payment link** — Dashboard → “Receive payments” → “Copy payment link” (e.g. `…/pay?to=alice.cashbackid.eth`).

**Payer (Bob):**

1. **Sign in** — Same flow (different session = different Sui address).
2. **Pay** — Open the payment link or go to **Pay** and paste `alice.cashbackid.eth`. Enter amount (e.g. 0.01 SUI), click “Send payment”.
3. **Result** — “Payment sent” and a transaction digest. Cashback is credited to Alice’s profile on Sui.

**Back to Alice:**

1. **Dashboard** — Open Dashboard (or refocus tab). “Cashback balance (Sui)” should reflect the received amount (or click refresh).
2. **Rewards** — Go to **Rewards** and claim if desired (Move call from app).

**LI.FI (Omnipin):**

1. As any connected user with preferences set, go to **Dashboard**.
2. Scroll to **Omnipin sweep**. You should see rows for mock balances (e.g. Chain 8453, 42161) with “Ready to sweep” or “Below threshold”.
3. Click **View route** on a “Ready to sweep” row → dialog with route summary and “Open in LI.FI”.

---

## How to demonstrate to judges

### 1. One-liner

**“We use Sui for identity (zkLogin-style) and cashback settlement: profiles, receiving payments via ENS, balance and claim. We use LI.FI to compute cross-chain routes from any chain to the user’s preferred chain (from ENS preferences) and show them in the dashboard with a link to execute on LI.FI.”**

### 2. Live demo (5–7 min)

1. **Landing** → Sign in (show no wallet extension; Sui address in session).
2. **Dashboard** → Claim `you.cashbackid.eth` (optional: show on-chain if configured).
3. **Verify** → Set chain/asset/pool, create Sui profile (show tx / profile ID), save preferences.
4. **Pay** (second browser or incognito): resolve ENS → enter amount → send. Show digest and “Payment sent”.
5. **Back to first user:** Dashboard → show **Cashback balance (Sui)** updated; optionally **Claim rewards**.
6. **LI.FI:** Dashboard → **Omnipin sweep** → “View route” → show route details and link to li.fi.

### 3. Code / architecture (if asked)

- **Sui:** `lib/sui-client.tsx` (connect, balance, profile, claim), `app/api/pay/route.ts` (`process_payment`), `app/api/create-profile/route.ts`.
- **LI.FI:** `lib/lifi-client.ts` (`buildCashbackRoute`, `evaluateOmnipinSweep`, `getRoutes` from `@lifi/sdk`), `lib/web3-providers.tsx` (`checkSweep`, `getClaimRoute`), Dashboard Omnipin card and “View route” dialog.
- **ENS:** Resolve returns `profileId` and preferences; Pay uses `profileId`; LI.FI uses preferences as destination.

### 4. APIs to show (optional)

- `GET /api/ens/resolve?name=alice.cashbackid.eth` → `profileId`, `suiAddress`, preferences.
- `POST /api/pay` body `{ "profileId": "<id>", "amount": 10000000 }` → `{ "digest": "..." }` (Sui tx).

---

## Checklist before submission

- [ ] `.env` or `.env.local` has `SUI_PRIVATE_KEY` (with SUI for gas) and `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` + `NEXT_PUBLIC_SUI_NETWORK`.
- [ ] Receiver has created a Sui profile and saved preferences so resolve returns `profileId`.
- [ ] One test payment (Pay → digest) and balance update on dashboard.
- [ ] Omnipin card visible with “View route” opening LI.FI route dialog.
- [ ] README or submission notes mention Sui (profiles, pay, balance, claim) and LI.FI (routes, Omnipin, “View route”).

---

## Tracks

- **Best Overall Sui Project:** Emphasize zkLogin-style connect, Sui profiles, `process_payment`, balance and claim on Sui, all without a browser extension.
- **Best Use of LI.FI Composer:** Emphasize ENS preferences as destination, `buildCashbackRoute` / `getRoutes`, Omnipin sweep evaluation, and “View route” with link to LI.FI for execution.
