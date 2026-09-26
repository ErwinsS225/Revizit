"use client";

import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import type { CartLine } from "@/store/cart-store";

// components/checkout/order-summary.tsx — récapitulatif commande.
export function OrderSummary({ lines, itemsTotal, shipping, loading }: { lines: CartLine[]; itemsTotal: number; shipping: number; loading: boolean }) {
  return (
    <aside aria-label="Récapitulatif" className="h-fit rounded-lg border p-5 sm:p-6">
      <h2 className="font-serif text-xl">Récapitulatif</h2>
      <ul className="mt-3 space-y-2.5 text-sm">
        {lines.map((l) => (
          <li key={`${l.productId}-${l.variantId ?? "base"}`} className="flex justify-between gap-2">
            <span className="min-w-0 text-muted-foreground">
              {l.name} <span className="text-foreground/80 font-medium">× {l.quantity}</span>
            </span>
            <span className="font-medium whitespace-nowrap">{formatPrice(l.unitPrice * l.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-2 border-t pt-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-muted-foreground">Livraison</dt>
          <dd className="font-semibold">{shipping === 0 ? "Offerte" : formatPrice(shipping)}</dd>
        </div>
        <div className="flex justify-between border-t pt-2 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-bold text-terracotta">{formatPrice(itemsTotal + shipping)}</dd>
        </div>
      </dl>
      <Button
        type="submit"
        disabled={loading || lines.length === 0}
        className="mt-5 h-12 w-full text-base font-medium"
      >
        {loading ? "Commande en cours…" : "Confirmer la commande"}
      </Button>
    </aside>
  );
}
