import { describe, expect, it } from "vitest";
import {
  assertStockAvailable,
  calcCartTotal,
  calcLineTotal,
  parseJsonStringArray,
  stringifyStringArray,
} from "@/lib/cart-pricing";

describe("calcLineTotal", () => {
  it("multiplie prix unitaire × quantité", () => {
    expect(calcLineTotal({ unitPrice: 4990, quantity: 2 })).toBe(9980);
  });
  it("rejette un prix négatif ou non entier", () => {
    expect(() => calcLineTotal({ unitPrice: -100, quantity: 1 })).toThrow();
    expect(() => calcLineTotal({ unitPrice: 49.9, quantity: 1 })).toThrow();
  });
  it("rejette une quantité < 1", () => {
    expect(() => calcLineTotal({ unitPrice: 100, quantity: 0 })).toThrow();
  });
});

describe("calcCartTotal", () => {
  it("retourne 0 pour un panier vide", () => {
    expect(calcCartTotal([])).toBe(0);
  });
  it("somme plusieurs lignes", () => {
    expect(
      calcCartTotal([
        { unitPrice: 4990, quantity: 1 },
        { unitPrice: 2990, quantity: 3 },
      ]),
    ).toBe(4990 + 8970);
  });
});

describe("assertStockAvailable", () => {
  it("ne lève pas quand le stock suffit", () => {
    expect(() =>
      assertStockAvailable([{ productId: "p1", quantity: 2, stock: 5, name: "Robe" }]),
    ).not.toThrow();
  });
  it("lève une erreur claire quand le stock est insuffisant", () => {
    expect(() =>
      assertStockAvailable([{ productId: "p1", quantity: 6, stock: 5, name: "Robe" }]),
    ).toThrow(/Stock insuffisant/);
  });
});

describe("JSON SQLite (images/tags)", () => {
  it("round-trip stringify → parse", () => {
    const arr = ["https://a.img", "https://b.img"];
    expect(parseJsonStringArray(stringifyStringArray(arr))).toEqual(arr);
  });
  it("parse tolérant (null / invalide → [])", () => {
    expect(parseJsonStringArray(null)).toEqual([]);
    expect(parseJsonStringArray("pas-du-json")).toEqual([]);
  });
});
