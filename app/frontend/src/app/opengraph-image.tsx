import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr - Seamless iGaming Payments";
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
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0f",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(168, 85, 247, 0.2) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(34, 211, 238, 0.2) 0%, transparent 50%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Logo/Brand */}
          <div
            style={{
              fontSize: 80,
              fontWeight: 800,
              background: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 24,
            }}
          >
            Settlr
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 40,
              color: "#ffffff",
              marginBottom: 16,
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            Seamless Payments for iGaming
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 28,
              color: "#a3a3a3",
              marginBottom: 48,
              textAlign: "center",
            }}
          >
            No wallet required • Gasless on Solana • 2% fees
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 48,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#a855f7",
                fontSize: 26,
              }}
            >
              <span>✉️</span>
              <span>Email Login</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#22d3ee",
                fontSize: 26,
              }}
            >
              <span>⚡</span>
              <span>Gasless</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#a855f7",
                fontSize: 26,
              }}
            >
              <span>🌐</span>
              <span>Multichain</span>
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#737373",
          }}
        >
          settlr.dev
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
