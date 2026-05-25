import { MetadataRoute } from "next";
import { BRAND, BRAND_COLORS } from "@/lib/cryptopay/constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: BRAND.name,
    short_name: BRAND.name,
    description:
      "Accept crypto payments instantly, securely, and globally. Direct wallet settlement for modern merchants.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: BRAND_COLORS.primary,
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    categories: ["finance", "business", "productivity"],
  };
}
