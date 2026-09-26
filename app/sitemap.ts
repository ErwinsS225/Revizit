import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { BRAND } from "@/lib/brand";

// app/sitemap.ts — sitemap XML (produits + catégories dynamiques).
// Généré à la requête : le contenu dépend de la base, il ne doit PAS être
// figé au build (sinon `next build` échoue sans base, et le sitemap serait périmé).
export const dynamic = "force-dynamic";
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const statics: MetadataRoute.Sitemap = [
    { url: BRAND.url, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BRAND.url}/products`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${BRAND.url}/livraison`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  // En production, la base est disponible. En CI/build sans base, on renvoie
  // les seules URL statiques plutôt que de faire échouer le build.
  if (process.env.SKIP_PRISMA_ON_BUILD === "true" && process.env.NODE_ENV === "production") {
    return statics;
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 500,
    }),
    // Category n'a pas de champ updatedAt dans le schéma : on se rabat sur createdAt.
    prisma.category.findMany({ select: { slug: true, createdAt: true } }),
  ]);

  return [
    ...statics,
    ...products.map((p) => ({
      url: `${BRAND.url}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...categories.map((c) => ({
      url: `${BRAND.url}/products?category=${c.slug}`,
      lastModified: c.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}