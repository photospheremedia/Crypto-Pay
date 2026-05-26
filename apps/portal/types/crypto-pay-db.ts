/** Crypto Pay tables — extend generated Database types until next `supabase gen types` run */
export type WalletNetwork = "btc" | "eth" | "ltc" | "usdt" | "usdc";
export type WalletStatus = "pending" | "verified" | "rejected";

export type UserWalletProfile = {
  id: string;
  user_id: string;
  wallet_network: WalletNetwork;
  wallet_address: string;
  wallet_verified: boolean;
  created_at: string;
  updated_at: string;
};

export type MerchantWallet = {
  id: string;
  user_id: string;
  label: string;
  wallet_network: WalletNetwork;
  wallet_address: string;
  status: WalletStatus;
  is_primary: boolean;
  source?: "portal" | "runner_api";
  runner_client_id?: string | null;
  external_id?: string | null;
  verification_requested_at: string;
  last_admin_reminder_at?: string | null;
  merchant_status_emailed_at?: string | null;
  merchant_status_emailed_for_request?: string | null;
  verified_at: string | null;
  verified_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};
