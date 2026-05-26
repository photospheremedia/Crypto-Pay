/**
 * Generate public/email/logo.png — same BrandMark as site header (lib/brand-mark.tsx).
 * Usage: pnpm email:logo (from apps/portal)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BITCOIN_ICON_PATH } from "../lib/brand-mark";
import { BRAND_COLORS } from "../lib/cryptopay/constants";

const GRADIENT = `linear-gradient(135deg, ${BRAND_COLORS.primary} 0%, ${BRAND_COLORS.accent} 100%)`;

async function renderLogo(size: number) {
  const borderRadius = Math.round(size * 0.25);
  const iconSize = Math.round(size * 0.55);

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: GRADIENT,
          borderRadius,
          boxShadow: "0 10px 30px rgba(16, 185, 129, 0.25)",
        }}
      >
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={BITCOIN_ICON_PATH} />
        </svg>
      </div>
    ),
    { width: size, height: size },
  );
}

async function main() {
  const outDir = join(process.cwd(), "public/email");
  await mkdir(outDir, { recursive: true });

  const sizes: Array<{ file: string; px: number }> = [
    { file: "logo.png", px: 112 },
    { file: "logo@2x.png", px: 224 },
  ];

  for (const { file, px } of sizes) {
    const response = await renderLogo(px);
    const outPath = join(outDir, file);
    await writeFile(outPath, Buffer.from(await response.arrayBuffer()));
    console.log(`Wrote ${outPath} (${px}x${px})`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
