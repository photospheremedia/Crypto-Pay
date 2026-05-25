import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export async function GET() {
  return new ImageResponse(
    <BrandMark size={192} iconSize={154} borderRadius={32} maskable strokeWidth={2.2} />,
    {
      width: 192,
      height: 192,
    },
  );
}
