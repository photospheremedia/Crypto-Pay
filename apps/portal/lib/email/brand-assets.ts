/**
 * Absolute URLs for email images (Resend / React Email best practice).
 * Logo matches site header: BrandMark from @/lib/brand-mark (gradient + Bitcoin icon).
 */

import { BRAND } from "@/lib/cryptopay/constants";
import { BRAND_GRADIENT } from "@/lib/brand-mark";
import { EMAIL } from "./config";

/** Static logo — same mark as site header (see scripts/generate-email-logo.tsx). */
export const EMAIL_LOGO_STATIC_PATH = "/email/logo.png";
export const EMAIL_LOGO_RETINA_PATH = "/email/logo@2x.png";

const PRODUCTION_ORIGIN = "https://cryptopay.sale";

function siteOrigin(): string {
  const raw = (process.env.NEXT_PUBLIC_APP_URL || EMAIL.siteUrl).replace(/\/$/, "");
  if (/localhost|127\.0\.0\.1/.test(raw)) {
    return PRODUCTION_ORIGIN;
  }
  return raw;
}

/**
 * Origin used in email img src (never localhost — clients cannot load it).
 */
export function getEmailAssetOrigin(): string {
  const custom = process.env.EMAIL_ASSET_ORIGIN?.trim();
  if (custom) return custom.replace(/\/$/, "");
  return siteOrigin();
}

/**
 * Logo URL for email clients (PNG). Override with EMAIL_LOGO_URL for CDN.
 */
export function getEmailLogoImageUrl(retina = false): string {
  const custom = process.env.EMAIL_LOGO_URL?.trim();
  if (custom) return custom;
  const path = retina ? EMAIL_LOGO_RETINA_PATH : EMAIL_LOGO_STATIC_PATH;
  return `${getEmailAssetOrigin()}${path}`;
}

export function emailImgTag(
  src: string,
  alt: string,
  width: number,
  height: number,
  extraStyle = "",
): string {
  return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;${extraStyle}" />`;
}

/** Site-aligned mark: gradient tile + Bitcoin icon (no extra white card). */
export function emailBrandMarkImg(
  displaySize = 56,
  options: { shadow?: boolean; centered?: boolean } = {},
): string {
  const { shadow = true, centered = true } = options;
  const src = getEmailLogoImageUrl(displaySize > 56);
  const radius = Math.round(displaySize * 0.25);
  const shadowCss = shadow
    ? "box-shadow:0 10px 30px rgba(16,185,129,0.25);"
    : "";
  const img = emailImgTag(
    src,
    `${EMAIL.brandName} logo`,
    displaySize,
    displaySize,
    `border-radius:${radius}px;${shadowCss}`,
  );
  const align = centered ? "center" : "left";
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${centered ? 'style="margin:0 auto;"' : ""}>
    <tr><td align="${align}">${img}</td></tr>
  </table>`;
}

/** Masthead on gradient band — matches CryptoPayLogo / BrandMark on site. */
export function emailLogoHeaderBlock(
  options: {
    markSize?: number;
    showWordmark?: boolean;
    brandName?: string;
    tagline?: string;
    centered?: boolean;
  } = {},
): string {
  const {
    markSize = 56,
    showWordmark = true,
    brandName = EMAIL.brandName,
    tagline = BRAND.tagline,
    centered = true,
  } = options;
  const align = centered ? "center" : "left";

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${centered ? 'style="margin:0 auto;"' : ""}>
    <tr>
      <td align="${align}" style="padding-bottom:${showWordmark ? "12px" : "0"};">
        ${emailBrandMarkImg(markSize, { shadow: true, centered })}
      </td>
    </tr>
    ${
      showWordmark
        ? `
    <tr>
      <td align="${align}">
        <p style="margin:0 0 4px;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.02em;">${brandName}</p>
        <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.92);line-height:1.4;">${tagline}</p>
      </td>
    </tr>`
        : ""
    }
  </table>`;
}

/** Auth email header row (Supabase templates) — same logo block as Resend emails. */
export function emailAuthTemplateHeader(title: string): string {
  const gradient = `linear-gradient(135deg, ${BRAND.colors.primary} 0%, ${BRAND.colors.primaryDark} 55%, ${BRAND.colors.accent} 100%)`;
  return `
          <tr>
            <td style="background:${gradient};padding:36px 32px 32px;text-align:center;border-radius:12px 12px 0 0;">
              ${emailLogoHeaderBlock({ markSize: 56, showWordmark: true, tagline: BRAND.tagline })}
              <h1 style="margin:16px 0 0;color:#ffffff;font-size:22px;font-weight:700;line-height:1.3;">${title}</h1>
            </td>
          </tr>`;
}

/** Footer logo on light background. */
export function emailLogoMarkImg(size = 36, centered = false): string {
  return emailBrandMarkImg(size, { shadow: false, centered });
}

export { BRAND_GRADIENT };
