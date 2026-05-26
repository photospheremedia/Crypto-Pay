/**
 * Generate public/email/logo.png for transactional emails.
 * Usage: pnpm email:logo (from apps/portal)
 */
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { BITCOIN_ICON_PATH } from "../lib/brand-mark";

const SIZE = 96;

async function main() {
  const response = new ImageResponse(
    (
      <div
        style={{
          width: SIZE,
          height: SIZE,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #10b981 0%, #0891b2 100%)",
          borderRadius: 24,
        }}
      >
        <svg
          width="52"
          height="52"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d={BITCOIN_ICON_PATH} />
        </svg>
      </div>
    ),
    { width: SIZE, height: SIZE },
  );

  const outDir = join(process.cwd(), "public/email");
  await mkdir(outDir, { recursive: true });
  const outPath = join(outDir, "logo.png");
  await writeFile(outPath, Buffer.from(await response.arrayBuffer()));
  console.log(`Wrote ${outPath} (${SIZE}x${SIZE})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
