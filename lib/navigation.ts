import type { Route } from "next";

// lib/navigation.ts — configuration de navigation PURE (testable sans DOM).
// Libellés en français, chemins centralisés pour Navbar + Footer.

export interface NavLink {
  href: Route<string> | string;
  label: string;
}

export const MAIN_NAV_LINKS: NavLink[] = [
  { href: "/", label: "Accueil" },
  { href: "/products", label: "Collection" },
  { href: "/products?gender=MEN", label: "Hommes" },
  { href: "/products?gender=WOMEN", label: "Femmes" },
  { href: "/products?category=verrerie", label: "Verrerie" },
];

export const ACCOUNT_NAV_LINKS: NavLink[] = [
  { href: "/cart", label: "Panier" },
  { href: "/account", label: "Mon compte" },
  { href: "/orders", label: "Mes commandes" },
];

export const FOOTER_SHOP_LINKS: NavLink[] = [
  { href: "/products", label: "Toute la collection" },
  { href: "/products?gender=MEN", label: "Mode homme" },
  { href: "/products?gender=WOMEN", label: "Mode femme" },
  { href: "/products?category=verrerie", label: "Verrerie gravée" },
  { href: "/products?q=wax", label: "Wax & Bogolan" },
  { href: "/cart", label: "Panier" },
];

export const FOOTER_HELP_LINKS: NavLink[] = [
  { href: "/a-propos", label: "À propos" },
  { href: "/contact", label: "Contact & WhatsApp" },
  { href: "/faq", label: "FAQ" },
  { href: "/livraison", label: "Livraison & retours" },
  { href: "/cgv", label: "CGV" },
  { href: "/confidentialite", label: "Confidentialité" },
];

/** True si le lien correspond à la page courante (racine exacte, sinon préfixe). */
export function isActivePath(currentPath: string, href: string): boolean {
  const baseHref = href.split("?")[0] ?? href;
  if (baseHref === "/") return currentPath === "/";
  return currentPath === baseHref || currentPath.startsWith(`${baseHref}/`);
}
