import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Restaurant Hub Solution",
    short_name: "RHS",
    description: "All-in-one platform for restaurant delivery management, supplies, and technology solutions",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#f0531c",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/icons/icon-192.svg",
        sizes: "192x192",
        type: "image/svg+xml",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icons/apple-touch-icon.svg",
        sizes: "180x180",
        type: "image/svg+xml",
      },
    ],
    categories: ["business", "food", "productivity"],
    screenshots: [
      {
        src: "/screenshots/dashboard.png",
        sizes: "1280x720",
        type: "image/png",
        form_factor: "wide",
        label: "Restaurant Hub Dashboard",
      },
    ],
    shortcuts: [
      {
        name: "Dashboard",
        short_name: "Dashboard",
        url: "/app",
        icons: [{ src: "/icons/dashboard-96.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
      {
        name: "Shop Supplies",
        short_name: "Shop",
        url: "/shop",
        icons: [{ src: "/icons/shop-96.svg", sizes: "96x96", type: "image/svg+xml" }],
      },
    ],
  };
}
