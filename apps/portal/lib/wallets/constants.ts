export const WALLET_NETWORKS = [
  { value: "btc", label: "Bitcoin (BTC)" },
  { value: "eth", label: "Ethereum (ETH)" },
  { value: "ltc", label: "Litecoin (LTC)" },
  { value: "usdt", label: "Tether (USDT)" },
  { value: "usdc", label: "USD Coin (USDC)" },
] as const;

export type WalletNetwork = (typeof WALLET_NETWORKS)[number]["value"];

export const WALLET_STATUSES = ["pending", "verified", "rejected"] as const;
export type WalletStatus = (typeof WALLET_STATUSES)[number];

export const ADMIN_REVIEW_EMAIL = "photospheremedia00@gmail.com";

export function walletNetworkLabel(network: string): string {
  return WALLET_NETWORKS.find((n) => n.value === network)?.label ?? network.toUpperCase();
}

export function walletStatusLabel(status: string): string {
  switch (status) {
    case "verified":
      return "Verified";
    case "rejected":
      return "Rejected";
    default:
      return "Pending verification";
  }
}
