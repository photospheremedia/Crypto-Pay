"use client";

import useSWR from "swr";
import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import {
  MERCHANT_WALLETS_API_KEY,
  fetchMerchantWallets,
} from "@/lib/api/account-wallets-client";

export function useMerchantWallets(initialWallets?: MerchantWalletPublic[]) {
  const { data, error, isLoading, isValidating, mutate } = useSWR(
    MERCHANT_WALLETS_API_KEY,
    fetchMerchantWallets,
    {
      fallbackData: initialWallets,
      revalidateOnFocus: true,
      dedupingInterval: 5_000,
    },
  );

  const wallets = data ?? [];
  const pendingWalletCount = wallets.filter((w) => w.status === "pending").length;
  const hasVerifiedWallet = wallets.some((w) => w.status === "verified");

  return {
    wallets,
    pendingWalletCount,
    hasVerifiedWallet,
    isLoading: isLoading && !data,
    isRefreshing: isValidating,
    error: error instanceof Error ? error.message : null,
    refresh: mutate,
  };
}
