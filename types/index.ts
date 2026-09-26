// types/index.ts — types partagés (anglais pour le code, français côté UI).
// SQLite n'a pas d'enum natif : rôles/genres/statuts = unions String validées par zod.

export const ROLES = ["CUSTOMER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const GENDERS = ["MEN", "WOMEN", "UNISEX"] as const;
export type Gender = (typeof GENDERS)[number];

export const ORDER_STATUSES = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export interface CartLineInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  /** Prix unitaire snapshot en centimes (vérifié serveur). */
  unitPrice: number;
}

/** Ligne de panier résolue côté serveur avant création de la session Stripe. */
export interface ResolvedCartLine extends CartLineInput {
  name: string;
  stock: number;
}

export interface SessionUser {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  role: Role;
}
