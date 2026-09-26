"use client";

import Image from "next/image";
import Link from "next/link";
import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { DURATION, EASE } from "@/components/motion/motion-tokens";
import { WishlistButton } from "@/components/product/wishlist-button";
import { formatPrice } from "@/lib/utils";
import type { CatalogProduct } from "@/lib/catalog";
import { cn } from "@/lib/utils";

// components/product/product-card.tsx — carte produit responsive avec bouton favori.
export function ProductCard({ product }: { product: CatalogProduct }) {
  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round((1 - product.price / product.compareAtPrice) * 100)
      : 0;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: DURATION.fast, ease: EASE }}
      className="group relative h-full overflow-hidden rounded-lg border bg-background transition-shadow hover:shadow-lg"
    >
      {/* Bouton favori tactile en haut à droite */}
      <div className="absolute right-2 top-2 z-10">
        <WishlistButton
          productId={product.id}
          slug={product.slug}
          name={product.name}
          image={product.images[0] ?? ""}
          price={product.price}
        />
      </div>

      <Link href={`/products/${product.slug}`} aria-label={`Voir ${product.name}`} className="block h-full">
        <div className="relative aspect-[3/4] bg-muted">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-muted-foreground">
              Sans image
            </div>
          )}
          {discount > 0 ? (
            <span className="absolute left-2 top-2 rounded-full bg-terracotta px-2 py-0.5 text-xs font-bold text-white shadow-sm">
              −{discount} %
            </span>
          ) : null}
        </div>
        <div className="p-3 sm:p-4">
          {product.brand ? (
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{product.brand}</p>
          ) : null}
          <p className="mt-0.5 line-clamp-1 text-sm font-medium">{product.name}</p>
          <div className="mt-1 flex items-baseline gap-2">
            <p className="text-sm font-bold text-terracotta sm:text-base">{formatPrice(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-xs text-muted-foreground line-through">{formatPrice(product.compareAtPrice)}</p>
            ) : null}
          </div>
          {product.avgRating !== null ? (
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Star className={cn("h-3 w-3 fill-amber-400 text-amber-400")} aria-hidden="true" />
              <span>
                {product.avgRating.toFixed(1)} ({product.reviewCount})
              </span>
            </p>
          ) : null}
        </div>
      </Link>
    </motion.div>
  );
}

