/** Crypto Pay Supabase — must match Cursor MCP (connection C412-6403) */
export const SUPABASE = {
  projectRef: "hwntncyiqaltzvlidscg",
  url: "https://hwntncyiqaltzvlidscg.supabase.co",
  functionsUrl: "https://hwntncyiqaltzvlidscg.supabase.co/functions/v1",
  dashboardUrl:
    "https://supabase.com/dashboard/project/hwntncyiqaltzvlidscg",
  mcpConnectionId: "C412-6403",
} as const;

/** Logo brand — emerald + cyan gradient */
export const BRAND_COLORS = {
  primary: "#10b981",
  primaryDark: "#059669",
  primaryLight: "#34d399",
  accent: "#0891b2",
} as const;

export const BRAND = {
  name: "Crypto Pay",
  tagline: "Track and accept crypto payments. Privacy oriented. Wallet to wallet.",
  email: "support@cryptopay.sale",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://cryptopay.sale",
  colors: BRAND_COLORS,
} as const;

/** Merchant pricing — keep marketing copy in sync with billing logic */
export const PRICING = {
  standard: {
    planName: "Standard",
    baseFeePercent: 2,
  },
  businessScale: {
    planName: "Business Scale",
  },
} as const;

export const NAV_LINKS = [
  { key: "pricing", href: "/pricing" },
  { key: "howItWorks", href: "/how-it-works" },
  { key: "developers", href: "/developers" },
] as const;

export const CRYPTO_OPTIONS = [
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin" },
  { id: "tether", symbol: "USDT", name: "Tether" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin" },
] as const;

export const FIAT_CURRENCIES = [
  { code: "usd", label: "USD" },
  { code: "eur", label: "EUR" },
  { code: "gbp", label: "GBP" },
  { code: "cad", label: "CAD" },
  { code: "aud", label: "AUD" },
] as const;
