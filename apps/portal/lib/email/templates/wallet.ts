/**
 * Wallet verification emails — Crypto Pay branded (Resend / table layout).
 */

import {
  EMAIL_ROUTES,
  merchantMailto,
  MERCHANT_SUPPORT_REPLY,
} from "@/lib/email/routing";
import { generateBaseTemplate, components, brandColors } from "../base-template";
import { EMAIL } from "../config";
import { walletNetworkLabel } from "@/lib/wallets/constants";

function maskAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}…${address.slice(-8)}`;
}

function onboardingSteps(done: number) {
  const steps = [
    "Account created",
    "Add payout wallet",
    "Admin verifies address",
    "Accept payments (coming soon)",
  ];
  const rows = steps
    .map((label, i) => {
      const complete = i < done;
      const icon = complete ? "✓" : i === done ? "→" : "○";
      const color = complete
        ? brandColors.primary
        : i === done
          ? "#0891b2"
          : brandColors.textMuted;
      return `<tr><td style="padding:8px 0;font-size:14px;color:${complete ? brandColors.secondary : brandColors.textLight};"><span style="color:${color};font-weight:700;margin-right:10px;">${icon}</span>${label}</td></tr>`;
    })
    .join("");
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">${rows}</table>`;
}

function supportFooter() {
  return components.paragraph(
    `Need help? Reply to this email or contact <a href="mailto:${MERCHANT_SUPPORT_REPLY}" style="color:${brandColors.primary};font-weight:600;">${MERCHANT_SUPPORT_REPLY}</a>`,
    { muted: true, center: true },
  );
}

