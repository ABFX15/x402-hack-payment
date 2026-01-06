import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Settlr - Instant Crypto Payments";
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
            "radial-gradient(circle at 25% 25%, rgba(244, 114, 182, 0.15) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(103, 232, 249, 0.15) 0%, transparent 50%)",
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
              fontSize: 72,
              fontWeight: 800,
              background: "linear-gradient(135deg, #a855f7 0%, #22d3ee 100%)",
              backgroundClip: "text",
              color: "transparent",
              marginBottom: 20,
            }}
          >
            Settlr
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 36,
              color: "#e5e5e5",
              marginBottom: 40,
              textAlign: "center",
            }}
          >
            Instant Crypto Payments for the Modern Web
          </div>

          {/* Features */}
          <div
            style={{
              display: "flex",
              gap: 40,
              marginTop: 20,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#a855f7",
                fontSize: 24,
              }}
            >
              <span>⚡</span>
              <span>Gasless</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#22d3ee",
                fontSize: 24,
              }}
            >
              <span>🔒</span>
              <span>Secure</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#a855f7",
                fontSize: 24,
              }}
            >
              <span>💰</span>
              <span>Instant</span>
            </div>
          </div>
        </div>

        {/* Bottom URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 24,
            color: "#a3a3a3",
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
