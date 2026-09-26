"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";

// components/layout/store-hydration.tsx — recharge les stores persistés (panier, favoris)
// APRÈS le montage. Les stores sont en `skipHydration: true` : le HTML serveur et le
// premier rendu client utilisent donc l'état vide (aucun mismatch React #418/#423),
// puis la réhydratation depuis localStorage déclenche un simple re-rendu côté client.
export function StoreHydration() {
  useEffect(() => {
    void useCartStore.persist.rehydrate();
    void useWishlistStore.persist.rehydrate();
  }, []);

  return null;
}
