import type { SupabaseClient } from "@supabase/supabase-js";
import { merchantWallets } from "@/lib/wallets/db";
import type { MerchantWallet } from "@/types/crypto-pay-db";

export type MerchantWalletCounts = {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
};

const emptyCounts = (): MerchantWalletCounts => ({
  total: 0,
  pending: 0,
  verified: 0,
  rejected: 0,
});

type WalletStatusRow = { user_id: string; status: string };

/** Aggregate `merchant_wallets` rows per user for admin tables. */
export async function getMerchantWalletCountsByUser(
  supabase: SupabaseClient,
  userIds: string[],
  preloadedRows?: WalletStatusRow[],
): Promise<Map<string, MerchantWalletCounts>> {
  const map = new Map<string, MerchantWalletCounts>();
  if (userIds.length === 0) return map;

  const userIdSet = new Set(userIds);
  let rows = preloadedRows;

  if (!rows) {
    const { data, error } = await merchantWallets(supabase)
      .select("user_id, status")
      .in("user_id", userIds);

    if (error) {
      console.error("[admin] merchant wallet counts:", error);
      return map;
    }
    rows = data as WalletStatusRow[] | undefined;
  }

  for (const row of rows ?? []) {
    if (!userIdSet.has(row.user_id)) continue;
    const uid = row.user_id as string;
    const counts = map.get(uid) ?? emptyCounts();
    counts.total += 1;
    const status = String(row.status);
    if (status === "pending") counts.pending += 1;
    else if (status === "verified") counts.verified += 1;
    else if (status === "rejected") counts.rejected += 1;
    map.set(uid, counts);
  }

  return map;
}

export async function listMerchantWalletsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<MerchantWallet[]> {
  const { data, error } = await merchantWallets(supabase)
    .select("*")
    .eq("user_id", userId)
    .order("is_primary", { ascending: false })
    .order("verification_requested_at", { ascending: false });

  if (error) {
    console.error("[admin] list merchant wallets:", error);
    return [];
  }

  return (data ?? []) as MerchantWallet[];
}
