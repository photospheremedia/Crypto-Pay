"use client";

import type { MerchantWalletPublic } from "@/lib/wallets/merchant-wallet-public";
import { parseJsonApiResponse } from "@/lib/api/parse-json-api-response";
import type { MerchantWalletInput } from "@/lib/wallets/validation";

export const MERCHANT_WALLETS_API_KEY = "/api/account/wallets";

type WalletsListResponse = { success: true; wallets: MerchantWalletPublic[] };
type WalletResponse = { success: true; wallet: MerchantWalletPublic };
type SuccessResponse = { success: true };

function toApiBody(input: Omit<MerchantWalletInput, "id">) {
  return {
    label: input.label,
    wallet_network: input.walletNetwork,
    wallet_address: input.walletAddress,
    is_primary: input.isPrimary ?? false,
  };
}

export async function fetchMerchantWallets(): Promise<MerchantWalletPublic[]> {
  const res = await fetch(MERCHANT_WALLETS_API_KEY, { credentials: "include" });
  const parsed = await parseJsonApiResponse<WalletsListResponse>(
    res,
    "Failed to load wallets",
  );
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.data.wallets ?? [];
}

export async function fetchMerchantWallet(id: string): Promise<MerchantWalletPublic> {
  const res = await fetch(`${MERCHANT_WALLETS_API_KEY}/${id}`, {
    credentials: "include",
  });
  const parsed = await parseJsonApiResponse<WalletResponse>(
    res,
    "Failed to load wallet",
  );
  if (!parsed.ok) throw new Error(parsed.error);
  if (!parsed.data.wallet) throw new Error("Wallet not found");
  return parsed.data.wallet;
}

export async function createMerchantWallet(
  input: Omit<MerchantWalletInput, "id">,
): Promise<MerchantWalletPublic> {
  const res = await fetch(MERCHANT_WALLETS_API_KEY, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiBody(input)),
  });
  const parsed = await parseJsonApiResponse<WalletResponse>(
    res,
    "Failed to create wallet",
  );
  if (!parsed.ok) throw new Error(parsed.error);
  if (!parsed.data.wallet) throw new Error("Failed to create wallet");
  return parsed.data.wallet;
}

export async function updateMerchantWallet(
  id: string,
  input: Omit<MerchantWalletInput, "id">,
): Promise<MerchantWalletPublic> {
  const res = await fetch(`${MERCHANT_WALLETS_API_KEY}/${id}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(toApiBody(input)),
  });
  const parsed = await parseJsonApiResponse<WalletResponse>(
    res,
    "Failed to update wallet",
  );
  if (!parsed.ok) throw new Error(parsed.error);
  if (!parsed.data.wallet) throw new Error("Failed to update wallet");
  return parsed.data.wallet;
}

export async function deleteMerchantWallet(id: string): Promise<void> {
  const res = await fetch(`${MERCHANT_WALLETS_API_KEY}/${id}/delete`, {
    method: "POST",
    credentials: "include",
  });
  const parsed = await parseJsonApiResponse<SuccessResponse>(
    res,
    "Failed to delete wallet",
  );
  if (!parsed.ok) throw new Error(parsed.error);
}

export async function resendMerchantWalletVerification(id: string): Promise<void> {
  const res = await fetch(`${MERCHANT_WALLETS_API_KEY}/${id}/resend`, {
    method: "POST",
    credentials: "include",
  });
  const parsed = await parseJsonApiResponse<SuccessResponse>(
    res,
    "Failed to resend verification",
  );
  if (!parsed.ok) throw new Error(parsed.error);
}
