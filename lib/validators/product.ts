import { z } from "zod";

// lib/validators/product.ts — schémas Produit / Catégorie / Avis.
export const genderSchema = z.enum(["MEN", "WOMEN", "UNISEX"]);

export const productSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(120),
  slug: z
    .string()
    .min(2)
    .max(140)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide (ex: robe-ete-lin)"),
  description: z.string().min(10, "Description trop courte").max(5000),
  price: z.number().int("Prix entier requis (FCFA, sans décimales)").min(0, "Prix positif requis"),
  compareAtPrice: z.number().int().min(0).optional().nullable(),
  images: z.array(z.string().url("URL image invalide")).min(1, "1 image minimum").max(8),
  categoryId: z.string().min(1).optional().nullable(),
  brand: z.string().max(60).optional().nullable(),
  stock: z.number().int().min(0).default(0),
  sku: z.string().max(40).optional().nullable(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  tags: z.array(z.string().max(30)).max(10).default([]),
  gender: genderSchema.default("UNISEX"),
});

export const variantSchema = z.object({
  size: z.string().min(1, "Taille requise").max(10),
  color: z.string().max(30).optional().nullable(),
  stock: z.number().int().min(0),
  priceModifier: z.number().int().default(0),
});

export const categorySchema = z.object({
  name: z.string().min(2).max(80),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug invalide"),
  description: z.string().max(500).optional().nullable(),
  image: z.string().url().optional().nullable(),
  parentId: z.string().optional().nullable(),
});

export const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1, "Note 1-5").max(5, "Note 1-5"),
  comment: z.string().max(1000).optional().nullable(),
});

export type ProductInput = z.infer<typeof productSchema>;
export type VariantInput = z.infer<typeof variantSchema>;
