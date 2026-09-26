import { describe, expect, it } from "vitest";
import { formatPrice, slugify } from "@/lib/utils";

describe("slugify", () => {
  it("génère un slug URL-safe", () => {
    expect(slugify("Robe d'Été en Lin")).toBe("robe-d-ete-en-lin");
  });
  it("nettoie les caractères spéciaux", () => {
    expect(slugify("  Chemise  Homme!! ")).toBe("chemise-homme");
  });
});

describe("formatPrice (FCFA)", () => {
  it("formate un montant sans décimales", () => {
    // fr-CI utilise des espaces insécables : "39 000 F CFA" — on normalise avant le test.
    const formatted = formatPrice(39000).replace(/[\s\u202f\u00a0]/g, " ");
    expect(formatted).toContain("39");
    expect(formatted).toMatch(/F CFA|FCFA|XOF/);
  });
  it("formate 0", () => {
    expect(formatPrice(0)).toMatch(/0/);
  });
  it("n'affiche aucune décimale", () => {
    expect(formatPrice(39000)).not.toMatch(/,\d{2}/);
  });
});

