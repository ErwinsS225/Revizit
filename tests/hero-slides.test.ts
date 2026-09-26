import { describe, expect, it } from "vitest";
import { HERO_AUTOPLAY_MS, HERO_SLIDES } from "@/lib/hero-slides";

describe("hero slides", () => {
  it("contient exactement 3 slides", () => {
    expect(HERO_SLIDES).toHaveLength(3);
  });

  it("chaque slide a un texte + CTA + image valides", () => {
    for (const slide of HERO_SLIDES) {
      expect(slide.title.length).toBeGreaterThan(5);
      expect(slide.subtitle.length).toBeGreaterThan(5);
      expect(slide.ctaLabel.length).toBeGreaterThan(1);
      expect(slide.ctaHref.startsWith("/products")).toBe(true);
      expect(slide.image.startsWith("https://images.unsplash.com/")).toBe(true);
      expect(slide.imageAlt.length).toBeGreaterThan(3);
    }
  });

  it("autoplay raisonnable (5-8 s)", () => {
    expect(HERO_AUTOPLAY_MS).toBeGreaterThanOrEqual(5000);
    expect(HERO_AUTOPLAY_MS).toBeLessThanOrEqual(8000);
  });
});
