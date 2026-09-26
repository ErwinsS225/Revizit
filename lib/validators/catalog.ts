import { z } from "zod";

// lib/validators/catalog.ts — filtres catalogue (query params), validés côté serveur.
export const catalogFiltersSchema = z.object({
  q: z.string().max(100).optional(),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]).optional(),
  category: z.string().max(60).optional(),
  size: z.string().max(10).optional(),
  color: z.string().max(30).optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  sort: z.enum(["newest", "price-asc", "price-desc", "popular"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
});

export type CatalogFilters = z.infer<typeof catalogFiltersSchema>;

/** Nombre de produits par page catalogue. */
export const CATALOG_PAGE_SIZE = 12;

/** Nombre de filtres actifs (hors tri/pagination) — affiché sur le bouton mobile. */
export function countActiveFilters(filters: CatalogFilters): number {
  let n = 0;
  if (filters.q) n += 1;
  if (filters.gender) n += 1;
  if (filters.category) n += 1;
  if (filters.size) n += 1;
  if (filters.color) n += 1;
  if (filters.minPrice !== undefined) n += 1;
  if (filters.maxPrice !== undefined) n += 1;
  if (filters.sort !== "newest") n += 1;
  return n;
}
export const SORT_OPTIONS: { value: CatalogFilters["sort"]; label: string }[] = [
  { value: "newest", label: "Nouveautés" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "popular", label: "Popularité" },
];
