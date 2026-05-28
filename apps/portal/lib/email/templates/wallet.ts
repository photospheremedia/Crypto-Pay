/**
 * Wallet verification emails — Crypto Pay branded (Resend / table layout).
 */

import {
  EMAIL_ROUTES,
  merchantMailto,
  MERCHANT_SUPPORT_REPLY,
} from "@/lib/email/routing";
import { generateBaseTemplate, components, brandColors } from "../base-template";
import { getEmailMessages, formatEmailString } from "../messages";
import { walletNetworkLabel } from "@/lib/wallets/constants";

function resolveLocale(data: Record<string, unknown>): string {
  return typeof data.locale === "string" && data.locale ? data.locale : "en";
}

function maskAddress(address: string): string {
  if (address.length <= 16) return address;
  return `${address.slice(0, 8)}…${address.slice(-8)}`;
}

function onboardingSteps(done: number, steps: string[]) {
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

function supportFooter(html: string) {
  return components.paragraph(html, { muted: true, center: true });
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
      const locale = resolveLocale(data);
      const m = getEmailMessages(locale);
      const verified = data.status === "verified";
      const walletLabel = String(data.walletLabel || "");
      const verifiedCopy = m.wallet_status.verified;
      const rejectedCopy = m.wallet_status.rejected;
      const copy = verified ? verifiedCopy : rejectedCopy;
      const reasonBlock =
        !verified && data.rejectionReason
          ? formatEmailString(rejectedCopy.reasonPrefix, {
              reason: String(data.rejectionReason),
            })
          : "";
      const vars = {
        walletLabel,
        supportEmail: MERCHANT_SUPPORT_REPLY,
        reason: String(data.rejectionReason || ""),
        reasonBlock,
      };
      const ctaUrl =
        (data.actionUrl as string) ||
        (verified ? EMAIL_ROUTES.account() : EMAIL_ROUTES.accountWallets());

      return generateBaseTemplate(
        `
      ${components.iconHero(
        verified ? "✓" : "!",
        formatEmailString(copy.heroTitle, vars),
        formatEmailString(copy.heroSubtitle ?? walletLabel, vars),
      )}
      ${components.contentOpen()}
          ${components.paragraph(formatEmailString(copy.body, vars))}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow(m.wallet_status.network, walletNetworkLabel(String(data.walletNetwork || "btc")))}
              ${components.infoRow(m.wallet_status.address, maskAddress(String(data.walletAddress || "")))}
              ${components.infoRow(
                m.wallet_status.status,
                verified ? verifiedCopy.statusVerified : rejectedCopy.statusRejected,
              )}
            </table>
            `,
            { highlight: verified },
          )}
          ${onboardingSteps(
            verified ? 3 : 2,
            [
              m.wallet_submitted.onboarding.accountCreated,
              m.wallet_submitted.onboarding.addWallet,
              m.wallet_submitted.onboarding.adminVerifies,
              m.wallet_submitted.onboarding.acceptPayments,
            ],
          )}
          ${components.button(formatEmailString(copy.cta, vars), ctaUrl)}
          ${supportFooter(formatEmailString(m.wallet_status.support, vars))}
      ${components.contentClose()}
    `,
        {
          preheader: formatEmailString(copy.preheader, vars),
        },
      );
    },
  },

  wallet_submitted_merchant: {
    subject: "{{subjectLine}}",
    generateHtml: (data: Record<string, unknown>) => {
      const locale = resolveLocale(data);
      const m = getEmailMessages(locale).wallet_submitted;
      const walletLabel = String(data.walletLabel || "");
      const vars = { walletLabel, supportEmail: MERCHANT_SUPPORT_REPLY };
      const walletsUrl =
        (data.actionUrl as string) || EMAIL_ROUTES.accountWallets();

      return generateBaseTemplate(
        `
      ${components.iconHero(
        "◷",
        formatEmailString(m.heroTitle, vars),
        formatEmailString(m.heroSubtitle, vars),
      )}
      ${components.contentOpen()}
          ${components.paragraph(formatEmailString(m.body, vars))}
          ${components.card(
            `
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${components.infoRow(m.walletName, walletLabel || "—")}
              ${components.infoRow(m.network, walletNetworkLabel(String(data.walletNetwork || "btc")))}
              ${components.infoRow(m.status, m.statusPending)}
            </table>
            `,
            { highlight: true },
          )}
          ${onboardingSteps(2, [
            m.onboarding.accountCreated,
            m.onboarding.addWallet,
            m.onboarding.adminVerifies,
            m.onboarding.acceptPayments,
          ])}
          ${components.paragraph(formatEmailString(m.multiWalletNote, vars), { muted: true })}
          ${components.button(formatEmailString(m.cta, vars), walletsUrl)}
          ${components.paragraph(formatEmailString(m.securityNote, vars), {
            small: true,
            muted: true,
            center: true,
          })}
          ${supportFooter(formatEmailString(m.support, vars))}
      ${components.contentClose()}
    `,
        { preheader: formatEmailString(m.preheader, vars) },
      );
    },
  },

  admin_message_merchant: {
    subject: "[Crypto Pay] {{subjectLine}}",
    generateHtml: (data: Record<string, unknown>) => {
      const locale = resolveLocale(data);
      const m = getEmailMessages(locale);
      const accountUrl = String(data.accountUrl || EMAIL_ROUTES.account());
      const walletsUrl = String(data.walletsUrl || EMAIL_ROUTES.accountWallets());
      const body = String(data.messageBody || "").replace(/\n/g, "<br />");
      const supportVars = { supportEmail: MERCHANT_SUPPORT_REPLY };
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
          ${supportFooter(formatEmailString(m.wallet_status.support, supportVars))}
      ${components.contentClose()}
    `,
        { preheader: String(data.subjectLine || "Message from Crypto Pay") },
      );
    },
  },
} as const;
