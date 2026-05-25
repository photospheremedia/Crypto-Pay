import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <BrandMark size={180} iconSize={180} borderRadius={40} strokeWidth={2.2} />,
    {
      ...size,
    },
  );
}
