import { describe, expect, it } from "vitest";
import { TESTIMONIALS, TESTIMONIALS_MARQUEE_MS } from "@/lib/testimonials";

describe("témoignages", () => {
  it("contient exactement 7 commentaires", () => {
    expect(TESTIMONIALS).toHaveLength(7);
  });
  it("chaque témoignage est complet (nom, ville CI, note, texte, produit)", () => {
    for (const t of TESTIMONIALS) {
      expect(t.name.length).toBeGreaterThan(2);
      expect(t.city.length).toBeGreaterThan(2);
      expect(t.rating).toBeGreaterThanOrEqual(1);
      expect(t.rating).toBeLessThanOrEqual(5);
      expect(t.comment.length).toBeGreaterThan(10);
      expect(t.product.length).toBeGreaterThan(2);
    }
  });
  it("marquee assez lent pour rester lisible (≥ 20 s)", () => {
    expect(TESTIMONIALS_MARQUEE_MS).toBeGreaterThanOrEqual(20000);
  });
});
