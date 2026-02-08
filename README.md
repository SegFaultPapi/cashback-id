# Cashback ID

**Your name, your rules, your cashback**

A decentralized cashback platform that lets you earn rewards on any blockchain using your ENS identity. Spend on any chain, receive on your name. Your `.eth` identity stores where and how you get paid — powered by cross-chain execution.

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

- [Sui Documentation](https://docs.sui.io/)
- [ENS Documentation](https://docs.ens.domains/)
- [LI.FI Documentation](https://docs.li.fi/)
- [Next.js Documentation](https://nextjs.org/docs)

---


