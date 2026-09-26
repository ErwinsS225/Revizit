"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { useCartStore } from "@/store/cart-store";

// components/layout/cart-badge.tsx — pastille quantité panier (pop à chaque ajout).
export function CartBadge() {
  const count = useCartStore((s) => s.count());

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Mon panier, ${count} article${count > 1 ? "s" : ""}` : "Mon panier (vide)"}
      title="Mon panier"
      className="relative rounded-md p-2.5 transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      <ShoppingBag className="h-4 w-4" aria-hidden="true" />
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

