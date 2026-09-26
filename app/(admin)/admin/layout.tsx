import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ShieldCheck } from "lucide-react";
import { requireAdmin } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const metadata: Metadata = {
  title: {
    default: "Administration",
    template: "%s · Administration",
  },
  // Espace privé : jamais indexé par les moteurs de recherche.
  robots: { index: false, follow: false },
};

// app/(admin)/admin/layout.tsx — coquille de l'espace admin : vérifie le rôle
// ADMIN (défense en profondeur derrière le middleware) et affiche la sidebar.
export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdmin();

  return (
    <div className="container-shop py-8 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3 border-b pb-5">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-terracotta">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            Espace administrateur
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Gestion de la boutique : catalogue, commandes, clients.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <AdminSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
