import { describe, expect, it } from "vitest";
import { CATALOG_PAGE_SIZE, catalogFiltersSchema } from "@/lib/validators/catalog";
import { buildCatalogWhere } from "@/lib/catalog";

describe("catalogFiltersSchema", () => {
  it("défauts : tri newest + page 1", () => {
    const f = catalogFiltersSchema.parse({});
    expect(f.sort).toBe("newest");
    expect(f.page).toBe(1);
  });
  it("parse les query params (coerce page/prix)", () => {
    const f = catalogFiltersSchema.parse({ gender: "MEN", page: "2", maxPrice: "50000" });
    expect(f.gender).toBe("MEN");
    expect(f.page).toBe(2);
    expect(f.maxPrice).toBe(50000);
  });
  it("rejette un genre inconnu", () => {
    expect(catalogFiltersSchema.safeParse({ gender: "KIDS" }).success).toBe(false);
  });
  it("taille de page = 12", () => {
    expect(CATALOG_PAGE_SIZE).toBe(12);
  });
});

describe("buildCatalogWhere", () => {
  it("base : produits actifs uniquement", () => {
    expect(buildCatalogWhere(catalogFiltersSchema.parse({}))).toEqual({ isActive: true });
  });
  it("combine genre + catégorie + fourchette prix", () => {
    const where = buildCatalogWhere(
      catalogFiltersSchema.parse({ gender: "WOMEN", category: "robes", minPrice: "20000", maxPrice: "80000" }),
    );
    expect(where).toMatchObject({
      isActive: true,
      gender: "WOMEN",
      category: { slug: "robes" },
      price: { gte: 20000, lte: 80000 },
    });
  });
  it("recherche plein texte sur nom/description/marque", () => {
    const where = buildCatalogWhere(catalogFiltersSchema.parse({ q: "robe" }));
    expect(where.OR).toHaveLength(3);
  });
});
