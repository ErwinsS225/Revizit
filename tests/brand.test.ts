import { describe, expect, it } from "vitest";
import {
  BRAND,
  FREE_ENGRAVING_FROM,
  FREE_SHIPPING_THRESHOLD,
  GLASS_PRICING,
  PAYMENT_METHODS,
  PROMO_CODES,
  SEO_DESCRIPTION,
} from "@/lib/brand";

describe("marque Revizit", () => {
  it("porte le nom et la signature du document", () => {
    expect(BRAND.name).toBe("Revizit");
    expect(BRAND.signature).toBe("L'élégance africaine, ta signature gravée.");
    expect(BRAND.city).toBe("Abidjan");
  });

  it("description SEO mentioning mode africaine et verrerie", () => {
    expect(SEO_DESCRIPTION).toContain("vêtements africains");
    expect(SEO_DESCRIPTION).toContain("verrerie gravée");
  });

  it("liste les moyens de paiement Mobile Money ivoiriens", () => {
    expect(PAYMENT_METHODS).toContain("Orange Money");
    expect(PAYMENT_METHODS).toContain("Wave");
    expect(PAYMENT_METHODS).toContain("MTN MoMo");
  });

  it("seuil de livraison offerte à 50 000 FCFA (revizit.md)", () => {
    expect(FREE_SHIPPING_THRESHOLD).toBe(50000);
  });

  it("gravure offerte dès 4 coupes", () => {
    expect(FREE_ENGRAVING_FROM).toBe(4);
  });

  it("tarif verrerie dégressif croissant en quantité", () => {
    expect(GLASS_PRICING[0]?.price).toBe(8000);
    const prices = GLASS_PRICING.map((g) => g.price);
    for (let i = 1; i < prices.length; i += 1) {
      expect(prices[i]!).toBeGreaterThan(prices[i - 1]!);
    }
  });

  it("codes promo avec un pourcentage positif", () => {
    for (const promo of Object.values(PROMO_CODES)) {
      expect(promo.code.length).toBeGreaterThan(3);
      expect(promo.percent).toBeGreaterThan(0);
    }
  });
});