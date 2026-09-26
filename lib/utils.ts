import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Fusionne les classes Tailwind (clsx + tailwind-merge). */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Devise de la boutique : Franc CFA (Côte d'Ivoire). XOF n'a pas de décimales. */
export const SHOP_CURRENCY = "XOF";
export const SHOP_LOCALE = "fr-CI";

/**
 * Formate un montant en FCFA (ex: 39000 -> "39 000 F CFA").
 * Les prix sont stockés en unités entières (pas de centimes : le FCFA n'a pas de décimales).
 */
export function formatPrice(
  amount: number,
  currency = SHOP_CURRENCY,
  locale = SHOP_LOCALE,
): string {
  if (currency === "XOF") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }
  return new Intl.NumberFormat(locale, { style: "currency", currency }).format(amount / 100);
}

/** Construit un slug URL-safe. */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
