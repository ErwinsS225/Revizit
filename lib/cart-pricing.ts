// lib/cart-pricing.ts — logique PURE (sans DB) : calcul des totaux en centimes.
// Testée unitairement. Le total fait foi côté serveur avant Stripe.

import type { CartLineInput } from "@/types";

/** Total d'une ligne : unitPrice (centimes) × quantity. */
export function calcLineTotal(line: Pick<CartLineInput, "unitPrice" | "quantity">): number {
  if (!Number.isInteger(line.unitPrice) || line.unitPrice < 0) {
    throw new Error("unitPrice doit être un entier positif (centimes)");
  }
  if (!Number.isInteger(line.quantity) || line.quantity < 1) {
    throw new Error("quantity doit être un entier >= 1");
  }
  return line.unitPrice * line.quantity;
}

/** Total du panier = somme des lignes. Retourne 0 pour un panier vide. */
export function calcCartTotal(lines: Pick<CartLineInput, "unitPrice" | "quantity">[]): number {
  return lines.reduce((sum, line) => sum + calcLineTotal(line), 0);
}

/** Vérifie le stock disponible pour chaque ligne (serveur). */
export function assertStockAvailable(
  lines: { productId: string; quantity: number; stock: number; name: string }[],
): void {
  for (const line of lines) {
    if (line.quantity > line.stock) {
      throw new Error(`Stock insuffisant pour « ${line.name} » (demandé ${line.quantity}, dispo ${line.stock})`);
    }
  }
}

/** Parse un champ JSON SQLite (images, tags) en tableau de strings. */
export function parseJsonStringArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

/** Sérialise un tableau de strings pour SQLite. */
export function stringifyStringArray(values: string[]): string {
  return JSON.stringify(values);
}
