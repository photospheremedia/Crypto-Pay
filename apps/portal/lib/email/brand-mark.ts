/**
 * Inline SVG logo mark (legacy fallback). Prefer PNG via brand-assets.ts for production emails.
 */

/** Compact mark for headers (profile-picture style in inbox clients). */
export function emailLogoMarkSvg(size = 48): string {
  const s = String(size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 48 48" role="img" aria-label="Crypto Pay">
  <defs>
    <linearGradient id="cp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#10b981"/>
      <stop offset="100%" style="stop-color:#0891b2"/>
    </linearGradient>
  </defs>
  <rect width="48" height="48" rx="12" fill="url(#cp-grad)"/>
  <path fill="#ffffff" d="M28.2 14.2c3.1 0 5.6 2.5 5.6 5.6 0 2.4-1.5 4.4-3.6 5.2l3.1 3.1c.4.4.4 1 0 1.4-.4.4-1 .4-1.4 0l-3.2-3.2c-.8.2-1.6.3-2.5.3-3.1 0-5.6-2.5-5.6-5.6s2.5-5.6 5.6-5.6zm-5.6 5.6c0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9-1.3-2.9-2.9-2.9-2.9 1.3-2.9 2.9zM18 33.8h12v2.2H18v-2.2z"/>
</svg>`;
}

/** Table-based logo block: white “avatar” frame + mark + optional wordmark. */
export function emailLogoBlock(options: {
  markSize?: number;
  showWordmark?: boolean;
  brandName?: string;
  tagline?: string;
  centered?: boolean;
} = {}): string {
  const {
    markSize = 56,
    showWordmark = true,
    brandName = "Crypto Pay",
    tagline = "Wallet-to-wallet crypto payments",
    centered = true,
  } = options;
  const align = centered ? "center" : "left";

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${centered ? 'style="margin: 0 auto;"' : ""}>
    <tr>
      <td align="${align}" style="padding-bottom: ${showWordmark ? "12px" : "0"};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background: #ffffff; border-radius: 16px; padding: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
              ${emailLogoMarkSvg(markSize)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
    ${
      showWordmark
        ? `
    <tr>
      <td align="${align}">
        <p style="margin: 0 0 4px; font-size: 22px; font-weight: 700; color: #ffffff; letter-spacing: -0.02em;">${brandName}</p>
        <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.92); line-height: 1.4;">${tagline}</p>
      </td>
    </tr>`
        : ""
    }
  </table>`;
}
