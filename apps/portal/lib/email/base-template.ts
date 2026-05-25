/**
 * Base Email Template - Crypto Pay
 * Resend/React Email patterns: absolute image URLs, table layout, preheader, branded masthead.
 */

import { emailLogoBlock } from "./brand-mark";
import { getEmailLogoImageUrl, emailImgTag } from "./brand-assets";
import { emailBrandColors, EMAIL } from "./config";

export interface BaseTemplateOptions {
  preheader?: string;
  showLogo?: boolean;
  showFooter?: boolean;
  showSocial?: boolean;
  backgroundColor?: string;
  /** Compact header without gradient band */
  minimalHeader?: boolean;
}

export const brandColors = emailBrandColors;

export const baseStyles = `
  body, table, td, p, a, li, blockquote {
    -webkit-text-size-adjust: 100%;
    -ms-text-size-adjust: 100%;
  }
  table, td {
    mso-table-lspace: 0pt;
    mso-table-rspace: 0pt;
  }
  img {
    -ms-interpolation-mode: bicubic;
    border: 0;
    height: auto;
    line-height: 100%;
    outline: none;
    text-decoration: none;
  }
  body {
    margin: 0 !important;
    padding: 0 !important;
    width: 100% !important;
  }
  @media (prefers-color-scheme: dark) {
    .email-bg { background-color: #111827 !important; }
    .email-surface { background-color: #1f2937 !important; }
    .email-text { color: #f9fafb !important; }
    .email-text-light { color: #d1d5db !important; }
    .email-footer-bg { background-color: #0f172a !important; }
  }
  @media only screen and (max-width: 620px) {
    .email-container { width: 100% !important; max-width: 100% !important; }
    .email-content { padding: 28px 20px !important; }
    .email-button { width: 100% !important; display: block !important; text-align: center !important; }
    .email-masthead { padding: 28px 20px 32px !important; }
    .footer-col { display: block !important; width: 100% !important; text-align: center !important; padding-bottom: 16px !important; }
  }
`;

