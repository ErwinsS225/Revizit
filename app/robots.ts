import type { MetadataRoute } from "next";
import { BRAND } from "@/lib/brand";

// app/robots.ts — directives robots (revizit.ci).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/checkout", "/cart", "/account", "/orders"],
      },
    ],
    sitemap: `${BRAND.url}/sitemap.xml`,
    host: BRAND.url,
  };
}