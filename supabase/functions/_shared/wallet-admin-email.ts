/**
 * Branded wallet admin notification HTML (Deno / Edge Functions).
 * Mirrors apps/portal/lib/email/templates/wallet.ts — keep in sync when changing layout.
 */

const BRAND = {
  primary: "#10b981",
  primaryDark: "#059669",
  secondary: "#111827",
  text: "#374151",
  textMuted: "#6b7280",
  border: "#e5e7eb",
  surface: "#f9fafb",
};

function siteUrl(): string {
  return (Deno.env.get("NEXT_PUBLIC_APP_URL") || "https://cryptopay.sale").replace(/\/$/, "");
}

function emailLogoUrl(): string {
  const custom = Deno.env.get("EMAIL_LOGO_URL")?.trim();
  if (custom) return custom;
  return `${siteUrl()}/email/logo.png`;
}

function networkLabel(network: string): string {
  const map: Record<string, string> = {
    btc: "Bitcoin (BTC)",
    eth: "Ethereum (ETH)",
    ltc: "Litecoin (LTC)",
    usdt: "Tether (USDT)",
    usdc: "USD Coin (USDC)",
  };
  return map[network.toLowerCase()] ?? network.toUpperCase();
}

export function buildWalletPendingAdminHtml(params: {
  merchantEmail: string;
  walletLabel: string;
  walletNetwork: string;
  walletAddress: string;
  walletId: string;
  source: string;
  kind?: "submitted" | "resend";
}): string {
  const adminUrl = `${siteUrl()}/admin/wallets`;
  const isResend = params.kind === "resend";
  const title = isResend ? "Verification reminder" : "New wallet to review";
  const year = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,${BRAND.primary} 0%,${BRAND.primaryDark} 55%,#0891b2 100%);padding:36px 32px;text-align:center;">
            <img src="${emailLogoUrl()}" alt="Crypto Pay" width="56" height="56" style="display:block;margin:0 auto 16px;border:0;border-radius:12px;outline:none;" />
            <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#fff;">Crypto Pay</p>
            <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.92);">Wallet-to-wallet crypto payments</p>
          </td>
        </tr>
        <tr><td style="padding:40px 32px;">
          <p style="margin:0 0 8px;font-size:28px;font-weight:700;color:${BRAND.secondary};text-align:center;">${title}</p>
          <p style="margin:0 0 24px;font-size:16px;color:${BRAND.textMuted};text-align:center;">Submitted by ${params.merchantEmail}</p>
          <p style="margin:0 0 20px;font-size:16px;line-height:1.6;color:${BRAND.text};">A payout wallet is <strong>pending verification</strong>. Review in the admin dashboard.</p>
          <table role="presentation" width="100%" style="background:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:8px;margin-bottom:24px;">
            <tr><td style="padding:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};"><strong>Merchant:</strong> ${params.merchantEmail}</p>
              <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};"><strong>Wallet:</strong> ${params.walletLabel}</p>
              <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};"><strong>Network:</strong> ${networkLabel(params.walletNetwork)}</p>
              <p style="margin:0 0 8px;font-size:14px;color:${BRAND.text};"><strong>Source:</strong> ${params.source}</p>
              <p style="margin:0;font-size:12px;font-family:ui-monospace,monospace;word-break:break-all;color:${BRAND.textMuted};">${params.walletAddress}</p>
            </td></tr>
          </table>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
            <tr><td style="border-radius:8px;background:${BRAND.primary};">
              <a href="${adminUrl}" style="display:inline-block;padding:14px 32px;font-size:16px;font-weight:600;color:#fff;text-decoration:none;">Review in admin</a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;color:${BRAND.textMuted};text-align:center;">Wallet ID: ${params.walletId}</p>
        </td></tr>
        <tr><td style="background:#111827;padding:24px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#9ca3af;">© ${year} Crypto Pay · cryptopay.sale</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}
