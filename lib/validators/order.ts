import { z } from "zod";

// lib/validators/order.ts — adresse + checkout + statut commande (Côte d'Ivoire).
export const addressSchema = z.object({
  fullName: z.string().min(2, "Nom complet requis").max(100),
  street: z.string().min(3, "Rue / quartier requis").max(200),
  city: z.string().min(2, "Ville requise").max(100),
  postalCode: z.string().regex(/^[0-9A-Za-z\- ]{3,12}$/, "Code postal invalide").default("00225"),
  country: z.string().min(2).max(60).default("Côte d'Ivoire"),
  phone: z
    .string()
    .regex(/^\+?[0-9\s\-()]{8,20}$/, "Numéro invalide (ex : +225 07 00 00 00 00)")
    .min(8, "Numéro requis pour la livraison"),
  isDefault: z.boolean().default(false),
});

export const checkoutLineSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1).optional().nullable(),
  quantity: z.number().int().min(1).max(99),
});

export const checkoutSchema = z.object({
  addressId: z.string().min(1, "Adresse requise"),
  notes: z.string().max(500).optional().nullable(),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "MOBILE_MONEY"]),
  lines: z.array(checkoutLineSchema).min(1, "Panier vide"),
});

export const orderStatusSchema = z.enum(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"]);

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;

