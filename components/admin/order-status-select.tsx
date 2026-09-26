"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ORDER_STATUSES, type OrderStatus } from "@/types";

// components/admin/order-status-select.tsx — changement de statut (admin).
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

interface OrderStatusSelectProps {
  orderId: string;
  status: OrderStatus;
}

export function OrderStatusSelect({ orderId, status }: OrderStatusSelectProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleChange(next: string) {
    if (next === status) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Mise à jour impossible");
        return;
      }
      toast.success(`Statut mis à jour : ${STATUS_LABELS[next as OrderStatus]}`);
      router.refresh();
    } catch {
      toast.error("Erreur réseau, réessaie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => void handleChange(event.target.value)}
        disabled={busy}
        aria-label="Statut de la commande"
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-terracotta disabled:opacity-60"
      >
        {ORDER_STATUSES.map((value) => (
          <option key={value} value={value}>
            {STATUS_LABELS[value]}
          </option>
        ))}
      </select>
      {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
    </div>
  );
}
