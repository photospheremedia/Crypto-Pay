/**
 * Absolute URLs for email images (Resend / React Email best practice).
 * @see https://github.com/resend/react-email — use production CDN or site origin for Img src
 */

import { EMAIL } from "./config";

function siteOrigin(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || EMAIL.siteUrl).replace(/\/$/, "");
}

/** Optional PNG mark — set EMAIL_LOGO_URL after uploading to /public/email/ */
export function getEmailLogoImageUrl(): string | undefined {
  const custom = process.env.EMAIL_LOGO_URL?.trim();
  if (custom) return custom;
  return `${siteOrigin()}/icons/icon-512.svg`;
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
