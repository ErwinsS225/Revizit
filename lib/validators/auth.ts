import { z } from "zod";

// lib/validators/auth.ts — schémas Auth (serveur + client via react-hook-form).
// NOTE sur l'ordre des règles Zod : `.email()` est évalué AVANT `.trim()` dans cette
// version. Un email saisi avec des espaces (« awa@x.ci ») était donc rejeté avant
// d'être nettoyé. On applique d'abord `z.string().trim()` puis les règles de format.
const email = () =>
  z
    .string()
    .trim()
    .toLowerCase()
    .min(1, "Email requis")
    .email("Email invalide");

export const registerSchema = z.object({
  name: z.string().min(2, "Nom trop court").max(60),
  email: email(),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "1 majuscule requise")
    .regex(/[0-9]/, "1 chiffre requis"),
});

export const loginSchema = z.object({
  email: email(),
  password: z.string().min(1, "Mot de passe requis"),
});

/** Étape 1 : demander un lien de réinitialisation. */
export const forgotPasswordSchema = z.object({
  email: email(),
});

/**
 * Étape 2 : choisir un nouveau mot de passe.
 * Mêmes règles que registerSchema : un mot de passe réinitialisé ne doit
 * pas pouvoir être plus faible que celui créé à l'inscription.
 */
export const resetPasswordSchema = z.object({
  token: z.string().min(20, "Jeton invalide"),
  password: z
    .string()
    .min(8, "8 caractères minimum")
    .regex(/[A-Z]/, "1 majuscule requise")
    .regex(/[0-9]/, "1 chiffre requis"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
