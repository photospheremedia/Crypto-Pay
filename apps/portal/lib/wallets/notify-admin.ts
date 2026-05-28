import { sendEmail } from "@/lib/email/sender";
import { getEmailMessages, formatEmailString } from "@/lib/email/messages";
import { resolveMerchantEmailLocale } from "@/lib/email/resolve-merchant-email-locale";
import {
  EMAIL_WORKFLOW_EVENTS,
  walletStatusEmailIdempotencyKey,
  workflowIdempotencyKey,
} from "@/lib/email/workflow-keys";
import { getAdminReviewRecipients } from "@/lib/email/admin-recipients";
import {
  EMAIL_ROUTES,
  MERCHANT_SUPPORT_REPLY,
} from "@/lib/email/routing";
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

  const adminRecipients = getAdminReviewRecipients();
  const recipientKey = adminRecipients.map((r) => r.email).sort().join(",");

  const dayBucket = new Date().toISOString().slice(0, 10);
  const idempotencyKey =
    params.idempotencyKey ??
    (kind === "resend"
      ? workflowIdempotencyKey(
          EMAIL_WORKFLOW_EVENTS.walletVerificationResend,
          `${wallet.id}/${dayBucket}`,
          recipientKey,
        )
      : workflowIdempotencyKey(
          EMAIL_WORKFLOW_EVENTS.walletVerificationRequested,
          wallet.id,
          recipientKey,
        ));

  const to =
    adminRecipients.length === 1 ? adminRecipients[0]! : adminRecipients;

  return sendEmail({
    to,
    replyTo: merchantEmail || MERCHANT_SUPPORT_REPLY,
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
      adminReviewUrl: EMAIL_ROUTES.adminWalletPending(wallet.id),
    },
    tags: ["wallet", "admin_review", kind],
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
  merchantUserId: string;
  walletId: string;
  label: string;
  walletNetwork: string;
}): Promise<{ success: boolean; error?: string }> {
  const locale = await resolveMerchantEmailLocale(params.merchantUserId);
  const copy = getEmailMessages(locale).wallet_submitted;
  const subjectLine = formatEmailString(copy.subject, { walletLabel: params.label });

  return sendEmail({
    to: { email: params.merchantEmail },
    replyTo: MERCHANT_SUPPORT_REPLY,
    subject: subjectLine,
    template: "wallet_submitted_merchant",
    templateData: {
      locale,
      subjectLine,
      walletLabel: params.label,
      walletNetwork: params.walletNetwork,
      actionUrl: EMAIL_ROUTES.accountWallets(),
    },
    tags: ["wallet", "merchant", "submitted"],
    idempotencyKey: workflowIdempotencyKey(
      EMAIL_WORKFLOW_EVENTS.walletSubmittedMerchant,
      params.walletId,
      params.merchantEmail,
    ),
    workflow: {
      event: EMAIL_WORKFLOW_EVENTS.walletSubmittedMerchant,
      entityId: params.walletId,
    },
  });
}

export async function notifyMerchantWalletStatus(params: {
  merchantEmail: string;
  merchantUserId: string;
  walletId: string;
  label: string;
  status: "verified" | "rejected";
  verificationRequestedAt: string;
  walletNetwork?: string;
  walletAddress?: string;
  rejectionReason?: string | null;
}): Promise<{ success: boolean; error?: string }> {
  const {
    merchantEmail,
    merchantUserId,
    walletId,
    label,
    status,
    verificationRequestedAt,
    rejectionReason,
    walletNetwork,
    walletAddress,
  } = params;
  const verified = status === "verified";
  const event = verified
    ? EMAIL_WORKFLOW_EVENTS.walletVerified
    : EMAIL_WORKFLOW_EVENTS.walletRejected;

  const locale = await resolveMerchantEmailLocale(merchantUserId);
  const statusCopy = getEmailMessages(locale).wallet_status[verified ? "verified" : "rejected"];
  const subjectLine = formatEmailString(statusCopy.subject, { walletLabel: label });

  return sendEmail({
    to: { email: merchantEmail },
    replyTo: MERCHANT_SUPPORT_REPLY,
    subject: subjectLine,
    template: "wallet_status_merchant",
    templateData: {
      locale,
      status,
      walletLabel: label,
      walletNetwork: walletNetwork || "btc",
      walletAddress: walletAddress || "",
      rejectionReason: rejectionReason || "",
      subjectLine,
      actionUrl: verified ? EMAIL_ROUTES.account() : EMAIL_ROUTES.accountWallets(),
    },
    tags: ["wallet", "merchant_status", status],
    idempotencyKey: walletStatusEmailIdempotencyKey(
      event,
      walletId,
      verificationRequestedAt,
      merchantEmail,
    ),
    workflow: { event, entityId: walletId },
  });
}
