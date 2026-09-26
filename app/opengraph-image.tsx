// app/opengraph-image.tsx — image Open Graph générée à la volée (revizit.md §9.2).
// Évite de dépendre d'un fichier binaire /og-image.jpg absent du dépôt.
import { ImageResponse } from "next/og";
import { BRAND } from "@/lib/brand";

export const alt = `${BRAND.name} — ${BRAND.signature}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #0A0A0A 0%, #1C1917 55%, #8A6A2F 100%)",
          color: "#F5F1E8",
          fontFamily: "serif",
          padding: 80,
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 128, letterSpacing: 14, color: "#D4AF37" }}>REVIZIT</div>
        <div style={{ fontSize: 40, marginTop: 24, opacity: 0.92 }}>
          L&apos;élégance africaine, ta signature gravée.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 28,
            color: "#D4AF37",
            letterSpacing: 2,
          }}
        >
          WAX · BOGOLAN · KITA &nbsp;|&nbsp; VERRERIE GRAVÉE · ABIDJAN
        </div>
      </div>
    ),
    size,
  );
}