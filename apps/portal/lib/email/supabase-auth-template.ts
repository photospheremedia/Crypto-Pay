/**
 * HTML for Supabase Auth mailer templates (Go template variables).
 * Sync to supabase/templates/*.html via scripts/sync-supabase-auth-templates.ts
 */

const SITE = "https://cryptopay.sale";
const LOGO = `${SITE}/email/logo.png`;
const PRIMARY = "#10b981";
const PRIMARY_DARK = "#059669";
const ACCENT = "#0891b2";

type AuthTemplateVariant =
  | "confirmation"
  | "recovery"
  | "magic_link"
  | "invite"
  | "email_change";

const variants: Record<
  AuthTemplateVariant,
  {
    title: string;
    preheader: string;
    body: string;
    cta: string;
    footerNote: string;
    headerGradient?: string;
    icon?: string;
  }
> = {
  confirmation: {
    title: "Confirm your email",
    preheader: "Activate your Crypto Pay merchant account.",
    body: "Thanks for signing up. Confirm your email to access your dashboard and add payout wallets.",
    cta: "Confirm email",
    footerNote: "If you did not create an account, you can ignore this message.",
    icon: "✉️",
  },
  recovery: {
    title: "Reset your password",
    preheader: "Reset your Crypto Pay password securely.",
    body: "We received a request to reset the password for your account. This link expires in one hour.",
    cta: "Reset password",
    footerNote: "If you did not request a reset, ignore this email or contact support.",
    icon: "🔐",
    headerGradient: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 55%, ${ACCENT} 100%)`,
  },
  magic_link: {
    title: "Sign in to Crypto Pay",
    preheader: "Your secure one-time sign-in link.",
    body: "Use the button below to sign in. This link expires in 24 hours and works once.",
    cta: "Sign in",
    footerNote: "If you did not request this link, you can safely ignore this email.",
    icon: "✨",
  },
  invite: {
    title: "You're invited",
    preheader: "Join Crypto Pay as a team member.",
    body: "You've been invited to Crypto Pay. Accept the invitation to set up your account.",
    cta: "Accept invitation",
    footerNote: "Questions? Contact the person who invited you or our support team.",
    icon: "🎉",
  },
  email_change: {
    title: "Confirm your new email",
    preheader: "Verify your new Crypto Pay email address.",
    body: "You asked to change the email on your account. Confirm the new address to complete the update.",
    cta: "Confirm new email",
    footerNote: "If you did not request this change, contact support immediately.",
    icon: "📧",
  },
};

export function generateSupabaseAuthEmailHtml(
  variant: AuthTemplateVariant,
): string {
  const v = variants[variant];
  const gradient =
    v.headerGradient ??
    `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 55%, ${ACCENT} 100%)`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <title>${v.title} — Crypto Pay</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${v.preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.08);">
          <tr>
            <td style="background:${gradient};padding:32px 28px;text-align:center;">
              <img src="${LOGO}" width="52" height="52" alt="Crypto Pay" style="display:block;margin:0 auto 16px;border-radius:12px;border:0;" />
              <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:rgba(255,255,255,0.9);letter-spacing:0.04em;text-transform:uppercase;">Crypto Pay</p>
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">${v.icon ? `${v.icon} ` : ""}${v.title}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px 28px;">
              <p style="margin:0 0 20px;color:#374151;font-size:16px;line-height:1.65;">${v.body}</p>
              <table role="presentation" cellspacing="0" cellpadding="0" style="margin:8px 0 24px;">
                <tr>
                  <td align="center" style="border-radius:10px;background:linear-gradient(135deg,${PRIMARY} 0%,${PRIMARY_DARK} 100%);">
                    <a href="{{ .ConfirmationURL }}" target="_blank" style="display:inline-block;padding:14px 36px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">${v.cta}</a>
                  </td>
                </tr>
              </table>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 20px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.03em;">Button not working?</p>
                    <p style="margin:0;font-size:12px;color:#059669;word-break:break-all;line-height:1.5;"><a href="{{ .ConfirmationURL }}" style="color:#059669;">{{ .ConfirmationURL }}</a></p>
                  </td>
                </tr>
              </table>
              <p style="margin:0;color:#6b7280;font-size:14px;line-height:1.6;">${v.footerNote}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0 0 8px;font-size:13px;color:#6b7280;">Track and accept crypto payments · Wallet to wallet</p>
              <p style="margin:0;font-size:12px;color:#9ca3af;">
                <a href="${SITE}" style="color:#059669;text-decoration:none;">cryptopay.sale</a>
                &nbsp;·&nbsp;
                <a href="mailto:support@cryptopay.sale" style="color:#059669;text-decoration:none;">support@cryptopay.sale</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export const SUPABASE_AUTH_TEMPLATE_FILES: Record<
  AuthTemplateVariant,
  string
> = {
  confirmation: "confirm",
  recovery: "recovery",
  magic_link: "magic_link",
  invite: "invite",
  email_change: "email_change",
};
