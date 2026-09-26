import type { Metadata } from "next";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = { title: "Panier" };

// app/(shop)/cart/page.tsx — page panier.
export default function CartPage() {
  return (
    <div className="container-shop py-6 sm:py-10">
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl">Mon panier</h1>
      <div className="mt-4 sm:mt-6">
        <CartView />
      </div>
    </div>
  );
}