export function generateBrandedHeader(minimal = false): string {
  const logoUrl = getEmailLogoImageUrl();
  const markCell = logoUrl
    ? emailImgTag(logoUrl, `${EMAIL.brandName} logo`, 56, 56, "border-radius: 14px; margin: 0 auto;")
    : emailLogoBlock({ markSize: 48, showWordmark: false, centered: true });

  if (minimal) {
    return `
  <tr>
    <td align="center" style="padding: 28px 24px 8px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
        <tr>
          <td style="vertical-align: middle; padding-right: 12px;">${markCell}</td>
          <td style="vertical-align: middle; text-align: left;">
            <p style="margin: 0; font-size: 20px; font-weight: 700; color: ${brandColors.secondary};">${EMAIL.brandName}</p>
            <p style="margin: 4px 0 0; font-size: 13px; color: ${brandColors.textLight};">${EMAIL.tagline}</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
  }

  return `
  <tr>
    <td class="email-masthead" style="background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 55%, #0891b2 100%); padding: 36px 32px 40px; text-align: center; border-radius: 12px 12px 0 0;">
      ${emailLogoBlock({
        markSize: 52,
        showWordmark: true,
        brandName: EMAIL.brandName,
        tagline: "Accept crypto. Settle to your wallet.",
      })}
    </td>
  </tr>`;
}

export function generateBrandedFooter(showSocial: boolean): string {
  const year = new Date().getFullYear();
  const siteHost = EMAIL.siteUrl.replace(/^https?:\/\//, "");
  const privacyUrl = `${EMAIL.siteUrl}${EMAIL.legal.privacy}`;
  const termsUrl = `${EMAIL.siteUrl}${EMAIL.legal.terms}`;
  const contactUrl = `${EMAIL.siteUrl}${EMAIL.legal.contact}`;

  const socialLinks = [
    { url: EMAIL.social.x, label: "X" },
    { url: EMAIL.social.linkedin, label: "LinkedIn" },
    { url: EMAIL.social.facebook, label: "Facebook" },
  ].filter((s): s is { url: string; label: string } => Boolean(s.url));

  const socialHtml =
    showSocial && socialLinks.length > 0
      ? `
      <p style="margin: 0 0 12px; font-size: 13px; color: ${brandColors.textLight};">Follow us</p>
      <p style="margin: 0 0 20px;">
        ${socialLinks
          .map(
            (s) =>
              `<a href="${s.url}" style="display: inline-block; margin: 0 6px; padding: 8px 14px; background: ${brandColors.surface}; border: 1px solid ${brandColors.border}; border-radius: 999px; font-size: 12px; font-weight: 600; color: ${brandColors.primary}; text-decoration: none;">${s.label}</a>`,
          )
          .join("")}
      </p>`
      : "";

  return `
  <tr>
    <td class="email-footer-bg" style="background: ${brandColors.background}; border-radius: 0 0 12px 12px; border-top: 1px solid ${brandColors.border};">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 28px 32px 20px;">
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              <tr>
                <td class="footer-col" width="50%" style="vertical-align: top; padding-right: 16px;">
                  <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                    <tr>
                      <td style="padding-right: 10px; vertical-align: middle;">
                        ${emailLogoBlock({ markSize: 36, showWordmark: false, centered: false })}
                      </td>
                      <td style="vertical-align: middle;">
                        <p style="margin: 0; font-size: 15px; font-weight: 700; color: ${brandColors.secondary};">${EMAIL.brandName}</p>
                        <p style="margin: 4px 0 0; font-size: 12px; color: ${brandColors.textLight}; line-height: 1.5;">${EMAIL.tagline}</p>
                      </td>
                    </tr>
                  </table>
                </td>
                <td class="footer-col" width="50%" align="right" style="vertical-align: top; text-align: right;">
                  <p style="margin: 0 0 6px; font-size: 13px; color: ${brandColors.textLight};">Need help?</p>
                  <p style="margin: 0;">
                    <a href="mailto:${EMAIL.support}" style="font-size: 14px; font-weight: 600; color: ${brandColors.primary}; text-decoration: none;">${EMAIL.support}</a>
                  </p>
                  <p style="margin: 8px 0 0;">
                    <a href="${EMAIL.siteUrl}" style="font-size: 13px; color: ${brandColors.textMuted}; text-decoration: underline;">${siteHost}</a>
                  </p>
                </td>
              </tr>
            </table>
            ${socialHtml}
            <p style="margin: 0 0 12px; font-size: 12px; color: ${brandColors.textMuted}; line-height: 1.6; text-align: center;">
              <a href="${contactUrl}" style="color: ${brandColors.textMuted}; text-decoration: underline;">Contact</a>
              &nbsp;·&nbsp;
              <a href="${privacyUrl}" style="color: ${brandColors.textMuted}; text-decoration: underline;">Privacy</a>
              &nbsp;·&nbsp;
              <a href="${termsUrl}" style="color: ${brandColors.textMuted}; text-decoration: underline;">Terms</a>
              &nbsp;·&nbsp;
              <a href="%unsubscribe_url%" style="color: ${brandColors.textMuted}; text-decoration: underline;">Unsubscribe</a>
            </p>
            <p style="margin: 0; font-size: 11px; color: ${brandColors.textMuted}; text-align: center;">
              © ${year} ${EMAIL.brandName}. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </td>
  </tr>`;
}

export function generateBaseTemplate(
  content: string,
  options: BaseTemplateOptions = {},
): string {
  const {
    preheader = "",
    showLogo = true,
    showFooter = true,
    showSocial = true,
    backgroundColor = brandColors.background,
    minimalHeader = false,
  } = options;

  const header = showLogo ? generateBrandedHeader(minimalHeader) : "";
  const footer = showFooter ? generateBrandedFooter(showSocial) : "";

  return `
<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no, date=no, address=no, email=no">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${EMAIL.brandName}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">${baseStyles}</style>
</head>
<body style="margin: 0; padding: 0; background-color: ${backgroundColor}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="display: none; max-height: 0; overflow: hidden; mso-hide: all;">
    ${preheader}${"&nbsp;".repeat(120)}
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: ${backgroundColor};" class="email-bg">
    <tr>
      <td align="center" style="padding: 24px 16px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; width: 100%; margin: 0 auto;" class="email-container">
          <tr>
            <td style="background-color: ${brandColors.surface}; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(15, 23, 42, 0.08);" class="email-surface">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                ${header}
                ${content}
                ${footer}
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

export const components = {
  button: (text: string, url: string, variant: "primary" | "secondary" | "outline" = "primary") => {
    const styles = {
      primary: `background: linear-gradient(135deg, ${brandColors.primary} 0%, ${brandColors.primaryDark} 100%); color: #ffffff;`,
      secondary: `background: ${brandColors.secondary}; color: #ffffff;`,
      outline: `background: transparent; color: ${brandColors.primary}; border: 2px solid ${brandColors.primary};`,
    };

    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin: 24px auto;">
      <tr>
        <td align="center">
          <a href="${url}" target="_blank" style="display: inline-block; ${styles[variant]} padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 600; font-size: 15px; mso-padding-alt: 0;" class="email-button">
            <span style="mso-text-raise: 12pt;">${text}</span>
          </a>
        </td>
      </tr>
    </table>`;
  },

  heading: (text: string, level: 1 | 2 | 3 = 1) => {
    const sizes = { 1: "26px", 2: "20px", 3: "17px" };
    const margins = { 1: "0 0 14px", 2: "0 0 10px", 3: "0 0 8px" };
    return `<h${level} style="margin: ${margins[level]}; font-size: ${sizes[level]}; font-weight: 700; color: ${brandColors.secondary}; line-height: 1.3;" class="email-text">${text}</h${level}>`;
  },

  paragraph: (text: string, options: { muted?: boolean; small?: boolean; center?: boolean } = {}) => {
    const color = options.muted ? brandColors.textLight : brandColors.text;
    const size = options.small ? "13px" : "15px";
    const align = options.center ? "center" : "left";
    return `<p style="margin: 0 0 16px; font-size: ${size}; color: ${color}; line-height: 1.65; text-align: ${align};" class="email-text">${text}</p>`;
  },

  divider: () =>
    `<hr style="margin: 24px 0; border: none; border-top: 1px solid ${brandColors.border};">`,

  card: (inner: string, options: { highlight?: boolean } = {}) => {
    const bg = options.highlight ? "#ecfdf5" : brandColors.background;
    const border = options.highlight ? brandColors.primary : brandColors.border;
    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
      <tr>
        <td style="background: ${bg}; border: 1px solid ${border}; border-radius: 10px; padding: 20px;">${inner}</td>
      </tr>
    </table>`;
  },

  badge: (text: string, variant: "success" | "warning" | "error" | "info" = "info") => {
    const colors = {
      success: { bg: "#dcfce7", text: "#166534" },
      warning: { bg: "#fef3c7", text: "#92400e" },
      error: { bg: "#fee2e2", text: "#991b1b" },
      info: { bg: "#e0f2fe", text: "#075985" },
    };
    return `<span style="display: inline-block; background: ${colors[variant].bg}; color: ${colors[variant].text}; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;">${text}</span>`;
  },

  iconHero: (emoji: string, title: string, subtitle?: string) => `
    <tr>
      <td style="padding: 40px 32px 8px; text-align: center;" class="email-content">
        <div style="width: 72px; height: 72px; margin: 0 auto 20px; background: linear-gradient(135deg, #ecfdf5, #cffafe); border-radius: 50%; line-height: 72px; font-size: 36px;">${emoji}</div>
        ${components.heading(title, 1)}
        ${subtitle ? components.paragraph(subtitle, { muted: true, center: true }) : ""}
      </td>
    </tr>`,

  contentOpen: () =>
    `<tr><td style="padding: 8px 32px 40px;" class="email-content">`,

  contentClose: () => `</td></tr>`,

  orderTable: (
    items: Array<{ name: string; quantity: number; price: number; image?: string }>,
    total: number,
  ) => {
    const rows = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid ${brandColors.border};">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td>
                <p style="margin: 0 0 4px; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">${item.name}</p>
                <p style="margin: 0; font-size: 13px; color: ${brandColors.textLight};">Qty: ${item.quantity}</p>
              </td>
              <td align="right" style="font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>`,
      )
      .join("");

    return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 16px 0;">
      ${rows}
      <tr>
        <td style="padding: 16px 0 0;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="font-size: 16px; font-weight: 700; color: ${brandColors.secondary};">Total</td>
              <td align="right" style="font-size: 20px; font-weight: 700; color: ${brandColors.primary};">$${total.toFixed(2)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  },

  infoRow: (label: string, value: string) => `
    <tr>
      <td style="padding: 8px 0; font-size: 14px; color: ${brandColors.textLight};">${label}</td>
      <td align="right" style="padding: 8px 0; font-size: 14px; font-weight: 600; color: ${brandColors.secondary};">${value}</td>
    </tr>`,
};
