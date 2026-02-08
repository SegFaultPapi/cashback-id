# Cashback ID

**Your name, your rules, your cashback**

A decentralized cashback platform that lets you earn rewards on any blockchain using your ENS identity. Spend on any chain, receive on your name. Your `.eth` identity stores where and how you get paid — powered by cross-chain execution.

- **Repo:** [https://github.com/SegFaultPapi/cashback-id](https://github.com/SegFaultPapi/cashback-id)
- **Live:** [cashback-id.vercel.app](https://cashback-id.vercel.app)

---

## 🚀 Features

- **ENS Identity Integration**: Link your `.eth` name to configure cashback preferences
- **Cross-Chain Cashback**: Receive rewards on any supported blockchain via LI.FI routing
- **zkLogin Authentication**: One-tap signup with Apple or Google — no seed phrases, no gas confusion
- **Sui Blockchain**: Built on Sui for fast, low-cost transactions
- **Privacy-First**: Immutable proof persistence on Filecoin
- **Dashboard**: Track your cashback earnings, transactions, and rewards
- **Leaderboard**: Compete with other users and see top earners
- **Multi-Chain Support**: Configure preferences for different chains and assets

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with Radix UI components
- **Blockchain**: 
  - [Sui](https://sui.io/) - Main settlement layer with zkLogin
  - [ENS](https://ens.domains/) - Identity and payment preferences
  - [LI.FI](https://li.fi/) - Cross-chain routing

## 📋 Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- A wallet or ENS name (optional for initial setup)

## Deployed contracts

### Ethereum (mainnet)

| Contract / Role | Address |
|----------------|---------|
| **CashbackIdRegistrar** (subdomains `*.cashbackid.eth`) | [`0x590992a59EB5b989030A75AB8f32d2DFF0c70073`](https://etherscan.io/address/0x590992a59EB5b989030A75AB8f32d2DFF0c70073) |
| cashbackid.eth owner | `0x04BEf5bF293BB01d4946dBCfaaeC9a5140316217` |
| ENS Name Wrapper | `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401` |
| ENS Public Resolver | `0xF29100983E058B709F3D539b0c765937B804AC15` |

### Sui (testnet default)

| Contract | Address / ID |
|----------|----------------|
| **Move package** (profile + checkout, [GA-Asso/Hackmoney](https://github.com/GA-Asso/Hackmoney)) | `0xbdabfb7fb7822e83b2d8ba86d211347812bb3a6d454f64828ea3c17453f4e9aa` |

Override with `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` in `.env` if you deploy your own package.

---

## Sui and LI.FI: implementation and how they work in the app

### Sui

Sui is used for **identity (profiles)** and **cashback settlement**: balances, receiving payments, and claiming rewards.

| Piece | Where it lives | What it does |
|-------|----------------|---------------|
| **zkLogin-style connect** | `lib/sui-client.tsx` | Simulated flow: "Sign In" / "Continue with Google" derives a Sui address (no real OAuth in MVP), persists session in `localStorage`. In production you’d plug the real zkLogin (OAuth → JWT → prover → sign). |
| **Sui client** | `lib/sui-client.tsx` | `getSuiClient()` uses `NEXT_PUBLIC_SUI_NETWORK` and optional `NEXT_PUBLIC_SUI_RPC_URL`. Used for balance, owned objects, and transaction execution. |
| **Cashback balance** | `lib/sui-client.tsx` → `getCashbackBalance()` | Reads objects owned by the user from the cashback package and sums the `balance` field. Shown in the dashboard and refreshed on mount and when the tab becomes visible again. |
| **Profile (create)** | `lib/sui-client.tsx` → `createProfile()` | Calls Move `profile::create_and_transfer_to_sender`; user signs with their keypair. Returns the new profile object ID. |
| **Profile ID for Pay** | `lib/sui-client.tsx` → `getProfileId()` | Finds the user’s `CashbackProfile` object ID so ENS resolve can return it for payments. |
| **Pay (receive cashback)** | `app/api/pay/route.ts` | `POST /api/pay` with `profileId` and `amount`. Server uses `SUI_PRIVATE_KEY` and calls Move `checkout::process_payment(profile, coin, merchant)`. The recipient’s cashback balance on Sui is credited. |
| **Claim rewards** | `lib/sui-client.tsx` + `/rewards` | User can claim accumulated cashback from their profile on Sui (Move call from the app). |

**Flow in the app:** Connect (zkLogin-style) → claim/link ENS → create Sui profile in Verify → set preferences (chain, asset, pool) → others pay to your ENS → backend runs `process_payment` on Sui → your cashback balance increases. You see the balance in the dashboard and can refresh it or claim rewards from the Rewards page.

### LI.FI

LI.FI is used for **cross-chain routing**: when cashback exists on another chain (e.g. USDC on Base), the app can suggest a route to the user’s preferred chain/asset (e.g. Sui) and show a “Ver ruta” (view route) action.

| Piece | Where it lives | What it does |
|-------|----------------|---------------|
| **Preferences** | ENS text records | `cashbackid.chain`, `cashbackid.asset`, `cashbackid.pool`, and optional threshold. Resolved in `lib/ens-resolver.ts` and passed into LI.FI as destination chain/token. |
| **Build route** | `lib/lifi-client.ts` → `buildCashbackRoute()` | Uses `@lifi/sdk` `getRoutes()`: source chain + token + amount → destination chain + token (from preferences). Returns route, estimated output, gas cost, time, and a summary string. |
| **Quote** | `lib/lifi-client.ts` → `getCashbackQuote()` | Optional path using `getQuote()` for a single cross-chain quote. |
| **Transfer status** | `lib/lifi-client.ts` → `checkTransferStatus()` | Given `txHash`, `fromChainId`, `toChainId`, returns status (PENDING, DONE, FAILED, etc.) from LI.FI. |
| **Omnipin sweep** | `lib/lifi-client.ts` → `evaluateOmnipinSweep()` | Takes a list of balances per chain (chainId, tokenAddress, amount, amountUSD), user address, and preferences. For each balance: if already on preferred chain or below threshold (default $10), marks “no sweep”; otherwise builds a LI.FI route and marks “Ready to sweep”. |
| **Dashboard** | `app/dashboard/dashboard-content.tsx` | Calls `checkSweep(balances)` (today with mock balances; can be replaced with real per-chain balances). For each result “Ready to sweep”, shows “Ver ruta”; clicking opens a dialog with route summary, estimated output, gas, time, and link to [li.fi](https://li.fi). |
| **Wallet context** | `lib/web3-providers.tsx` | Exposes `getClaimRoute(sourceChainId, sourceTokenAddress, amount)` and `checkSweep(balances)` so the dashboard (and any future sweep UI) can build routes and evaluate sweep without calling LI.FI directly. |

**Flow in the app:** User has ENS preferences (e.g. “receive on Sui”). Dashboard shows an “Omnipin sweep” card: for each chain where the user has balance above the threshold, LI.FI is asked for a route to the preferred chain. If a route exists, the row shows “Ready to sweep” and “Ver ruta” opens a modal with details and a link to LI.FI to execute the bridge. Execution is done on LI.FI’s site; the app only displays the route and link.

### Summary

- **Sui**: Profiles, balance, Pay (server signs `process_payment`), claim rewards. Balance refreshes on load and when the tab is focused; optional refresh button in the dashboard.
- **LI.FI**: Routes from any supported chain/token to the user’s preferred chain/token (from ENS). Used in the dashboard for “Omnipin sweep” and “View route”. No execution in-app; user follows the link to LI.FI to perform the transfer.

---

## Code locations: Sui, LI.FI, ENS

Where to find each integration in the repo.

### Sui

| Path | Purpose |
|------|---------|
| `lib/sui-client.tsx` | Sui provider, `getSuiClient()`, zkLogin-style `connectWithZkLogin`, `getCashbackBalance()`, `getProfileId()`, `createProfile()`, `claimRewards()`, `refreshBalance()`. |
| `lib/sui-server.ts` | Server-side Sui client and keypair from `SUI_PRIVATE_KEY` (used by API routes). |
| `app/api/pay/route.ts` | `POST /api/pay`: builds and executes Move `checkout::process_payment(profile, coin, merchant)` on Sui. |
| `app/api/create-profile/route.ts` | `POST /api/create-profile`: optional server-side profile creation. |
| `app/dashboard/dashboard-content.tsx` | Uses `useSui()`, displays cashback balance, refresh button, link to Rewards. |
| `app/rewards/page.tsx` | Claim rewards UI; calls Sui to claim from profile. |
| `app/verify/page.tsx` | “Create profile” (Sui), profile ID field; reads `getProfileId()` for preferences. |

### LI.FI

| Path | Purpose |
|------|---------|
| `lib/lifi-client.ts` | `buildCashbackRoute()`, `getCashbackQuote()`, `checkTransferStatus()`, `evaluateOmnipinSweep()`, `TOKEN_ADDRESSES`, types (`CashbackRoute`, `OmnipinSweepResult`). Uses `@lifi/sdk` (`getRoutes`, `getQuote`, `getStatus`). |
| `lib/web3-providers.tsx` | Wallet context: `getClaimRoute()`, `checkSweep()` (wrap `buildCashbackRoute` and `evaluateOmnipinSweep`). |
| `app/dashboard/dashboard-content.tsx` | Omnipin sweep card: `checkSweep(MOCK_BALANCES)`, “View route” button, dialog with route summary and link to li.fi. |

### ENS

| Path | Purpose |
|------|---------|
| `lib/ens-resolver.ts` | `resolvePaymentPreferences(name)`: resolves ENS (Public Resolver + app store), returns `profileId`, `suiAddress`, `chainId`, `asset`, `pool`, `threshold`. `CashbackPreferences` type, `SUPPORTED_CHAINS`, `SUPPORTED_ASSETS`, `isCashbackIdSubdomain()`. |
| `lib/ens-subdomain-store.ts` | In-memory store for `*.cashbackid.eth`: `claimSubdomain()`, `setPreferences()`, `getByEnsName()`, `getByLabel()`, `isLabelAvailable()`. Persists to `data/ens-store.json` when configured. |
| `lib/ens-registrar-server.ts` | On-chain registration: `registerSubdomainOnChain(label)`, `getRegistrarStatus()`. Uses CashbackIdRegistrar + Name Wrapper (Ethereum). |
| `app/api/ens/resolve/route.ts` | `GET /api/ens/resolve?name=...`: returns profileId, suiAddress, preferences (for subdomains from store + on-chain ENS when applicable). |
| `app/api/ens/claim-subdomain/route.ts` | `POST /api/ens/claim-subdomain`: claim `label.cashbackid.eth`, optional on-chain registration. |
| `app/api/ens/set-preferences/route.ts` | `POST /api/ens/set-preferences`: save chain, asset, pool, threshold, profileId, suiAddress for a subdomain. |
| `app/api/ens/register-onchain/route.ts` | `POST /api/ens/register-onchain`: register an already-claimed subdomain on Ethereum. |
| `app/api/ens/registrar-status/route.ts` | `GET /api/ens/registrar-status`: config status for on-chain registration (no secrets). |
| `app/verify/page.tsx` | Link ENS, set preferences form, build tx for non-subdomain ENS (Public Resolver). |
| `app/dashboard/dashboard-content.tsx` | Claim subdomain UI, payment link (ENS name), Pay tab (resolve ENS before paying). |
| `app/pay/page.tsx` | Resolve ENS (subdomain via `/api/ens/resolve`, other via `resolvePaymentPreferences`), show profile and send payment. |

---

## Protocol integration (exact locations by track)

Links point to the line where each protocol/API is used. Base: [https://github.com/SegFaultPapi/cashback-id](https://github.com/SegFaultPapi/cashback-id).

---

### Sui integration

| What | File | Line | Link |
|------|------|------|------|
| Sui client + RPC | `lib/sui-client.tsx` | 84–92 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/sui-client.tsx#L84 |
| `getCashbackBalance()` (read balance from chain) | `lib/sui-client.tsx` | 260 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/sui-client.tsx#L260 |
| `createProfile()` (Move `profile::create_and_transfer_to_sender`) | `lib/sui-client.tsx` | 310 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/sui-client.tsx#L310 |
| `getProfileId()` (owned objects) | `lib/sui-client.tsx` | 289 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/sui-client.tsx#L289 |
| Pay API – Move `checkout::process_payment` | `app/api/pay/route.ts` | 56 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/api/pay/route.ts#L56 |
| Server Sui client + keypair | `lib/sui-server.ts` | 26–45 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/sui-server.ts#L26 |
| Dashboard – fetch balance | `app/dashboard/dashboard-content.tsx` | 146 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/dashboard/dashboard-content.tsx#L146 |
| Verify – create profile | `app/verify/page.tsx` | 116 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/verify/page.tsx#L116 |
| Rewards – balance + claim | `app/rewards/page.tsx` | 170, 194 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/rewards/page.tsx#L170 |

---

### ENS integration

| What | File | Line | Link |
|------|------|------|------|
| `resolvePaymentPreferences()` (ENS + store → profileId, preferences) | `lib/ens-resolver.ts` | 106 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/ens-resolver.ts#L106 |
| `claimSubdomain()` (claim `*.cashbackid.eth`) | `lib/ens-subdomain-store.ts` | 145 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/ens-subdomain-store.ts#L145 |
| API – claim subdomain | `app/api/ens/claim-subdomain/route.ts` | 43 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/api/ens/claim-subdomain/route.ts#L43 |
| API – resolve (returns profileId, preferences) | `app/api/ens/resolve/route.ts` | — | https://github.com/SegFaultPapi/cashback-id/blob/main/app/api/ens/resolve/route.ts |
| API – set preferences | `app/api/ens/set-preferences/route.ts` | — | https://github.com/SegFaultPapi/cashback-id/blob/main/app/api/ens/set-preferences/route.ts |
| On-chain registration (registrar) | `lib/ens-registrar-server.ts` | 140 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/ens-registrar-server.ts#L140 |
| Pay page – resolve ENS before paying | `app/pay/page.tsx` | 59 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/pay/page.tsx#L59 |
| Dashboard – resolve for Pay tab | `app/dashboard/dashboard-content.tsx` | 186 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/dashboard/dashboard-content.tsx#L186 |

---

### LI.FI integration

| What | File | Line | Link |
|------|------|------|------|
| Import `@lifi/sdk` (`getRoutes`, `getQuote`, `getStatus`) | `lib/lifi-client.ts` | 13 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/lifi-client.ts#L13 |
| `buildCashbackRoute()` – call `getRoutes()` | `lib/lifi-client.ts` | 164 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/lifi-client.ts#L164 |
| `evaluateOmnipinSweep()` – threshold + route per chain | `lib/lifi-client.ts` | 291 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/lifi-client.ts#L291 |
| Omnipin – call `buildCashbackRoute()` for each balance | `lib/lifi-client.ts` | 325 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/lifi-client.ts#L325 |
| Wallet context – `getClaimRoute` (uses `buildCashbackRoute`) | `lib/web3-providers.tsx` | 359 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/web3-providers.tsx#L359 |
| Wallet context – `checkSweep` (uses `evaluateOmnipinSweep`) | `lib/web3-providers.tsx` | 413 | https://github.com/SegFaultPapi/cashback-id/blob/main/lib/web3-providers.tsx#L413 |
| Dashboard – Omnipin card + View route | `app/dashboard/dashboard-content.tsx` | 586–608 | https://github.com/SegFaultPapi/cashback-id/blob/main/app/dashboard/dashboard-content.tsx#L586 |

---

## Hackathon: link to the line of code (by track)

For submission forms, **one canonical link per track**:

- **Sui:** https://github.com/SegFaultPapi/cashback-id/blob/main/lib/sui-client.tsx#L260  
- **ENS:** https://github.com/SegFaultPapi/cashback-id/blob/main/lib/ens-resolver.ts#L106  
- **LI.FI:** https://github.com/SegFaultPapi/cashback-id/blob/main/lib/lifi-client.ts#L164  

---

## Testing the ENS flow

With env vars set (see [Environment variables](#environment-variables)), you can test the full ENS path:

1. **Start the app** — `pnpm dev` and open the dashboard.
2. **Connect a Sui “wallet”** — In this app, **you do not install a Sui Wallet extension**. Click **“Sign In”** or **“Continue with Google”** on the landing (or the wallet button in the header). The app uses a **zkLogin-style** flow: for the current MVP the flow is **simulated** (no real Google OAuth popup). Clicking connect generates a Sui address and saves the session in `localStorage`. You are then “connected” with that address for claiming subdomains, creating a profile, and receiving payments. For on-chain actions (create profile, claim rewards) that address needs SUI for gas on testnet.
3. **Claim a subdomain** — In the dashboard, use “Get my .cashbackid.eth” (optional label, e.g. `alice`). You should see e.g. “Welcome, alice.cashbackid.eth”. If `PRIVATE_KEY` and `ETH_RPC_URL` are set and the wallet has ETH, the name is also registered on-chain (custodial).
4. **Set preferences** — Go to **Verify**, fill chain, asset, pool, and **profileId** (from your Sui profile) so you can receive payments.
5. **Resolve and pay** — In **Pay**, enter `alice.cashbackid.eth` (or your label). The app resolves via `/api/ens/resolve` and you can send a payment to that profile.

**Note:** Locally, data is persisted in `data/ens-store.json`. On serverless (e.g. Vercel) the store is in-memory only unless you add a DB.

---

## User flows (Mermaid)

### 1. General flow: landing to usage

```mermaid
flowchart LR
  A[Landing] -->|Connect wallet| B{Dashboard}
  B --> C[Overview]
  B --> D[Pay]
  B --> E[Activity]
  B --> F[Verify / Profile]
  B --> G[Rewards]
  F --> H[Create Sui profile]
  F --> I[Set preferences]
  D --> J[Resolve ENS]
  J --> K[Send payment]
  K --> L[Cashback credited]
```

### 2. Onboarding: identity and profile

```mermaid
flowchart TD
  Start([User connected]) --> A{Has ENS?}
  A -->|No| B[Claim you.cashbackid.eth]
  A -->|Yes| C[Link existing ENS]
  B --> D[Go to Verify]
  C --> D
  D --> E{Sui profile?}
  E -->|No| F[Create profile - sign and gas]
  E -->|Yes| G[Set preferences]
  F --> G
  G --> H[Save via API]
  H --> I([Ready to receive payments])
```

### 3. Send a payment (Pay)

```mermaid
sequenceDiagram
  participant U as User
  participant App as App
  participant API as API / ENS
  participant Sui as Sui (checkout)

  U->>App: Enter ENS and amount
  App->>API: Resolve ENS (resolve / api/ens/resolve)
  API-->>App: profileId, preferences
  App->>App: Show Profile found
  U->>App: Confirm send
  App->>API: POST /api/pay (profileId, amount)
  API->>Sui: process_payment (server signs)
  Sui-->>API: digest
  API-->>App: digest
  App-->>U: Payment sent, cashback to recipient
```

### 4. Verify and configure profile (Verify)

```mermaid
flowchart TD
  V([Verify]) --> S1[Step 1: ENS]
  S1 -->|Subdomain .cashbackid.eth| API1[POST /api/ens/claim-subdomain]
  S1 -->|Existing ENS| Link[linkEnsName]
  API1 --> S2[Step 2: Preferences]
  Link --> S2
  S2 --> Profile{Sui profile?}
  Profile -->|No| Create[Create profile - createProfile]
  Profile -->|Yes| Prefs[Chain, Asset, Pool, threshold]
  Create --> Prefs
  Prefs -->|Subdomain| API2[POST /api/ens/set-preferences]
  Prefs -->|ENS on-chain| Tx[Build tx / sign]
  API2 --> Success([Done])
  Tx --> Success
```

### 5. High-level architecture

```mermaid
flowchart TB
  subgraph Client["Frontend (Next.js)"]
    Landing[Landing]
    Dashboard[Dashboard]
    Verify[Verify]
    Pay[Pay]
    Rewards[Rewards]
  end

  subgraph APIs["API Routes"]
    Claim[claim-subdomain]
    Prefs[set-preferences]
    Resolve[resolve]
    CreateProfile[create-profile]
    PayAPI[pay]
  end

  subgraph External["External"]
    ENS[ENS / Ethereum]
    Sui[Sui Network]
    LiFi[LI.FI]
  end

  Landing --> Dashboard
  Dashboard --> Pay
  Dashboard --> Verify
  Verify --> Claim
  Verify --> Prefs
  Verify --> CreateProfile
  Pay --> Resolve
  Pay --> PayAPI
  Claim --> Store[(Store JSON)]
  Prefs --> Store
  Resolve --> Store
  Resolve --> ENS
  CreateProfile --> Sui
  PayAPI --> Sui
  Dashboard -.-> LiFi
```

---

## 🏃 Getting Started

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cashback-id
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file in the root directory:
```env
# Add your environment variables here
# Example:
# NEXT_PUBLIC_SUI_NETWORK=testnet
# NEXT_PUBLIC_ENS_RPC_URL=your_ens_rpc_url
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cashback-id/
├── app/                    # Next.js app router pages
│   ├── dashboard/         # User dashboard
│   ├── leaderboard/       # Leaderboard page
│   ├── rewards/          # Rewards management
│   ├── transactions/     # Transaction history
│   ├── verify/           # ENS verification
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # React components
│   ├── ui/              # Reusable UI components (shadcn/ui)
│   ├── cashback-chart.tsx
│   ├── header.tsx
│   ├── footer.tsx
│   └── ...
├── lib/                  # Core libraries and utilities
│   ├── ens-resolver.ts   # ENS name resolution and preferences
│   ├── sui-client.tsx    # Sui blockchain integration
│   ├── lifi-client.ts    # Cross-chain routing
│   ├── filecoin-persistence.ts  # Proof storage
│   ├── web3-providers.tsx       # Web3 context provider
│   └── utils.ts         # Utility functions
├── hooks/                # Custom React hooks
├── public/               # Static assets
├── styles/               # Global styles
└── package.json
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🌐 How It Works

1. **Connect**: Sign in with Apple or Google using Sui zkLogin
2. **Link ENS**: Connect your `.eth` name to set payment preferences
3. **Configure**: Set which chains and assets you want to receive cashback on
4. **Earn**: Make purchases and automatically earn cashback
5. **Receive**: Cashback is routed cross-chain to your preferred address via LI.FI
6. **Track**: Monitor all earnings and transactions in your dashboard

## 🔐 Security

- **zkLogin**: Passwordless authentication without seed phrases
- **ENS Verification**: Cryptographic verification of identity
- **Immutable Proofs**: All cashback transactions are stored on Filecoin
- **Cross-Chain Security**: LI.FI's secure routing infrastructure

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is private and proprietary.

## 🔗 Links

- [docs/HACKATHON_DEMO_SUI_LIFI.md](docs/HACKATHON_DEMO_SUI_LIFI.md) — **How to test and demonstrate Sui + LI.FI for the hackathon** (judges, checklist, flows).
- [docs/MVP_CHECKLIST.md](docs/MVP_CHECKLIST.md) — MVP status and requirements for end-to-end flow.
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — Implementation plan and Sui contract usage (Hackmoney).
- [docs/ENS_CUSTOM_TEXT_RECORDS_AND_SUBDOMAINS.md](docs/ENS_CUSTOM_TEXT_RECORDS_AND_SUBDOMAINS.md) — ENS records and `.cashbackid.eth` subdomains.

---


