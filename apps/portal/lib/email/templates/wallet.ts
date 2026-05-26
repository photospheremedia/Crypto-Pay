/**
 * Wallet verification emails — Crypto Pay branded (Resend / table layout).
 */

import { ACCOUNT_WALLET_SETUP_PATH } from "@/lib/account/paths";
import { generateBaseTemplate, components, brandColors } from "../base-template";
import { EMAIL } from "../config";
import { walletNetworkLabel } from "@/lib/wallets/constants";

function maskAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}…${address.slice(-8)}`;
}

function walletDashboardUrl(path = "/account"): string {
  return `${EMAIL.siteUrl}${path}`;
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

export const walletEmailTemplates = {
  wallet_pending_admin: {
    subject: "[Crypto Pay] Wallet pending review: {{walletLabel}}",
    generateHtml: (data: Record<string, unknown>) => {
      const isResend = data.kind === "resend";
      const adminUrl = walletDashboardUrl("/admin/wallets");
      const network = walletNetworkLabel(String(data.walletNetwork || "btc"));

      return generateBaseTemplate(
        `
      ${components.iconHero(
        "🔔",
        isResend ? "Verification reminder" : "New wallet to review",
        `Merchant: ${data.merchantEmail || "unknown"}`,
      )}
      ${components.contentOpen()}
          ${components.paragraph(
            `A payout wallet is waiting for <strong>manual verification</strong>. Approve or reject in the admin dashboard.`,
          )}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow("Merchant", String(data.merchantEmail || "—"))}
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
          ${components.button("Open admin review", adminUrl)}
          ${components.paragraph(`Wallet ID: <code style="font-size:12px;">${data.walletId}</code>`, { small: true, muted: true, center: true })}
      ${components.contentClose()}
    `,
        {
          preheader: `${isResend ? "Reminder" : "New"} wallet pending: ${data.walletLabel}`,
          minimalHeader: false,
        },
      );
    },
  },

  wallet_status_merchant: {
    subject: "{{subjectLine}}",
    generateHtml: (data: Record<string, unknown>) => {
      const verified = data.status === "verified";
      const title = verified ? "Wallet verified" : "Wallet needs changes";
      const emoji = verified ? "✅" : "⚠️";
      const ctaUrl = verified
        ? walletDashboardUrl("/account")
        : walletDashboardUrl(ACCOUNT_WALLET_SETUP_PATH);

      return generateBaseTemplate(
        `
      ${components.iconHero(emoji, title, String(data.walletLabel || "Your wallet"))}
      ${components.contentOpen()}
          ${verified
            ? components.paragraph(
                `Your wallet <strong>${data.walletLabel}</strong> is verified. You can use it for payouts when checkout goes live.`,
              )
            : components.paragraph(
                `We could not approve <strong>${data.walletLabel}</strong>.${data.rejectionReason ? ` <br><br><strong>Reason:</strong> ${data.rejectionReason}` : " Please update the address and submit again."}`,
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
          ${components.button(verified ? "Open dashboard" : "Update wallet", ctaUrl)}
          ${components.paragraph(`Questions? <a href="mailto:${EMAIL.support}" style="color:${brandColors.primary};">${EMAIL.support}</a>`, { muted: true, center: true })}
      ${components.contentClose()}
    `,
        {
          preheader: verified
            ? `${data.walletLabel} is verified on Crypto Pay`
            : `${data.walletLabel} — action needed`,
        },
      );
    },
  },

  wallet_submitted_merchant: {
    subject: "Wallet received — pending verification",
    generateHtml: (data: Record<string, unknown>) =>
      generateBaseTemplate(
        `
      ${components.iconHero("⏳", "Wallet submitted", String(data.walletLabel || "Payout wallet"))}
      ${components.contentOpen()}
          ${components.paragraph(
            `We received your payout wallet. Our team typically reviews new addresses within <strong>1–2 business days</strong>. You'll get one more email when it's approved or if we need changes.`,
          )}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow("Name", String(data.walletLabel || "—"))}
              ${components.infoRow("Network", walletNetworkLabel(String(data.walletNetwork || "btc")))}
              ${components.infoRow("Status", "Pending verification")}
            </table>
            `,
            { highlight: true },
          )}
          ${onboardingSteps(2)}
          ${components.paragraph(
            `You can add <strong>multiple payout wallets</strong> (different networks or labels) from your dashboard. Each address is reviewed separately.`,
            { muted: true },
          )}
          ${components.button("View wallets", walletDashboardUrl(ACCOUNT_WALLET_SETUP_PATH))}
          ${components.paragraph("No private keys are ever requested — public addresses only.", { small: true, muted: true, center: true })}
      ${components.contentClose()}
    `,
        { preheader: "Your Crypto Pay wallet is pending admin review." },
      ),
  },
} as const;
