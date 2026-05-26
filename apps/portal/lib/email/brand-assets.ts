/**
 * Absolute URLs for email images (Resend / React Email best practice).
 * @see https://github.com/resend/react-email — host PNG on site origin or CDN
 */

import { EMAIL } from "./config";

/** Static logo served from `public/email/logo.png` (run `pnpm email:logo` to regenerate). */
export const EMAIL_LOGO_STATIC_PATH = "/email/logo.png";

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || EMAIL.siteUrl).replace(/\/$/, "");
}

/**
 * Logo URL for email clients (PNG). Override with EMAIL_LOGO_URL for CDN.
 */
export function getEmailLogoImageUrl(): string {
  const custom = process.env.EMAIL_LOGO_URL?.trim();
  if (custom) return custom;
  return `${siteOrigin()}${EMAIL_LOGO_STATIC_PATH}`;
}

export function getEmailHeroImageUrl(): string {
  return `${siteOrigin()}/opengraph-image`;
}

export function emailImgTag(
  src: string,
  alt: string,
  width: number,
  height: number,
  extraStyle = "",
): string {
  return `<img src="${src}" alt="${alt}" width="${width}" height="${height}" style="display: block; border: 0; outline: none; text-decoration: none; ${extraStyle}" />`;
}

/** Framed logo image (white card) — works on gradient headers. */
export function emailLogoMarkImg(size = 56, centered = true): string {
  const src = getEmailLogoImageUrl();
  const img = emailImgTag(
    src,
    `${EMAIL.brandName} logo`,
    size,
    size,
    "border-radius: 12px; display: block;",
  );
  const align = centered ? "center" : "left";
  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${centered ? 'style="margin: 0 auto;"' : ""}>
    <tr>
      <td align="${align}">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td style="background: #ffffff; border-radius: 16px; padding: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
              ${img}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

/** Masthead block: framed PNG logo + optional wordmark (replaces inline SVG). */
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
    tagline = EMAIL.tagline,
    centered = true,
  } = options;
  const align = centered ? "center" : "left";
  const src = getEmailLogoImageUrl();
  const img = emailImgTag(
    src,
    `${brandName} logo`,
    markSize,
    markSize,
    "border-radius: 12px; display: block;",
  );

  return `
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${centered ? 'style="margin: 0 auto;"' : ""}>
    <tr>
      <td align="${align}" style="padding-bottom: ${showWordmark ? "12px" : "0"};">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" ${centered ? 'style="margin: 0 auto;"' : ""}>
          <tr>
            <td style="background: #ffffff; border-radius: 16px; padding: 10px; box-shadow: 0 4px 14px rgba(0,0,0,0.12);">
              ${img}
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
