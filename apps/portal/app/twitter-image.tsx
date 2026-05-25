import { ImageResponse } from "next/og";

export const alt = "Crypto Pay — Accept crypto payments to your wallet";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "120px",
            height: "120px",
            borderRadius: "28px",
            background: "linear-gradient(135deg, #10b981 0%, #0891b2 100%)",
            marginBottom: "32px",
            fontSize: "64px",
            fontWeight: 700,
            color: "white",
          }}
        >
          ₿
        </div>

        <div
          style={{
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
    ),
    {
      ...size,
    },
  );
}