export const walletEmailTemplates = {
  wallet_pending_admin: {
    subject: "[Crypto Pay] Action required — wallet review: {{walletLabel}}",
    generateHtml: (data: Record<string, unknown>) => {
      const isResend = data.kind === "resend";
      const merchantEmail = String(data.merchantEmail || "");
      const walletId = String(data.walletId || "");
      const adminUrl =
        (data.adminReviewUrl as string) || EMAIL_ROUTES.adminWalletPending(walletId);
      const network = walletNetworkLabel(String(data.walletNetwork || "btc"));
      const mailtoMerchant = merchantEmail
        ? merchantMailto(
            merchantEmail,
            `Crypto Pay — wallet review: ${data.walletLabel}`,
            `Hi,\n\nWe're reviewing your payout wallet "${data.walletLabel}" on Crypto Pay.\n\n`,
          )
        : EMAIL_ROUTES.contact();

      return generateBaseTemplate(
        `
      ${components.iconHero(
        "!",
        isResend ? "Reminder: wallet pending review" : "New wallet pending review",
        merchantEmail ? `Merchant ${merchantEmail}` : "Portal submission",
      )}
      ${components.contentOpen()}
          ${components.paragraph(
            `A merchant submitted a payout wallet that requires <strong>manual approval</strong> before it can be used for settlements.`,
          )}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow("Merchant", merchantEmail || "—")}
              ${components.infoRow("Wallet name", String(data.walletLabel || "—"))}
              ${components.infoRow("Network", network)}
              ${components.infoRow("Status", "Pending review")}
              ${components.infoRow("Source", String(data.source || "portal"))}
            </table>
            <p style="margin:16px 0 0;font-size:12px;color:${brandColors.textMuted};word-break:break-all;font-family:ui-monospace,monospace;line-height:1.5;">
              ${data.walletAddress}
            </p>
            `,
            { highlight: true },
          )}
          ${components.button("Review in admin dashboard", adminUrl)}
          ${merchantEmail ? components.button("Reply to merchant", mailtoMerchant, "outline") : ""}
          ${components.paragraph(`Reference ID: <span style="font-family:ui-monospace;font-size:12px;">${walletId}</span>`, { small: true, muted: true, center: true })}
          ${components.paragraph("Replying to this notification will email the merchant directly.", { small: true, muted: true, center: true })}
      ${components.contentClose()}
    `,
        {
          preheader: `${isResend ? "Reminder" : "New"} wallet pending review — ${data.walletLabel}`,
          minimalHeader: false,
        },
      );
    },
  },

  wallet_status_merchant: {
    subject: "{{subjectLine}}",
    generateHtml: (data: Record<string, unknown>) => {
      const verified = data.status === "verified";
      const title = verified ? "Wallet verified" : "Wallet not approved";
      const ctaUrl =
        (data.actionUrl as string) ||
        (verified ? EMAIL_ROUTES.account() : EMAIL_ROUTES.accountWallets());
      const ctaLabel = verified ? "Open account dashboard" : "Update payout wallet";

      return generateBaseTemplate(
        `
      ${components.iconHero(
        verified ? "✓" : "!",
        title,
        String(data.walletLabel || "Your wallet"),
      )}
      ${components.contentOpen()}
          ${verified
            ? components.paragraph(
                `Your payout wallet <strong>${data.walletLabel}</strong> has been verified. It will be used for crypto settlements when checkout is enabled on your account.`,
              )
            : components.paragraph(
                `We were unable to approve <strong>${data.walletLabel}</strong> at this time.${data.rejectionReason ? `<br><br><strong>Reason:</strong> ${String(data.rejectionReason)}` : ""}<br><br>Please update the wallet address in your dashboard and submit again.`,
              )}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow("Network", walletNetworkLabel(String(data.walletNetwork || "btc")))}
              ${components.infoRow("Address", maskAddress(String(data.walletAddress || "")))}
              ${components.infoRow("Status", verified ? "Verified" : "Not approved")}
            </table>
            `,
            { highlight: verified },
          )}
          ${onboardingSteps(verified ? 3 : 2)}
          ${components.button(ctaLabel, ctaUrl)}
          ${supportFooter()}
      ${components.contentClose()}
    `,
        {
          preheader: verified
            ? `${data.walletLabel} is verified on Crypto Pay`
            : `${data.walletLabel} requires an update`,
        },
      );
    },
  },

  wallet_submitted_merchant: {
    subject: "We received your payout wallet",
    generateHtml: (data: Record<string, unknown>) => {
      const walletsUrl =
        (data.actionUrl as string) || EMAIL_ROUTES.accountWallets();

      return generateBaseTemplate(
        `
      ${components.iconHero(
        "◷",
        "Payout wallet submitted",
        String(data.walletLabel || "Your wallet"),
      )}
      ${components.contentOpen()}
          ${components.paragraph(
            `Thank you. We have received your payout wallet and queued it for review. Most addresses are verified within <strong>one to two business days</strong>.`,
          )}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow("Wallet name", String(data.walletLabel || "—"))}
              ${components.infoRow("Network", walletNetworkLabel(String(data.walletNetwork || "btc")))}
              ${components.infoRow("Status", "Pending verification")}
            </table>
            `,
            { highlight: true },
          )}
          ${onboardingSteps(2)}
          ${components.paragraph(
            `You may register <strong>multiple payout wallets</strong> (separate networks or labels). Each address is reviewed independently.`,
            { muted: true },
          )}
          ${components.button("View wallet status", walletsUrl)}
          ${components.paragraph("We only ever ask for public addresses — never private keys or seed phrases.", { small: true, muted: true, center: true })}
          ${supportFooter()}
      ${components.contentClose()}
    `,
        { preheader: "Your payout wallet is pending verification on Crypto Pay." },
      );
    },
  },

  admin_message_merchant: {
    subject: "[Crypto Pay] {{subjectLine}}",
    generateHtml: (data: Record<string, unknown>) => {
      const accountUrl = String(data.accountUrl || EMAIL_ROUTES.account());
      const walletsUrl = String(data.walletsUrl || EMAIL_ROUTES.accountWallets());
      const body = String(data.messageBody || "").replace(/\n/g, "<br />");
      return generateBaseTemplate(
        `
      ${components.iconHero("Message", "Message from Crypto Pay", String(data.subjectLine || "Account update"))}
      ${components.contentOpen()}
          ${components.paragraph(`Hi ${data.merchantName || "there"},`)}
          ${components.paragraph(`<strong>${data.adminName || "Crypto Pay team"}</strong> sent you a message regarding your merchant account:`)}
          ${components.card(
            `<p style="margin:0;font-size:15px;line-height:1.6;color:${brandColors.secondary};">${body}</p>`,
            { highlight: true },
          )}
          ${data.walletReviewNote ? components.paragraph(String(data.walletReviewNote), { muted: true }) : ""}
          ${components.button("Open your account", accountUrl)}
          ${components.button("View payout wallets", walletsUrl, "outline")}
          ${components.paragraph(
            `Reply to this email to reach <a href="mailto:${data.adminEmail || MERCHANT_SUPPORT_REPLY}" style="color:${brandColors.primary};font-weight:600;">${data.adminEmail || MERCHANT_SUPPORT_REPLY}</a> directly.`,
            { muted: true, center: true },
          )}
          ${supportFooter()}
      ${components.contentClose()}
    `,
        { preheader: String(data.subjectLine || "Message from Crypto Pay") },
      );
    },
  },
} as const;
