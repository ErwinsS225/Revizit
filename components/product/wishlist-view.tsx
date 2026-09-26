"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useWishlistStore } from "@/store/wishlist-store";

// components/product/wishlist-view.tsx — page favoris (Client).
export function WishlistView() {
  const entries = useWishlistStore((s) => s.entries);
  const remove = useWishlistStore((s) => s.remove);

  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <Heart className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
        <p className="mt-3 font-serif text-2xl">Aucun favori pour l&apos;instant</p>
        <p className="mt-2 text-sm text-muted-foreground">Touche le cœur sur un produit pour le retrouver ici.</p>
        <Button className="mt-6" asChild>
          <Link href="/products">Découvrir le catalogue</Link>
        </Button>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {entries.map((e) => (
        <li key={e.productId} className="overflow-hidden rounded-lg border bg-background">
          <Link href={`/products/${e.slug}`}>
            <div className="relative aspect-square bg-muted">
              {e.image ? <Image src={e.image} alt={e.name} fill sizes="25vw" className="object-cover" /> : null}
            </div>
            <div className="p-3">
              <p className="line-clamp-1 text-sm font-medium">{e.name}</p>
              <p className="mt-1 text-sm font-bold text-terracotta">{formatPrice(e.price)}</p>
            </div>
          </Link>
          <div className="flex gap-2 p-3 pt-0">
            <Button size="sm" variant="outline" className="flex-1" asChild>
              <Link href={`/products/${e.slug}`}>
                <ShoppingBag className="h-3.5 w-3.5" /> Voir
              </Link>
            </Button>
            <Button size="sm" variant="ghost" onClick={() => remove(e.productId)}>
              Retirer
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
