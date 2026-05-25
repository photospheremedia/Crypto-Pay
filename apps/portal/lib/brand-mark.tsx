/** Shared brand mark for favicons, app icons, and OG images (ImageResponse-safe). */

export const BRAND_GRADIENT = "linear-gradient(135deg, #10b981 0%, #0891b2 100%)";

export const BITCOIN_ICON_PATH =
  "M11.767 19.089c4.924.868 6.14-6.025 1.216-6.894m-1.216 6.894L5.86 18.047m5.908 1.042-.347 1.97m1.563-8.864c4.924.869 6.14-6.025 1.215-6.893m-1.215 6.893-3.94-.694m5.155-6.2L8.29 4.26m5.908 1.042.348-1.97M7.48 20.364l3.126-17.727";

export function BrandMark({
  size,
  iconSize,
  borderRadius,
}: {
  size: number;
  iconSize: number;
  borderRadius: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius,
        background: BRAND_GRADIENT,
        boxShadow: "0 10px 30px rgba(16, 185, 129, 0.25)",
      }}
    >
      <svg
        width={iconSize}
        height={iconSize}
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
  );
}

export function SharePreviewImage() {
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #ecfdf5 0%, #d1fae5 50%, #cffafe 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        padding: "48px",
      }}
    >
      <BrandMark size={120} iconSize={64} borderRadius={28} />

      <div
        style={{
          marginTop: "32px",
          fontSize: "56px",
          fontWeight: "800",
          color: "#0f172a",
          textAlign: "center",
          marginBottom: "16px",
          letterSpacing: "-0.02em",
        }}
      >
        Crypto Pay
      </div>

      <div
        style={{
          fontSize: "26px",
          fontWeight: "500",
          color: "#64748b",
          textAlign: "center",
          maxWidth: "720px",
          lineHeight: "1.4",
        }}
      >
        Accept crypto payments to your wallet
      </div>

      <div
        style={{
          marginTop: "40px",
          fontSize: "18px",
          fontWeight: "600",
          color: "#047857",
          letterSpacing: "0.05em",
        }}
      >
        cryptopay.sale
      </div>
    </div>
  );
}
