# Hackathon Submission – Prize Answers

Copy the text below into the submission form. Replace `YOUR_ORG` with your GitHub org/username and `main` with your branch if different (e.g. `gerryfix`).

---

## Sui – $10,000

**Please add a sentence or two on why you're applicable for this prize.**

Cashback ID uses Sui for identity (zkLogin-style connect), on-chain profiles (`profile::create_and_transfer_to_sender`), and cashback settlement. When someone pays to your ENS name, the server calls Move `checkout::process_payment` on Sui so the recipient's balance is credited; users see their cashback balance in the dashboard and can claim rewards on Sui—all without a browser wallet extension.

**Link to the line of code where the tech is used.**

- Sui client (balance, profile, claim):  
  https://github.com/YOUR_ORG/cashback-id/blob/main/lib/sui-client.tsx#L260  
- Pay API (Move `process_payment`):  
  https://github.com/YOUR_ORG/cashback-id/blob/main/app/api/pay/route.ts#L56  

**How easy is it to use the API / Protocol? (1 - very difficult, 10 - very easy)**  
**8**

**Additional feedback.**

The @mysten/sui and Move patterns (keypair, Transaction, moveCall) are clear. Documentation is good; RPC and package ID configuration were straightforward. We use the Hackmoney package (profile + checkout) on testnet.

---

## ENS – $5,000

**Please add a sentence or two on why you're applicable for this prize.**

We use ENS for identity and payment preferences: users claim or link a name (e.g. `you.cashbackid.eth`), and we store chain, asset, pool, and Sui profile ID as preferences. Resolve returns `profileId` and preferences so Pay can credit cashback to the correct Sui profile; we also support on-chain registration of `*.cashbackid.eth` subdomains via a custom registrar.

**Link to the line of code where the tech is used.**

- Resolve preferences (ENS + store):  
  https://github.com/YOUR_ORG/cashback-id/blob/main/lib/ens-resolver.ts#L106  
- Claim subdomain:  
  https://github.com/YOUR_ORG/cashback-id/blob/main/app/api/ens/claim-subdomain/route.ts#L43  
- Resolve API:  
  https://github.com/YOUR_ORG/cashback-id/blob/main/app/api/ens/resolve/route.ts  

**How easy is it to use the API / Protocol? (1 - very difficult, 10 - very easy)**  
**8**

**Additional feedback.**

ENS resolution and Custom Text Records are well documented. Our flow combines the public resolver with an app-level store for `*.cashbackid.eth` and on-chain registration; integrating the Name Wrapper and our custom registrar was the trickiest part.

---

## LI.FI – $6,000

**Please add a sentence or two on why you're applicable for this prize.**

We use the LI.FI SDK to build cross-chain routes from any supported chain (e.g. Base, Arbitrum) to the user's preferred chain and asset from their ENS preferences. The dashboard shows an "Omnipin sweep" card: for each balance above the threshold we call `getRoutes()` to get the best route and display a "View route" with summary, gas, and a link to execute on LI.FI—orchestrating multi-chain cashback in one flow.

**Link to the line of code where the tech is used.**

- Build route (LI.FI `getRoutes`):  
  https://github.com/YOUR_ORG/cashback-id/blob/main/lib/lifi-client.ts#L164  
- Omnipin sweep (evaluate + route):  
  https://github.com/YOUR_ORG/cashback-id/blob/main/lib/lifi-client.ts#L325  
- SDK import:  
  https://github.com/YOUR_ORG/cashback-id/blob/main/lib/lifi-client.ts#L13  

**How easy is it to use the API / Protocol? (1 - very difficult, 10 - very easy)**  
**8**

**Additional feedback.**

The LI.FI SDK (`getRoutes`, `getQuote`, `getStatus`) is easy to integrate. We pass source and destination from the user's ENS preferences and show the route in the UI; execution is done on li.fi. Clear documentation and type definitions.

---

## Quick reference (replace YOUR_ORG in URLs)

| Prize | File(s) and lines |
|-------|-------------------|
| Sui | `lib/sui-client.tsx` (L260), `app/api/pay/route.ts` (L56) |
| ENS | `lib/ens-resolver.ts` (L106), `app/api/ens/claim-subdomain/route.ts` (L43) |
| LI.FI | `lib/lifi-client.ts` (L13, L164, L325) |
