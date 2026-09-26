import { z } from "zod";

// lib/validators/auth.ts — schémas Auth (serveur + client via react-hook-form).
export const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(60),
  email: z.string().email("Email invalide").toLowerCase().trim(),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "1 majuscule requise")
    .regex(/[0-9]/, "1 chiffre requis"),
});

export const loginSchema = z.object({
  email: z.string().email("Email invalide").toLowerCase().trim(),
  password: z.string().min(1, "Mot de passe requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
