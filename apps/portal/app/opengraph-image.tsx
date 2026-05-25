/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text */
import { ImageResponse } from "next/og";
import { SharePreviewImage } from "@/lib/brand-mark";

export const alt = "Crypto Pay — Accept crypto payments to your wallet";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(<SharePreviewImage />, {
    ...size,
  });
}
