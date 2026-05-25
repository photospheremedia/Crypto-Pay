import { ImageResponse } from "next/og";
import {
  SharePreviewImage,
  createBrandedImageOptions,
} from "@/lib/brand-mark";
import { SITE_METADATA } from "@/lib/site-metadata";

export const alt = SITE_METADATA.shareAlt;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<SharePreviewImage />, await createBrandedImageOptions(size));
}
