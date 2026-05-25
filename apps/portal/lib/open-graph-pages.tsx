import { ImageResponse } from "next/og";
import {
  PageSharePreviewImage,
  createBrandedImageOptions,
} from "@/lib/brand-mark";

export const OG_IMAGE_SIZE = {
  width: 1200,
  height: 630,
} as const;

export type OpenGraphPageConfig = {
  alt: string;
  title: string;
  subtitle: string;
  badge?: string;
};

export function createOpenGraphImage(config: OpenGraphPageConfig) {
  async function Image() {
    return new ImageResponse(
      (
        <PageSharePreviewImage
          title={config.title}
          subtitle={config.subtitle}
          badge={config.badge}
        />
      ),
      await createBrandedImageOptions(OG_IMAGE_SIZE),
    );
  }

  return {
    alt: config.alt,
    size: OG_IMAGE_SIZE,
    contentType: "image/png" as const,
    default: Image,
  };
}

export const OPEN_GRAPH_PAGES = {
  about: {
    alt: "Our Story — Crypto Pay",
    title: "Our Story: Crypto Pay",
    subtitle:
      "Built by business operators for business operators. Wallet-to-wallet crypto payments made simple.",
    badge: "About",
  },
  pricing: {
    alt: "Crypto Pay Pricing — Simple merchant fees",
    title: "Simple, Transparent Pricing",
    subtitle:
      "Straightforward pricing for businesses accepting crypto payments. Direct wallet settlement included.",
    badge: "From 2% per transaction",
  },
} as const satisfies Record<string, OpenGraphPageConfig>;
