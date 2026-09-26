import { create } from "zustand";
import { persist } from "zustand/middleware";

// store/cart-store.ts — panier côté client (Zustand + persist localStorage).
// Clé = productId + variantId. Prix affichés en FCFA (unités entières).
export interface CartLine {
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  image: string;
  size: string | null;
  color: string | null;
  unitPrice: number;
  quantity: number;
  stock: number;
}

interface CartState {
  lines: CartLine[];
  addLine: (line: Omit<CartLine, "quantity">, quantity?: number) => void;
  removeLine: (productId: string, variantId: string | null) => void;
  setQuantity: (productId: string, variantId: string | null, quantity: number) => void;
  clear: () => void;
  count: () => number;
  total: () => number;
}

function sameLine(a: Pick<CartLine, "productId" | "variantId">, b: Pick<CartLine, "productId" | "variantId">): boolean {
  return a.productId === b.productId && (a.variantId ?? null) === (b.variantId ?? null);
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      lines: [],
      addLine: (line, quantity = 1) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line));
          if (existing) {
            const nextQty = Math.min(existing.stock || 99, existing.quantity + quantity);
            return {
              lines: state.lines.map((l) =>
                sameLine(l, line) ? { ...l, quantity: nextQty, unitPrice: line.unitPrice, stock: line.stock } : l,
              ),
            };
          }
          return { lines: [...state.lines, { ...line, quantity: Math.max(1, quantity) }] };
        }),
      removeLine: (productId, variantId) =>
        set((state) => ({
          lines: state.lines.filter((l) => !sameLine(l, { productId, variantId })),
        })),
      setQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          lines: state.lines
            .map((l) =>
              sameLine(l, { productId, variantId })
                ? { ...l, quantity: Math.max(0, Math.min(l.stock || 99, quantity)) }
                : l,
            )
            .filter((l) => l.quantity > 0),
        })),
      clear: () => set({ lines: [] }),
      count: () => get().lines.reduce((n, l) => n + l.quantity, 0),
      total: () => get().lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0),
    }),
    {
      name: "boutique-cart-v1",
      // skipHydration : la lecture de localStorage est différée après le montage
      // (cf. components/layout/store-hydration.tsx). Sans cela le 1er rendu client
      // connaît le panier alors que le HTML serveur a été rendu avec un panier vide
      // → erreurs d'hydratation React #418/#423 (pastille, page panier, checkout).
      skipHydration: true,
    },
  ),
);
