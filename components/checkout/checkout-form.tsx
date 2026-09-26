"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { OrderSummary } from "@/components/checkout/order-summary";
import { PaymentChoice, type Payment } from "@/components/checkout/payment-choice";
import { useCartStore, type CartLine } from "@/store/cart-store";

// components/checkout/checkout-form.tsx — adresse + paiement CI + récap.
export function CheckoutForm() {
  const router = useRouter();
  const lines = useCartStore((s) => s.lines);
  const clear = useCartStore((s) => s.clear);
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState<Payment>("CASH_ON_DELIVERY");

  const itemsTotal = lines.reduce((n, l) => n + l.unitPrice * l.quantity, 0);
  const shipping = itemsTotal >= 50000 || itemsTotal === 0 ? 0 : 2000;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lines.length === 0) return;
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const payload = {
        fullName: String(form.get("fullName") ?? ""),
        street: String(form.get("street") ?? ""),
        city: String(form.get("city") ?? "Abidjan"),
        phone: String(form.get("phone") ?? ""),
        notes: String(form.get("notes") ?? ""),
      };
      const addrRes = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const addrJson = (await addrRes.json()) as { ok: boolean; address?: { id: string }; error?: string };
      if (!addrRes.ok || !addrJson.address) throw new Error(addrJson.error ?? "Adresse invalide");
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          addressId: addrJson.address.id,
          notes: payload.notes || undefined,
          paymentMethod: payment,
          lines: lines.map((l: CartLine) => ({ productId: l.productId, variantId: l.variantId, quantity: l.quantity })),
        }),
      });
      const orderJson = (await orderRes.json()) as { ok: boolean; orderId?: string; error?: string };
      if (!orderRes.ok || !orderJson.orderId) throw new Error(orderJson.error ?? "Commande impossible");
      clear();
      toast.success("Commande confirmée !");
      router.push(`/merci/${orderJson.orderId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur inattendue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <fieldset className="rounded-lg border p-4 sm:p-6">
          <legend className="px-2 font-serif text-lg font-bold sm:text-xl">Adresse de livraison</legend>
          <div className="mt-2 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="co-name" className="text-sm font-medium">Nom complet *</label>
              <input
                id="co-name"
                name="fullName"
                required
                minLength={2}
                maxLength={100}
                autoComplete="name"
                placeholder="Awa Koné"
                className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-street" className="text-sm font-medium">Rue / quartier *</label>
              <input
                id="co-street"
                name="street"
                required
                minLength={3}
                autoComplete="street-address"
                placeholder="Rue des Jardins, Cocody"
                className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div>
              <label htmlFor="co-city" className="text-sm font-medium">Ville *</label>
              <select
                id="co-city"
                name="city"
                defaultValue="Abidjan"
                autoComplete="address-level2"
                className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              >
                {["Abidjan", "Bouaké", "Daloa", "San-Pédro", "Yamoussoukro", "Korhogo", "Autre"].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="co-phone" className="text-sm font-medium">Téléphone *</label>
              <input
                id="co-phone"
                name="phone"
                required
                type="tel"
                autoComplete="tel"
                placeholder="+225 07 00 00 00 00"
                className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="co-notes" className="text-sm font-medium">Instructions de livraison (optionnel)</label>
              <textarea
                id="co-notes"
                name="notes"
                maxLength={500}
                rows={3}
                placeholder="Repère, interphone, tranche horaire souhaitée…"
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>
          </div>
        </fieldset>
        <PaymentChoice payment={payment} setPayment={setPayment} />
      </div>
      <OrderSummary lines={lines} itemsTotal={itemsTotal} shipping={shipping} loading={loading} />
    </form>
  );
}
