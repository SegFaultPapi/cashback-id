export const mockUserData = {
  privacyScore: 87,
  availableRewards: "1.234",
  totalCashback: 523.45,
  activeMerchants: 12,
}

export const mockTransactions = [
  {
    id: "1",
    date: "2026-02-02",
    type: "cashback",
    merchant: "Amazon",
    amount: 125.00,
    cashback: 6.25,
    status: "completed",
    proofHash: "0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",
  },
  {
    id: "2",
    date: "2026-02-01",
    type: "cashback",
    merchant: "Starbucks",
    amount: 15.50,
    cashback: 0.47,
    status: "completed",
    proofHash: "0x2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890ab",
  },
  {
    id: "3",
    date: "2026-01-30",
    type: "reward",
    merchant: "Nike",
    amount: 250.00,
    cashback: 17.50,
    status: "completed",
    proofHash: "0x3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcd",
  },
  {
    id: "4",
    date: "2026-01-28",
    type: "cashback",
    merchant: "Uber",
    amount: 45.00,
    cashback: 2.25,
    status: "pending",
    proofHash: "0x4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
  },
  {
    id: "5",
    date: "2026-01-25",
    type: "cashback",
    merchant: "Spotify",
    amount: 9.99,
    cashback: 0.50,
    status: "completed",
    proofHash: "0x5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12",
  },
]

export const mockMerchants = [
  {
    id: "amazon",
    name: "Amazon",
    logo: "A",
    cashbackPercent: 5,
    category: "Shopping",
    description: "Online retail & cloud services",
    isActive: true,
  },
  {
    id: "starbucks",
    name: "Starbucks",
    logo: "S",
    cashbackPercent: 3,
    category: "Food & Drink",
    description: "Coffee & beverages",
    isActive: false,
  },
  {
    id: "nike",
    name: "Nike",
    logo: "N",
    cashbackPercent: 7,
    category: "Fashion",
    description: "Athletic apparel & footwear",
    isActive: true,
  },
  {
    id: "uber",
    name: "Uber",
    logo: "U",
    cashbackPercent: 5,
    category: "Transport",
    description: "Ride-sharing & delivery",
    isActive: false,
  },
  {
    id: "spotify",
    name: "Spotify",
    logo: "S",
    cashbackPercent: 5,
    category: "Entertainment",
    description: "Music streaming service",
    isActive: true,
  },
  {
    id: "apple",
    name: "Apple",
    logo: "A",
    cashbackPercent: 2,
    category: "Tech",
    description: "Electronics & software",
    isActive: false,
  },
  {
    id: "netflix",
    name: "Netflix",
    logo: "N",
    cashbackPercent: 4,
    category: "Entertainment",
    description: "Video streaming service",
    isActive: false,
  },
  {
    id: "target",
    name: "Target",
    logo: "T",
    cashbackPercent: 4,
    category: "Shopping",
    description: "Department store retail",
    isActive: true,
  },
]

export const mockLeaderboard = [
  { rank: 1, address: "0x742d...5f8C", rewards: 45.67, privacyScore: 98 },
  { rank: 2, address: "0x8ba1...0C87", rewards: 38.21, privacyScore: 95 },
  { rank: 3, address: "0x1234...5678", rewards: 32.45, privacyScore: 92 },
  { rank: 4, address: "0xabcd...ef01", rewards: 28.90, privacyScore: 91 },
  { rank: 5, address: "0x5678...9abc", rewards: 24.15, privacyScore: 89 },
  { rank: 6, address: "0x9def...2345", rewards: 21.33, privacyScore: 88 },
  { rank: 7, address: "0x3456...7890", rewards: 18.77, privacyScore: 87 },
  { rank: 8, address: "0x7890...abcd", rewards: 15.22, privacyScore: 85 },
  { rank: 9, address: "0xdef0...1234", rewards: 12.88, privacyScore: 84 },
  { rank: 10, address: "0x0123...4567", rewards: 10.05, privacyScore: 82 },
]

export const mockCashbackHistory = [
  { month: "Ago", amount: 45 },
  { month: "Sep", amount: 78 },
  { month: "Oct", amount: 92 },
  { month: "Nov", amount: 125 },
  { month: "Dic", amount: 98 },
  { month: "Ene", amount: 85 },
]

export const verificationProviders = [
  {
    id: "civic",
    name: "Civic",
    description: "Verificacion de ID gubernamental con pruebas zero-knowledge",
    badge: "ZK-Proof",
  },
  {
    id: "polygon-id",
    name: "Polygon ID",
    description: "Identidad soberana en la red de Polygon",
    badge: "ZK-Proof",
  },
  {
    id: "worldid",
    name: "World ID",
    description: "Prueba de humanidad preservando privacidad",
    badge: "ZK-Proof",
  },
]

export const stats = {
  totalRewardsDistributed: "2,847,293",
  activeUsers: "127,453",
  avgPrivacyScore: 89,
}
