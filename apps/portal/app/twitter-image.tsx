import { ImageResponse } from "next/og";

export const alt = "Crypto Pay - Streamline Your Restaurant Operations";
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
          background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fed7aa 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(240, 83, 28, 0.15)",
            filter: "blur(60px)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-100px",
            left: "-100px",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "rgba(251, 191, 36, 0.2)",
            filter: "blur(60px)",
          }}
        />

        {/* Logo/Icon - RHS Infinity Chain */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "140px",
            height: "140px",
            borderRadius: "32px",
            background: "linear-gradient(135deg, #f0531c 0%, #ff6b35 100%)",
            marginBottom: "32px",
            boxShadow: "0 20px 40px rgba(240, 83, 28, 0.35)",
          }}
        >
          <svg
            width="80"
            height="80"
            viewBox="137 137 116 64"
          >
            <path 
              fill="white" 
              d="M 169.429688 137.277344 C 178.28125 137.277344 186.292969 140.894531 192.0625 146.726562 L 175.238281 163.550781 C 169.332031 159.5625 159.777344 160.882812 154.3125 175.253906 C 154.019531 176.027344 153.726562 176.804688 153.433594 177.578125 C 152.160156 180.917969 152.839844 184.355469 155.242188 186.757812 C 157.644531 189.160156 161.082031 189.839844 164.421875 188.570312 L 166.746094 187.6875 C 181.121094 182.226562 182.4375 172.667969 178.449219 166.765625 L 195.027344 150.1875 C 200.683594 144.527344 204.332031 140.753906 212.246094 138.496094 C 215.023438 137.703125 217.960938 137.277344 220.996094 137.277344 C 238.578125 137.277344 252.832031 151.53125 252.832031 169.117188 C 252.832031 186.699219 238.578125 200.953125 220.996094 200.953125 C 212.265625 200.953125 204.363281 197.441406 198.609375 191.753906 L 214.21875 176.144531 C 215.546875 176.925781 217.054688 177.261719 218.691406 177.140625 C 221.039062 176.960938 222.984375 175.882812 224.382812 173.988281 L 238.15625 155.273438 L 237.40625 154.519531 L 223.230469 168.695312 C 222.996094 168.929688 222.605469 168.929688 222.367188 168.695312 C 222.132812 168.457031 222.132812 168.066406 222.367188 167.832031 L 236.542969 153.65625 L 235.449219 152.566406 L 221.277344 166.738281 C 221.039062 166.976562 220.652344 166.976562 220.414062 166.738281 C 220.175781 166.503906 220.175781 166.113281 220.414062 165.875 L 234.585938 151.703125 L 233.496094 150.609375 L 219.320312 164.785156 C 219.085938 165.019531 218.695312 165.019531 218.457031 164.785156 C 218.222656 164.546875 218.222656 164.160156 218.457031 163.921875 L 232.632812 149.75 L 231.921875 149.039062 C 231.648438 149.191406 231.382812 149.363281 231.121094 149.554688 L 213.164062 162.773438 C 211.269531 164.167969 210.191406 166.117188 210.011719 168.460938 C 209.890625 170.097656 210.226562 171.605469 211.007812 172.933594 L 195.613281 188.332031 C 190.6875 192.882812 187.113281 196.425781 180.878906 198.832031 C 177.324219 200.203125 173.464844 200.953125 169.429688 200.953125 C 151.847656 200.953125 137.589844 186.699219 137.589844 169.117188 C 137.589844 151.53125 151.847656 137.277344 169.429688 137.277344 Z"
            />
          </svg>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: "800",
            color: "#0f172a",
            textAlign: "center",
            marginBottom: "16px",
            letterSpacing: "-0.02em",
          }}
        >
          Crypto Pay
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            fontWeight: "500",
            color: "#64748b",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: "1.4",
          }}
        >
          Delivery integrations • Supply marketplace • Brand refresh
        </div>

        {/* Stats bar */}
        <div
          style={{
            display: "flex",
            gap: "48px",
            marginTop: "48px",
            padding: "24px 48px",
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "24px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "700", color: "#059669" }}>500+</span>
            <span style={{ fontSize: "16px", color: "#64748b" }}>Happy Clients</span>
          </div>
          <div style={{ width: "1px", background: "#e2e8f0" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "700", color: "#059669" }}>4.9/5</span>
            <span style={{ fontSize: "16px", color: "#64748b" }}>Rating</span>
          </div>
          <div style={{ width: "1px", background: "#e2e8f0" }} />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "36px", fontWeight: "700", color: "#059669" }}>98%</span>
            <span style={{ fontSize: "16px", color: "#64748b" }}>Recommend</span>
          </div>
        </div>

        {/* Domain */}
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            fontSize: "20px",
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
    }
  );
}
