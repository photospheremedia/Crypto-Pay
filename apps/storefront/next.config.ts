export default {
  experimental: {
    ppr: true,
    inlineCss: true,
    useCache: true,
  },
  transpilePackages: ["@crypto-pay/shared"],
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
    ],
  },
};
