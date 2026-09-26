import { describe, expect, it } from "vitest";
import { calcCartTotal } from "@/lib/cart-pricing";

// Logique de fusion des lignes panier (miroir du store, testée sans DOM).
interface Line {
  productId: string;
  variantId: string | null;
  quantity: number;
  stock: number;
}

function mergeLine(lines: Line[], incoming: Line): Line[] {
  const existing = lines.find(
    (l) => l.productId === incoming.productId && (l.variantId ?? null) === (incoming.variantId ?? null),
  );
  if (!existing) return [...lines, { ...incoming }];
  return lines.map((l) =>
    l === existing
      ? { ...l, quantity: Math.min(l.stock || 99, l.quantity + incoming.quantity) }
      : l,
  );
}

describe("panier (fusion des lignes)", () => {
  it("ajoute une nouvelle ligne", () => {
    const lines = mergeLine([], { productId: "p1", variantId: "v1", quantity: 2, stock: 8 });
    expect(lines).toHaveLength(1);
    expect(lines[0]?.quantity).toBe(2);
  });

  it("cumule la même variante sans dépasser le stock", () => {
    const base: Line[] = [{ productId: "p1", variantId: "v1", quantity: 6, stock: 8 }];
    const merged = mergeLine(base, { productId: "p1", variantId: "v1", quantity: 5, stock: 8 });
    expect(merged[0]?.quantity).toBe(8);
  });

  it("variantes différentes = lignes séparées", () => {
    const base: Line[] = [{ productId: "p1", variantId: "v1", quantity: 1, stock: 8 }];
    const merged = mergeLine(base, { productId: "p1", variantId: "v2", quantity: 1, stock: 8 });
    expect(merged).toHaveLength(2);
  });
});

describe("total panier FCFA", () => {
  it("somme en unités entières (pas de centimes)", () => {
    expect(
      calcCartTotal([
        { unitPrice: 52500, quantity: 1 },
        { unitPrice: 15000, quantity: 2 },
      ]),
    ).toBe(82500);
  });
});
