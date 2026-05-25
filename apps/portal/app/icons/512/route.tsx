import { ImageResponse } from "next/og";
import { BrandMark } from "@/lib/brand-mark";

export async function GET() {
  return new ImageResponse(
    <BrandMark size={512} iconSize={410} borderRadius={96} maskable strokeWidth={2.2} />,
    {
      width: 512,
      height: 512,
    },
  );
}
