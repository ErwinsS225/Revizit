"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { signOut, useSession } from "next-auth/react";
import { Heart, LayoutDashboard, LogOut, Package, User, UserRound, type LucideIcon } from "lucide-react";

// components/layout/account-menu.tsx — menu compte conscient de la session (Auth.js).
export function AccountMenu() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Ferme le menu à chaque navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false);
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Pendant le chargement de la session (SSR + 1er rendu client) : icône neutre.
  if (status === "authenticated" && session?.user) {
    const email = session.user.email ?? "";
    const displayName = session.user.name ?? email.split("@")[0] ?? "Client";
    const initials = displayName.slice(0, 2).toUpperCase();
    const isAdmin = session.user.role === "ADMIN";

    return (
      <div ref={containerRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Mon compte"
          aria-haspopup="menu"
          aria-expanded={open}
          title="Mon compte"
          className="flex h-11 w-11 items-center justify-center rounded-md transition-colors hover:bg-accent"
        >
          <span
            aria-hidden="true"
            className="flex h-7 w-7 items-center justify-center rounded-full bg-terracotta text-xs font-bold text-white"
          >
            {initials}
          </span>
        </button>

        {open ? (
          <div
            role="menu"
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border bg-background shadow-lg"
          >
            <div className="border-b bg-muted/40 px-4 py-3">
              <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>

            <ul className="p-1.5">
              <MenuLink href="/account" icon={UserRound}>
                Mon compte
              </MenuLink>
              <MenuLink href="/orders" icon={Package}>
                Mes commandes
              </MenuLink>
              <MenuLink href="/wishlist" icon={Heart}>
                Mes favoris
              </MenuLink>
              {isAdmin ? (
                <MenuLink href="/admin" icon={LayoutDashboard}>
                  Espace admin
                </MenuLink>
              ) : null}
            </ul>

            <div className="border-t p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => void signOut({ callbackUrl: "/" })}
                className="flex min-h-[44px] w-full items-center gap-2.5 rounded-md px-3 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" />
                Se déconnecter
              </button>
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <Link
      href="/login"
      aria-label="Se connecter"
      title="Se connecter"
      className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
    >
      <User className="h-5 w-5" aria-hidden="true" />
    </Link>
  );
}

function MenuLink({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <li>
      <Link
        href={href}
        role="menuitem"
        className="flex min-h-[44px] items-center gap-2.5 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
      >
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        {children}
      </Link>
    </li>
  );
}
