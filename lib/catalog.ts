import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { parseJsonStringArray } from "@/lib/cart-pricing";
import type { CatalogFilters } from "@/lib/validators/catalog";
import { CATALOG_PAGE_SIZE } from "@/lib/validators/catalog";

// lib/catalog.ts — requêtes catalogue (serveur uniquement). Jamais de `any`.
export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  brand: string | null;
  gender: string;
  categoryName: string | null;
  reviewCount: number;
  avgRating: number | null;
}

export interface CatalogResult {
  products: CatalogProduct[];
  total: number;
  page: number;
  pageCount: number;
}

/** Construit le `where` Prisma depuis les filtres validés. */
export function buildCatalogWhere(filters: CatalogFilters): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { isActive: true };
  if (filters.gender) where.gender = filters.gender;
  if (filters.category) where.category = { slug: filters.category };
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    where.price = {
      ...(filters.minPrice !== undefined ? { gte: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice } : {}),
    };
  }
  if (filters.size) where.variants = { some: { size: filters.size, stock: { gt: 0 } } };
  if (filters.color) where.variants = { some: { ...(where.variants?.some ?? {}), color: filters.color } };
  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { description: { contains: filters.q } },
      { brand: { contains: filters.q } },
    ];
  }
  return where;
}

function orderByFor(sort: CatalogFilters["sort"]): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "popular":
      return { orderItems: { _count: "desc" } };
    case "newest":
    default:
      return { createdAt: "desc" };
  }
}

function toCatalogProduct(p: {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: string;
  brand: string | null;
  gender: string;
  category: { name: string } | null;
  reviews: { rating: number }[];
}): CatalogProduct {
  const count = p.reviews.length;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    images: parseJsonStringArray(p.images),
    brand: p.brand,
    gender: p.gender,
    categoryName: p.category?.name ?? null,
    reviewCount: count,
    avgRating: count > 0 ? p.reviews.reduce((s, r) => s + r.rating, 0) / count : null,
  };
}

/** Recherche paginée pour le catalogue. */
export async function searchProducts(filters: CatalogFilters): Promise<CatalogResult> {
  const where = buildCatalogWhere(filters);
  const [total, rows] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: orderByFor(filters.sort),
      skip: (filters.page - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        compareAtPrice: true,
        images: true,
        brand: true,
        gender: true,
        category: { select: { name: true } },
        reviews: { select: { rating: true } },
      },
    }),
  ]);
  return {
    products: rows.map(toCatalogProduct),
    total,
    page: filters.page,
    pageCount: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
  };
}

/** Détail produit par slug (avec variantes, catégorie, avis). */
export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { name: true, slug: true } },
      variants: { orderBy: [{ size: "asc" }] },
      reviews: {
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true } } },
      },
    },
  });
  if (!product || !product.isActive) return null;
  return product;
}

/** Produits similaires : même catégorie, sinon même genre (max 4). */
export async function getRelatedProducts(productId: string, categoryId: string | null, gender: string) {
  return prisma.product.findMany({
    where: {
      isActive: true,
      id: { not: productId },
      OR: [...(categoryId ? [{ categoryId }] : []), { gender }],
    },
    take: 4,
    select: { id: true, name: true, slug: true, price: true, images: true },
  });
}

/** Catégorie par slug (null si inconnue) — évite les landing pages fantômes en 200. */
export async function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug }, select: { id: true, name: true, slug: true } });
}

/** Facettes pour les filtres (catégories + tailles + couleurs + prix max). */
export async function getCatalogFacets() {
  const [categories, variants, maxPrice] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: "asc" }, select: { name: true, slug: true } }),
    prisma.productVariant.findMany({ select: { size: true, color: true } }),
    prisma.product.aggregate({ _max: { price: true }, where: { isActive: true } }),
  ]);
  const sizes = [...new Set(variants.map((v) => v.size))].sort();
  const colors = [...new Set(variants.map((v) => v.color).filter((c): c is string => Boolean(c)))].sort();
  return { categories, sizes, colors, maxPrice: maxPrice._max.price ?? 200000 };
}
