import type {
  MerchantWallet,
  WalletNetwork,
  WalletStatus,
} from "@/types/crypto-pay-db";
import type { WalletServiceErrorCode } from "@/lib/wallets/merchant-wallet-service";

/** Fields safe to expose to signed-in merchants (no admin / integration metadata). */
export type MerchantWalletPublic = {
  id: string;
  label: string;
  wallet_network: WalletNetwork;
  wallet_address: string;
  status: WalletStatus;
  is_primary: boolean;
  verification_requested_at: string;
  verified_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
};

export function toPublicMerchantWallet(
  row: MerchantWallet | Record<string, unknown>,
): MerchantWalletPublic {
  return {
    id: String(row.id),
    label: String(row.label),
    wallet_network: row.wallet_network as WalletNetwork,
    wallet_address: String(row.wallet_address),
    status: row.status as WalletStatus,
    is_primary: Boolean(row.is_primary),
    verification_requested_at: String(row.verification_requested_at),
    verified_at: row.verified_at != null ? String(row.verified_at) : null,
    rejection_reason:
      row.rejection_reason != null ? String(row.rejection_reason) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  };
}

export function toPublicMerchantWallets(
  rows: (MerchantWallet | Record<string, unknown>)[],
): MerchantWalletPublic[] {
  return rows.map(toPublicMerchantWallet);
}

const WALLET_PUBLIC_ERRORS: Record<
  WalletServiceErrorCode,
  { message: string; code: string; status: number }
> = {
  invalid: { message: "Invalid wallet details.", code: "bad_request", status: 400 },
  not_found: { message: "Wallet not found.", code: "not_found", status: 404 },
  duplicate_name: {
    message: "A wallet with this name already exists.",
    code: "conflict",
    status: 409,
  },
  save_failed: {
    message: "Could not save wallet. Please try again.",
    code: "bad_request",
    status: 400,
  },
  update_failed: {
    message: "Could not update wallet. Please try again.",
    code: "bad_request",
    status: 400,
  },
  delete_only_pending: {
    message: "Only pending wallets can be removed.",
    code: "bad_request",
    status: 400,
  },
  resend_only_pending: {
    message: "Only pending wallets can request a new review.",
    code: "bad_request",
    status: 400,
  },
  resend_cooldown: {
    message: "Please wait before sending another reminder.",
    code: "too_many_requests",
    status: 429,
  },
  reminder_failed: {
    message: "Could not send reminder. Please try again later.",
    code: "bad_request",
    status: 400,
  },
  request_update_failed: {
    message: "Could not update request. Please try again.",
    code: "bad_request",
    status: 400,
  },
};

export function walletServiceErrorResponse(code: WalletServiceErrorCode) {
  const mapped = WALLET_PUBLIC_ERRORS[code];
  return {
    body: { success: false as const, error: mapped.message, code: mapped.code },
    status: mapped.status,
  };
}
