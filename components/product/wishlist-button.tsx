"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/store/wishlist-store";

// components/product/wishlist-button.tsx — toggle favori accessible tactilement (44x44).
export function WishlistButton({
  productId,
  slug,
  name,
  image,
  price,
}: {
  productId: string;
  slug: string;
  name: string;
  image: string;
  price: number;
}) {
  const hasFn = useWishlistStore((s) => s.has);
  const toggle = useWishlistStore((s) => s.toggle);
  const active = hasFn(productId);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `Retirer ${name} des favoris` : `Ajouter ${name} aux favoris`}
      title={active ? "Retirer des favoris" : "Ajouter aux favoris"}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle({ productId, slug, name, image, price });
        toast.success(active ? "Retiré des favoris" : "Ajouté aux favoris", { description: name });
      }}
      className={`flex h-10 w-10 items-center justify-center rounded-full border bg-background/85 backdrop-blur shadow-sm transition hover:scale-105 active:scale-95 ${active ? "border-terracotta bg-terracotta/15 text-terracotta" : "text-foreground hover:bg-background"}`}
    >
      <Heart className={`h-4 w-4 ${active ? "fill-terracotta" : ""}`} aria-hidden="true" />
    </button>
  );
}

