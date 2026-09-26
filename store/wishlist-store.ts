import { create } from "zustand";
import { persist } from "zustand/middleware";

// store/wishlist-store.ts — favoris côté client (Zustand + persist localStorage).
export interface WishlistEntry {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
}

interface WishlistState {
  entries: WishlistEntry[];
  toggle: (entry: WishlistEntry) => void;
  remove: (productId: string) => void;
  has: (productId: string) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      entries: [],
      toggle: (entry) =>
        set((state) =>
          state.entries.some((e) => e.productId === entry.productId)
            ? { entries: state.entries.filter((e) => e.productId !== entry.productId) }
            : { entries: [...state.entries, entry] },
        ),
      remove: (productId) =>
        set((state) => ({ entries: state.entries.filter((e) => e.productId !== productId) })),
      has: (productId) => get().entries.some((e) => e.productId === productId),
      clear: () => set({ entries: [] }),
    }),
    {
      name: "boutique-wishlist-v1",
      // skipHydration : lecture de localStorage différée après montage
      // (cf. components/layout/store-hydration.tsx) pour éviter tout mismatch SSR/client.
      skipHydration: true,
    },
  ),
);
