"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, MessageCircle, Search, X } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AccountMenu } from "@/components/layout/account-menu";
import { CartBadge } from "@/components/layout/cart-badge";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { WishlistBadge } from "@/components/layout/wishlist-badge";
import { DURATION, EASE } from "@/components/motion/motion-tokens";
import { BRAND } from "@/lib/brand";
import { ACCOUNT_NAV_LINKS, MAIN_NAV_LINKS, isActivePath } from "@/lib/navigation";
import { cn } from "@/lib/utils";

// components/layout/navbar.tsx — barre de navigation responsive avec drawer mobile animé.
export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Bandeau promo */}
      <div className="bg-ink text-center text-xs text-ivory">
        <p className="px-3 py-1.5 leading-snug">
          <span className="text-gold">Mode africaine exclusive</span> · Gravure{" "}
          <span className="text-gold">gratuite</span> dès 4 coupes · Livraison offerte dès 50 000 FCFA à
          Abidjan
        </p>
      </div>

      <div className="container-shop flex h-16 items-center justify-between gap-2 sm:gap-4">
        {/* Burger mobile : 44x44 minimum */}
        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent md:hidden"
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          aria-controls="mobile-nav-panel"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Logo */}
        <Link
          href="/"
          className="font-serif text-xl font-bold tracking-[0.14em] sm:text-2xl"
          aria-label="Accueil Revizit"
        >
          REVIZIT<span className="text-gold">.</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-6 md:flex" aria-label="Navigation principale">
          {MAIN_NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href as never}
              aria-current={isActivePath(pathname, String(link.href)) ? "page" : undefined}
              className={cn(
                "text-sm transition-colors hover:text-terracotta",
                isActivePath(pathname, String(link.href)) ? "font-semibold text-foreground" : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions : touch target 44px min */}
        <div className="flex items-center gap-0.5 sm:gap-1">
          <a
            href={BRAND.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Commander sur WhatsApp"
            title="Commander sur WhatsApp"
            className="hidden h-11 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-ivory transition-colors hover:bg-gold hover:text-ink lg:flex"
          >
            <MessageCircle className="h-5 w-5" />
            WhatsApp
          </a>
          <Link
            href="/products"
            aria-label="Rechercher"
            title="Rechercher"
            className="flex h-11 w-11 items-center justify-center rounded-md text-foreground transition-colors hover:bg-accent"
          >
            <Search className="h-5 w-5" />
          </Link>
          <WishlistBadge />
          <AccountMenu />
          <CartBadge />
          <ThemeToggle />
        </div>
      </div>

      {/* Menu mobile accordéon animé */}
      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-nav-panel"
            aria-label="Navigation mobile"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE }}
            className="overflow-hidden border-t bg-background px-4 py-3 md:hidden shadow-lg"
          >
            <ul className="flex flex-col gap-1">
              {MAIN_NAV_LINKS.map((link) => {
                const active = isActivePath(pathname, String(link.href));
                return (
                  <li key={link.label}>
                    <Link
                      href={link.href as never}
                      onClick={() => setOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex min-h-[44px] items-center rounded-md px-3 text-base transition-colors",
                        active
                          ? "bg-terracotta/10 font-semibold text-terracotta"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Espace client : panier, compte, commandes */}
            <div className="mt-3 border-t pt-3">
              <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Mon espace
              </p>
              <ul className="flex flex-col gap-1">
                {ACCOUNT_NAV_LINKS.map((link) => {
                  const active = isActivePath(pathname, String(link.href));
                  return (
                    <li key={link.label}>
                      <Link
                        href={link.href as never}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex min-h-[44px] items-center rounded-md px-3 text-base transition-colors",
                          active
                            ? "bg-terracotta/10 font-semibold text-terracotta"
                            : "text-foreground hover:bg-muted",
                        )}
                      >
                        {link.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

