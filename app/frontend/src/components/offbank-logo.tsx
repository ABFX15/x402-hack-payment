"use client";

import Image from "next/image";

const LOGO_SRC = "/new-logo-no-bg.png";

/* ─── OffbankLogo - logo icon + "Offbank" text ─── */
export function OffbankLogo({
  size = "lg",
  variant = "dark",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  const dims = { sm: 72, md: 84, lg: 96, xl: 112 };
  const textSizes = {
    sm: "text-[18px]",
    md: "text-[22px]",
    lg: "text-[26px]",
    xl: "text-[30px]",
  };
  const d = dims[size];
  const textColor = variant === "light" ? "#FFFFFF" : "#212121";

  return (
    <div className="flex items-center gap-2 select-none">
      <Image
        src={LOGO_SRC}
        alt="Offbank"
        height={d}
        width={d}
        className="object-contain"
        priority
      />
      <span
        className={`${textSizes[size]} font-bold leading-none tracking-tight`}
        style={{
          color: textColor,
          fontFamily: "var(--font-geist-sans), system-ui, -apple-system, sans-serif",
        }}
      >
        Offbank
      </span>
    </div>
  );
}

/* ─── OffbankLogoWithIcon - alias for OffbankLogo ─── */
export function OffbankLogoWithIcon({
  size = "lg",
  variant = "dark",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "light" | "dark";
}) {
  return <OffbankLogo size={size} variant={variant} />;
}

/* ─── OffbankLogoMono - monochrome variant ─── */
export function OffbankLogoMono({
  size = "lg",
  variant = "dark",
}: {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "light" | "dark";
}) {
  return <OffbankLogo size={size} variant={variant} />;
}
