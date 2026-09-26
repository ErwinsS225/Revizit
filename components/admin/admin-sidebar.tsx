"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Package, Receipt, Store, Users } from "lucide-react";
import { cn } from "@/lib/utils";

// components/admin/admin-sidebar.tsx — navigation de l'espace admin.
// Client Component uniquement pour l'état actif (usePathname).
const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/admin/products", label: "Produits", icon: Package },
  { href: "/admin/categories", label: "Catégories", icon: FolderTree },
  { href: "/admin/orders", label: "Commandes", icon: Receipt },
  { href: "/admin/users", label: "Utilisateurs", icon: Users },
] as const;

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Navigation administration" className="lg:sticky lg:top-24 lg:self-start">
      <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-6 hidden border-t pt-4 lg:block">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Store className="h-4 w-4" aria-hidden="true" />
          Voir la boutique
        </Link>
      </div>
    </nav>
  );
}
