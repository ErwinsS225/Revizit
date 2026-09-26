import { describe, expect, it } from "vitest";
import { FOOTER_HELP_LINKS, FOOTER_SHOP_LINKS, MAIN_NAV_LINKS, isActivePath } from "@/lib/navigation";

describe("navigation config", () => {
  it("liens principaux Revizit en français", () => {
    expect(MAIN_NAV_LINKS.map((l) => l.label)).toEqual([
      "Accueil",
      "Collection",
      "Hommes",
      "Femmes",
      "Verrerie",
    ]);
  });

  it("la navigation expose la verrerie Revizit", () => {
    expect(MAIN_NAV_LINKS.some((l) => l.href.includes("verrerie"))).toBe(true);
  });

  it("footer boutique + aide non vides", () => {
    expect(FOOTER_SHOP_LINKS.length).toBeGreaterThan(0);
    expect(FOOTER_HELP_LINKS.map((l) => l.label)).toContain("CGV");
    expect(FOOTER_HELP_LINKS.map((l) => l.label)).toContain("Livraison & retours");
  });
});

describe("isActivePath", () => {
  it("racine exacte uniquement", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/products", "/")).toBe(false);
  });
  it("préfixe pour les sous-pages", () => {
    expect(isActivePath("/products/robe", "/products")).toBe(true);
    expect(isActivePath("/cart", "/products")).toBe(false);
  });
  it("ignore les query params du href", () => {
    expect(isActivePath("/products", "/products?gender=MEN")).toBe(true);
  });
});
