import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Offbank - Enterprise Payments for the Debanked";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const logoData = await fetch(
    new URL("../../public/offbank-logo-nobg.png", import.meta.url),
  ).then((res) => res.arrayBuffer());

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
        }}
      >
        {/* Subtle topo-style background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "radial-gradient(circle at 20% 50%, rgba(27,107,74,0.06) 0%, transparent 50%), radial-gradient(circle at 80% 30%, rgba(27,107,74,0.04) 0%, transparent 50%)",
          }}
        />

        {/* Top accent bar - green */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 5,
            background: "linear-gradient(90deg, #34c759, #2ba048)",
          }}
        />

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "60px 80px",
            position: "relative",
          }}
        >
          {/* Left side - text */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              maxWidth: 700,
            }}
          >
            {/* Logo */}
            <div style={{ display: "flex", marginBottom: 32 }}>
              { }
              <img
                // @ts-expect-error Satori accepts ArrayBuffer for img src
                src={logoData}
                width="80"
                height="80"
                style={{ objectFit: "contain" }}
              />
            </div>

            {/* Pill badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                borderRadius: 40,
                border: "1px solid rgba(27,107,74,0.3)",
                background: "rgba(27,107,74,0.08)",
                padding: "8px 18px",
                fontSize: 15,
                color: "#34c759",
                fontWeight: 500,
                marginBottom: 28,
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  backgroundColor: "#34c759",
                }}
              />
              Non-Custodial Settlement
            </div>

            {/* Headline */}
            <div
              style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 1.1,
                letterSpacing: "-0.025em",
                marginBottom: 24,
                display: "flex",
                flexDirection: "column",
                fontFamily: "serif",
              }}
            >
              <span style={{ color: "#212121" }}>Enterprise payments</span>
              <span style={{ color: "#212121" }}>
                for the <span style={{ color: "#34c759" }}>debanked</span>.
              </span>
            </div>

            {/* Subtitle */}
            <div
              style={{
                fontSize: 21,
                color: "#5c5c5c",
                lineHeight: 1.5,
                marginBottom: 40,
                maxWidth: 480,
              }}
            >
              Non-custodial USDC settlement for high-risk B2B supply chains. 1%
              flat fee. Sub-second finality. No bank interference, ever.
            </div>

            {/* Stats row */}
            <div style={{ display: "flex", gap: 48 }}>
              {[
                { value: "<1s", label: "Settlement" },
                { value: "1%", label: "Flat Fee" },
                { value: "24/7", label: "No Banks" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  style={{ display: "flex", flexDirection: "column" }}
                >
                  <span
                    style={{
                      fontSize: 34,
                      fontWeight: 700,
                      color: "#34c759",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}
                  </span>
                  <span style={{ fontSize: 14, color: "#8a8a8a" }}>
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - code snippet card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: 340,
              borderRadius: 16,
              border: "1px solid #d3d3d3",
              background: "#212121",
              padding: "24px 28px",
              boxShadow: "0 24px 48px rgba(12,24,41,0.15)",
            }}
          >
            {/* Editor dots */}
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#ff5f57",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#febc2e",
                }}
              />
              <div
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  backgroundColor: "#28c840",
                }}
              />
            </div>
            {/* Code lines */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <span style={{ fontSize: 13, color: "#8a8a8a" }}>
                {"// Settle a B2B invoice"}
              </span>
              <span style={{ fontSize: 14, color: "rgba(255,255,255,0.6)" }}>
                {"const "}
                <span style={{ color: "#2ba048" }}>settlement</span>
                {" = await"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {"  offbank.settle({"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {'    to: "vendor.sol",'}
              </span>
              <span style={{ fontSize: 13, color: "#2ba048" }}>
                {"    amount: 5_000,"}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {'    currency: "USDC",'}
              </span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>
                {"  })"}
              </span>
              <div style={{ height: 6 }} />
              <span style={{ fontSize: 13, color: "#8a8a8a" }}>
                {"// Settled in <1s ✓"}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 48,
            background: "#212121",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 80px",
          }}
        >
          <span
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.5)",
              fontWeight: 600,
            }}
          >
            offbankpay.com
          </span>
          <div style={{ display: "flex", gap: 28 }}>
            {["Non-custodial", "Multisig", "Solana", "1% Flat Fee"].map(
              (tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: 13,
                    color: "rgba(255,255,255,0.3)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
