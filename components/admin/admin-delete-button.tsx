"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

// components/admin/admin-delete-button.tsx — bouton de suppression générique
// (produits, catégories…) : confirmation native puis DELETE sur l'API.
interface AdminDeleteButtonProps {
  /** Endpoint API, ex: /api/products/abc123 */
  href: string;
  /** Libellé de confirmation (français). */
  confirmMessage: string;
  /** Libellé accessible du bouton. */
  label?: string;
}

export function AdminDeleteButton({
  href,
  confirmMessage,
  label = "Supprimer",
}: AdminDeleteButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleDelete() {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      const res = await fetch(href, { method: "DELETE" });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Suppression impossible");
        return;
      }
      toast.success("Supprimé avec succès");
      router.refresh();
    } catch {
      toast.error("Erreur réseau, réessaie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={busy}
      aria-label={`${label} : ${confirmMessage.split("?")[0]}`}
      className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>
  );
}
