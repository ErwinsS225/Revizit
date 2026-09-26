"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROLES, type Role } from "@/types";

// components/admin/user-role-select.tsx — changement de rôle (admin).
const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Client",
  ADMIN: "Admin",
};

interface UserRoleSelectProps {
  userId: string;
  role: Role;
}

export function UserRoleSelect({ userId, role }: UserRoleSelectProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleChange(next: string) {
    if (next === role) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: next }),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Mise à jour impossible");
        return;
      }
      toast.success(`Rôle mis à jour : ${ROLE_LABELS[next as Role]}`);
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
        value={role}
        onChange={(event) => void handleChange(event.target.value)}
        disabled={busy}
        aria-label="Rôle de l'utilisateur"
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta disabled:opacity-60"
      >
        {ROLES.map((value) => (
          <option key={value} value={value}>
            {ROLE_LABELS[value]}
          </option>
        ))}
      </select>
      {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" /> : null}
    </div>
  );
}