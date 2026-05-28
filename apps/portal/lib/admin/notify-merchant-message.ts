import { sendEmail } from "@/lib/email/sender";
import { resolveMerchantEmailLocale } from "@/lib/email/resolve-merchant-email-locale";
import { EMAIL_WORKFLOW_EVENTS, workflowIdempotencyKey } from "@/lib/email/workflow-keys";
import { EMAIL_ROUTES, MERCHANT_SUPPORT_REPLY } from "@/lib/email/routing";

export async function notifyMerchantAdminMessage(params: {
  merchantEmail: string;
  merchantName?: string | null;
  subject: string;
  message: string;
  adminEmail: string;
  adminName?: string | null;
  walletId?: string;
  merchantUserId: string;
  adminUserId: string;
}): Promise<{ success: boolean; error?: string; messageId?: string }> {
  const {
    merchantEmail,
    merchantName,
    subject,
    message,
    adminEmail,
    adminName,
    walletId,
    merchantUserId,
    adminUserId,
  } = params;

  const trimmedSubject = subject.trim().slice(0, 200);
  const trimmedMessage = message.trim().slice(0, 8000);

  if (!trimmedSubject || !trimmedMessage) {
    return { success: false, error: "Subject and message are required" };
  }

  const locale = await resolveMerchantEmailLocale(merchantUserId);

  return sendEmail({
    to: { email: merchantEmail, name: merchantName ?? undefined },
    replyTo: adminEmail || MERCHANT_SUPPORT_REPLY,
    subject: `[Crypto Pay] ${trimmedSubject}`,
    template: "admin_message_merchant",
    templateData: {
      locale,
      merchantName: merchantName || "there",
      subjectLine: trimmedSubject,
      messageBody: trimmedMessage,
      adminName: adminName || "Crypto Pay team",
      adminEmail,
      accountUrl: EMAIL_ROUTES.account(),
      walletsUrl: EMAIL_ROUTES.accountWallets(),
      walletReviewNote: walletId
        ? "This message relates to your payout wallet verification."
        : "",
    },
    tags: ["admin", "merchant_message"],
    idempotencyKey: workflowIdempotencyKey(
      EMAIL_WORKFLOW_EVENTS.adminMerchantMessage,
      `${merchantUserId}/${adminUserId}/${Date.now().toString(36)}`,
      merchantEmail,
    ),
    workflow: {
      event: EMAIL_WORKFLOW_EVENTS.adminMerchantMessage,
      entityId: walletId ?? merchantUserId,
      actorId: adminUserId,
    },
  });
}
