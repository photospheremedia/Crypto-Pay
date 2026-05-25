/** Crypto Pay tables — extend generated Database types until next `supabase gen types` run */
export type UserWalletProfile = {
  id: string;
  user_id: string;
  wallet_network: "btc" | "eth" | "ltc" | "usdt" | "usdc";
  wallet_address: string;
  wallet_verified: boolean;
  created_at: string;
  updated_at: string;
};
