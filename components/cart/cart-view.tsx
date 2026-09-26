"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { slideFromRight } from "@/components/motion/motion-tokens";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

// components/cart/cart-view.tsx — page panier (Client) : lignes, quantités, total FCFA.
export function CartView() {
  const lines = useCartStore((s) => s.lines);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeLine = useCartStore((s) => s.removeLine);
  const clear = useCartStore((s) => s.clear);
  const total = useCartStore((s) => s.total());

  if (lines.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center sm:p-12">
        <p className="font-serif text-xl sm:text-2xl">Ton panier est vide</p>
        <p className="mt-2 text-sm text-muted-foreground">Découvre nos collections et trouve ta pièce.</p>
        <Link href="/products" className={cn(buttonVariants({ variant: "terracotta" }), "mt-6 h-11 px-6")}>
          Voir le catalogue <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
      <motion.ul layout className="space-y-3 sm:space-y-4">
        <AnimatePresence initial={false}>
          {lines.map((l) => (
            <motion.li
              layout
              key={`${l.productId}-${l.variantId ?? "base"}`}
              variants={slideFromRight}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex gap-3 rounded-lg border bg-background p-3 sm:gap-4 sm:p-4"
            >
              <Link href={`/products/${l.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-muted sm:h-28 sm:w-24">
                {l.image ? (
                  <Image src={l.image} alt={l.name} fill sizes="(max-width: 640px) 80px, 96px" className="object-cover" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 pr-1">
                    <Link href={`/products/${l.slug}`} className="line-clamp-2 text-sm font-medium hover:underline sm:line-clamp-1">
                      {l.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      Taille {l.size ?? "—"}
                      {l.color ? ` · ${l.color}` : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`Retirer ${l.name} du panier`}
                    onClick={() => removeLine(l.productId, l.variantId)}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-destructive active:scale-95 sm:h-8 sm:w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  {/* Contrôleur quantité tactile optimisé */}
                  <div className="flex items-center rounded-md border bg-background">
                    <button
                      type="button"
                      aria-label="Diminuer la quantité"
                      onClick={() => setQuantity(l.productId, l.variantId, l.quantity - 1)}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span aria-live="polite" className="w-8 text-center text-sm font-semibold">
                      {l.quantity}
                    </span>
                    <button
                      type="button"
                      aria-label="Augmenter la quantité"
                      onClick={() => setQuantity(l.productId, l.variantId, l.quantity + 1)}
                      className="flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <p className="text-sm font-bold text-foreground sm:text-base">{formatPrice(l.unitPrice * l.quantity)}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      <motion.aside
        aria-label="Résumé"
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="h-fit rounded-lg border p-5 sm:p-6"
      >
        <h2 className="font-serif text-xl">Résumé</h2>
        <dl className="mt-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Sous-total</dt>
            <dd className="font-semibold">{formatPrice(total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Livraison Abidjan</dt>
            <dd className="font-semibold">{total >= 50000 ? "Offerte" : formatPrice(2000)}</dd>
          </div>
          <div className="flex justify-between border-t pt-3 text-base">
            <dt className="font-semibold">Total</dt>
            <dd className="font-bold text-terracotta">{formatPrice(total >= 50000 ? total : total + 2000)}</dd>
          </div>
        </dl>
        <Button className="mt-5 h-12 w-full text-base font-medium" asChild>
          <Link href="/checkout">Passer commande</Link>
        </Button>
        <button
          type="button"
          onClick={clear}
          className="mt-3 flex min-h-[40px] w-full items-center justify-center text-center text-xs text-muted-foreground transition-colors hover:text-destructive"
        >
          Vider le panier
        </button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          Paiement à la livraison — espèces ou Mobile Money.
        </p>
      </motion.aside>
    </div>
  );
}
