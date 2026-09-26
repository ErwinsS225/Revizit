import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "@/lib/validators/auth";
import { addressSchema, checkoutSchema, orderStatusSchema } from "@/lib/validators/order";
import { categorySchema, productSchema, reviewSchema, variantSchema } from "@/lib/validators/product";

describe("registerSchema", () => {
  it("accepte une inscription valide", () => {
    expect(
      registerSchema.safeParse({ name: "Marie", email: "marie@ex.com", password: "Secret123" }).success,
    ).toBe(true);
  });
  it("rejette un mot de passe faible", () => {
    expect(
      registerSchema.safeParse({ name: "Marie", email: "marie@ex.com", password: "faible" }).success,
    ).toBe(false);
  });
});

describe("loginSchema", () => {
  it("normalise l'email (minuscules)", () => {
    const r = loginSchema.safeParse({ email: "MARIE@EX.COM", password: "x" });
    expect(r.success && r.data.email).toBe("marie@ex.com");
  });
});

describe("productSchema", () => {
  const base = {
    name: "Robe été lin",
    slug: "robe-ete-lin",
    description: "Robe légère en lin, coupe fluide.",
    price: 7990,
    images: ["https://images.unsplash.com/photo-1"],
  };
  it("accepte un produit valide", () => {
    expect(productSchema.safeParse(base).success).toBe(true);
  });
  it("rejette un slug invalide et un prix flottant", () => {
    expect(productSchema.safeParse({ ...base, slug: "Robe Été!" }).success).toBe(false);
    expect(productSchema.safeParse({ ...base, price: 79.9 }).success).toBe(false);
  });
  it("rejette sans image", () => {
    expect(productSchema.safeParse({ ...base, images: [] }).success).toBe(false);
  });
});

describe("variantSchema / categorySchema / reviewSchema", () => {
  it("variante valide", () => {
    expect(variantSchema.safeParse({ size: "M", color: "Beige", stock: 5, priceModifier: 0 }).success).toBe(true);
  });
  it("catégorie valide", () => {
    expect(categorySchema.safeParse({ name: "Robes", slug: "robes" }).success).toBe(true);
  });
  it("avis hors borne rejeté", () => {
    expect(reviewSchema.safeParse({ productId: "p1", rating: 6 }).success).toBe(false);
  });
});

describe("addressSchema / checkoutSchema / orderStatusSchema", () => {
  it("adresse CI valide (téléphone requis)", () => {
    expect(
      addressSchema.safeParse({
        fullName: "Marie Dupont",
        street: "12 rue des Jardins, Cocody",
        city: "Abidjan",
        phone: "+225 07 00 00 00 00",
      }).success,
    ).toBe(true);
    // Sans téléphone → rejeté (indispensable pour la livraison).
    expect(
      addressSchema.safeParse({
        fullName: "Marie Dupont",
        street: "12 rue des Jardins",
        city: "Abidjan",
        phone: "",
      }).success,
    ).toBe(false);
  });
  it("checkout exige ≥ 1 ligne + moyen de paiement CI", () => {
    expect(
      checkoutSchema.safeParse({ addressId: "a1", paymentMethod: "CASH_ON_DELIVERY", lines: [] }).success,
    ).toBe(false);
    expect(
      checkoutSchema.safeParse({
        addressId: "a1",
        paymentMethod: "MOBILE_MONEY",
        lines: [{ productId: "p1", quantity: 2 }],
      }).success,
    ).toBe(true);
    expect(
      checkoutSchema.safeParse({
        addressId: "a1",
        paymentMethod: "STRIPE",
        lines: [{ productId: "p1", quantity: 2 }],
      }).success,
    ).toBe(false);
  });
  it("statuts connus uniquement", () => {
    expect(orderStatusSchema.safeParse("SHIPPED").success).toBe(true);
    expect(orderStatusSchema.safeParse("EXPEDIEE").success).toBe(false);
  });
});
