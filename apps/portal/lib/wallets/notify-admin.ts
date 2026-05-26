import { sendEmail } from "@/lib/email/sender";
import { ADMIN_REVIEW_EMAIL } from "./constants";
import type { MerchantWallet } from "@/types/crypto-pay-db";

type NotifyKind = "submitted" | "resend";

const RESEND_IDEMPOTENCY_MS = 24 * 60 * 60 * 1000;

export async function notifyAdminWalletReview(params: {
  kind: NotifyKind;
  wallet: Pick<
    MerchantWallet,
    "id" | "label" | "wallet_network" | "wallet_address" | "status"
  >;
  merchantEmail: string;
  merchantUserId: string;
  source?: string;
  idempotencyKey?: string;
}): Promise<{ success: boolean; error?: string }> {
  const { kind, wallet, merchantEmail, merchantUserId, source = "portal" } = params;

  const subjectPrefix =
    kind === "resend" ? "Reminder — wallet pending" : "New wallet pending";

  const dayBucket = new Date().toISOString().slice(0, 10);
  const idempotencyKey =
    params.idempotencyKey ??
    (kind === "resend"
      ? `wallet-admin-resend/${wallet.id}/${dayBucket}`
      : `wallet-admin-new/${wallet.id}`);

  return sendEmail({
    to: { email: ADMIN_REVIEW_EMAIL, name: "Crypto Pay Admin" },
    subject: `[Crypto Pay] ${subjectPrefix}: ${wallet.label}`,
    template: "wallet_pending_admin",
    templateData: {
      kind,
      merchantEmail,
      walletLabel: wallet.label,
      walletNetwork: wallet.wallet_network,
      walletAddress: wallet.wallet_address,
      walletId: wallet.id,
      source,
    },
    tags: ["wallet", "admin-review", kind],
    idempotencyKey,
    workflow: {
      event:
        kind === "resend"
          ? "wallet.verification_resend"
          : "wallet.verification_requested",
      entityId: wallet.id,
      actorId: merchantUserId,
    },
  });
}

export { RESEND_IDEMPOTENCY_MS };

export async function notifyMerchantWalletSubmitted(params: {
  merchantEmail: string;
  label: string;
  walletNetwork: string;
}): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to: { email: params.merchantEmail },
    template: "wallet_submitted_merchant",
    templateData: {
      walletLabel: params.label,
      walletNetwork: params.walletNetwork,
    },
    tags: ["wallet", "merchant", "submitted"],
    workflow: { event: "wallet.submitted", entityId: params.label },
  });
}

export async function notifyMerchantWalletStatus(params: {
  merchantEmail: string;
  label: string;
  status: "verified" | "rejected";
  walletNetwork?: string;
  walletAddress?: string;
  rejectionReason?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const { merchantEmail, label, status, rejectionReason, walletNetwork, walletAddress } =
    params;
  const verified = status === "verified";

  return sendEmail({
    to: { email: merchantEmail },
    subject: verified
      ? `[Crypto Pay] Wallet verified: ${label}`
      : `[Crypto Pay] Wallet not approved: ${label}`,
    template: "wallet_status_merchant",
    templateData: {
      status,
      walletLabel: label,
      walletNetwork: walletNetwork || "btc",
      walletAddress: walletAddress || "",
      rejectionReason: rejectionReason || "",
      subjectLine: verified
        ? `Wallet verified: ${label}`
        : `Wallet not approved: ${label}`,
    },
    tags: ["wallet", "merchant-status", status],
    workflow: { event: `wallet.${status}`, entityId: label },
  });
}
