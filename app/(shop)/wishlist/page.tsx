import type { Metadata } from "next";
import { WishlistView } from "@/components/product/wishlist-view";

export const metadata: Metadata = { title: "Mes favoris" };

// app/(shop)/wishlist/page.tsx — page favoris.
export default function WishlistPage() {
  return (
    <div className="container-shop py-10">
      <h1 className="font-serif text-4xl">Mes favoris</h1>
      <div className="mt-6">
        <WishlistView />
      </div>
    </div>
  );
}
