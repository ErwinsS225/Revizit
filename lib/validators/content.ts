import { z } from "zod";
import { CONTENT_KEYS } from "@/lib/content";

// lib/validators/content.ts — validation des blocs éditoriaux (admin).
const keyEnum = z.enum(CONTENT_KEYS, {
  errorMap: () => ({ message: "Section inconnue" }),
});

/** URL d'image : http(s) uniquement (protège d'un `javascript:` injecté). */
const imageUrl = z
  .string()
  .trim()
  .max(2000)
  .refine((v) => v === "" || /^https?:\/\/.+/.test(v), {
    message: "L'image doit être une URL http(s)",
  });

/**
 * Cible du CTA : chemin interne uniquement (`/products?...`).
 * On refuse les URL externes pour éviter un lien de sortie déguisé.
 */
const ctaHref = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || v.startsWith("/"), {
    message: "Le lien doit être interne (ex. /products)",
  });

export const contentBlockSchema = z.object({
  key: keyEnum,
  title: z.string().trim().min(1, "Titre requis").max(200),
  eyebrow: z.string().trim().max(120).nullable().optional(),
  subtitle: z.string().trim().max(1000).nullable().optional(),
  ctaLabel: z.string().trim().max(80).nullable().optional(),
  ctaHref,
  image: imageUrl.nullable().optional(),
  imageAlt: z.string().trim().max(300).nullable().optional(),
  isActive: z.boolean().optional(),
});

export type ContentBlockInput = z.infer<typeof contentBlockSchema>;