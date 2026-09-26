"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useWishlistStore } from "@/store/wishlist-store";

// components/layout/wishlist-badge.tsx — pastille favoris (pop spring à chaque modif).
export function WishlistBadge() {
  const count = useWishlistStore((s) => s.entries.length);

  return (
    <Link
      href="/wishlist"
      aria-label={count > 0 ? `Mes favoris, ${count} article${count > 1 ? "s" : ""}` : "Mes favoris (vide)"}
      title="Mes favoris"
      className="relative rounded-md p-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <Heart className="h-4 w-4" aria-hidden="true" />
      {count > 0 ? (
        <motion.span
          key={count}
          aria-hidden="true"
          initial={{ scale: 0.4 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-[11px] font-bold text-white"
        >
          {count > 99 ? "99+" : count}
        </motion.span>
      ) : null}
    </Link>
  );
}

