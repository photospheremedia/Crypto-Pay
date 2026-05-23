export const BRAND = {
  name: "Crypto Pay",
  tagline: "Accept Crypto Payments. Instantly. Securely. Globally.",
  email: "support@cryptopay.com",
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001",
} as const;

export const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Developers", href: "/developers" },
  { label: "Dashboard", href: "/dashboard-preview" },
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
