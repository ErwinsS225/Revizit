"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// components/account/order-cancel-button.tsx — annulation d'une commande non expédiée.
export function OrderCancelButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleCancel() {
    if (!confirm("Voulez-vous vraiment annuler cette commande ?")) return;
    setIsPending(true);

    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) throw new Error(data.error ?? "Annulation impossible");

      toast.success("Commande annulée");
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={handleCancel}
      disabled={isPending}
      variant="outline"
      size="sm"
      className="h-11 gap-2 px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
    >
      {isPending ? <Loader2 className="animate-spin" /> : <XCircle />}
      Annuler la commande
    </Button>
  );
}
