import type { MetadataRoute } from "next";
import { BRAND, SEO_DESCRIPTION } from "@/lib/brand";

// app/manifest.ts — manifest PWA (revizit.md §1.1 « PWA-ready »).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — ${BRAND.signature}`,
    short_name: BRAND.name,
    description: SEO_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#FAF7F2",
    theme_color: "#0A0A0A",
    lang: "fr",
    dir: "ltr",
    categories: ["shopping", "lifestyle"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml", purpose: "any" },
    ],
  };
}