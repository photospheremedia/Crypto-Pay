/** Shared brand mark for favicons, app icons, and OG images (ImageResponse-safe). */

import type { ReactNode } from "react";
import { SITE_METADATA } from "@/lib/site-metadata";
import { BRAND, BRAND_COLORS } from "@/lib/cryptopay/constants";

export const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.accent} 100%)`;

export const BITCOIN_ICON_PATH =
  "M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727";

const MANROPE = {
  medium: "Manrope-Medium.ttf",
  bold: "Manrope-Bold.ttf",
  extrabold: "Manrope-ExtraBold.ttf",
} as const;

let manropeFontsPromise: ReturnType<typeof loadFontsFromDisk> | undefined;

async function loadFontsFromDisk() {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  const fontsDir = join(process.cwd(), "assets/fonts");

  const [medium, bold, extrabold] = await Promise.all([
    readFile(join(fontsDir, MANROPE.medium)),
    readFile(join(fontsDir, MANROPE.bold)),
    readFile(join(fontsDir, MANROPE.extrabold)),
  ]);

  return [
    { name: "Manrope", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Manrope", data: bold, weight: 700 as const, style: "normal" as const },
    {
      name: "Manrope",
      data: extrabold,
      weight: 800 as const,
      style: "normal" as const,
    },
  ];
}

export async function loadManropeFonts() {
  manropeFontsPromise ??= loadFontsFromDisk();
  return manropeFontsPromise;
}

export async function createBrandedImageOptions(size: {
  width: number;
  height: number;
}) {
  const fonts = await loadManropeFonts();

  return {
    ...size,
    fonts,
  };
}

export function BrandMark({
  size,
  iconSize,
  borderRadius,
  maskable = false,
  showShadow = true,
  strokeWidth = 2,
}: {
  size: number;
  iconSize: number;
  borderRadius: number;
  maskable?: boolean;
  showShadow?: boolean;
  strokeWidth?: number;
}) {
  const mark = (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: iconSize,
        height: iconSize,
        borderRadius: borderRadius * (iconSize / size),
        background: BRAND_GRADIENT,
        ...(showShadow
          ? { boxShadow: "0 10px 30px rgba(16, 185, 129, 0.25)" }
          : {}),
      }}
    >
      <svg
        width={iconSize * 0.55}
        height={iconSize * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d={BITCOIN_ICON_PATH} />
      </svg>
    </div>
  );

  if (!maskable) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
        }}
      >
        {mark}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        background: BRAND_GRADIENT,
      }}
    >
      {mark}
    </div>
  );
}

const SHARE_CRYPTO_PILLS = ["BTC", "ETH", "USDC", "USDT"] as const;

function SharePreviewBackground({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 42%, #cffafe 100%)",
        fontFamily: "Manrope, system-ui, sans-serif",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-80px",
          width: "420px",
          height: "420px",
          borderRadius: "9999px",
          background: "rgba(16, 185, 129, 0.18)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-160px",
          left: "-60px",
          width: "360px",
          height: "360px",
          borderRadius: "9999px",
          background: "rgba(8, 145, 178, 0.14)",
        }}
      />
      {children}
    </div>
  );
}

export function PageSharePreviewImage({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle: string;
  badge?: string;
}) {
  return (
    <SharePreviewBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "64px 72px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <BrandMark size={72} iconSize={72} borderRadius={18} showShadow />
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <div
              style={{
                fontSize: "28px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.02em",
              }}
            >
              {BRAND.name}
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: BRAND_COLORS.primaryDark,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {SITE_METADATA.domain}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          {badge ? (
            <div
              style={{
                alignSelf: "flex-start",
                padding: "8px 16px",
                borderRadius: "9999px",
                background: "rgba(255, 255, 255, 0.82)",
                border: "1px solid rgba(16, 185, 129, 0.22)",
                color: "#065f46",
                fontSize: "16px",
                fontWeight: 700,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              {badge}
            </div>
          ) : null}

          <div
            style={{
              maxWidth: "900px",
              fontSize: "58px",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>

          <div
            style={{
              maxWidth: "820px",
              fontSize: "30px",
              fontWeight: 500,
              color: "#334155",
              lineHeight: 1.35,
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>
    </SharePreviewBackground>
  );
}

export function SharePreviewImage() {
  return (
    <SharePreviewBackground>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          padding: "72px 80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <BrandMark size={112} iconSize={112} borderRadius={28} showShadow />

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div
              style={{
                fontSize: "64px",
                fontWeight: 800,
                color: "#0f172a",
                letterSpacing: "-0.03em",
                lineHeight: 1,
              }}
            >
              {BRAND.name}
            </div>
            <div
              style={{
                fontSize: "24px",
                fontWeight: 700,
                color: BRAND_COLORS.primaryDark,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              {SITE_METADATA.domain}
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: "36px",
            maxWidth: "760px",
            fontSize: "34px",
            fontWeight: 500,
            color: "#334155",
            lineHeight: 1.35,
          }}
        >
          {SITE_METADATA.shareHeadline}
        </div>

        <div style={{ display: "flex", gap: "14px", marginTop: "34px" }}>
          {SHARE_CRYPTO_PILLS.map((symbol) => (
            <div
              key={symbol}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "10px 18px",
                borderRadius: "9999px",
                background: "rgba(255, 255, 255, 0.82)",
                border: "1px solid rgba(16, 185, 129, 0.22)",
                color: "#065f46",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "0.04em",
              }}
            >
              {symbol}
            </div>
          ))}
        </div>
      </div>
    </SharePreviewBackground>
  );
}
