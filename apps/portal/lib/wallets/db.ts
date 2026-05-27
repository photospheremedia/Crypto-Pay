import type { SupabaseClient } from "@supabase/supabase-js";
import type { MerchantWallet } from "@/types/crypto-pay-db";

/** Until `pnpm db:types` includes merchant_wallets */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = SupabaseClient<any, "public", any>;

export function merchantWallets(client: SupabaseClient) {
  return (client as AnyClient).from("merchant_wallets");
}

export type MerchantWalletRow = MerchantWallet;

/** Columns safe to send to merchant browsers (no admin/integration fields). */
export const MERCHANT_WALLET_PUBLIC_SELECT =
  "id, label, wallet_network, wallet_address, status, is_primary, verification_requested_at, verified_at, rejection_reason, created_at, updated_at";

export async function listUserMerchantWallets(
  client: SupabaseClient,
  userId: string,
): Promise<MerchantWallet[]> {
  const { data, error } = await merchantWallets(client)
    .select(MERCHANT_WALLET_PUBLIC_SELECT)
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[merchant_wallets] list error:", error.message);
    throw error;
  }
  return (data ?? []) as MerchantWallet[];
}
