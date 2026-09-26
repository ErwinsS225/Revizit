// lib/password-reset.ts — réinitialisation de mot de passe par email.
//Flux : /forgot-password (demande) → email avec lien → /reset-password?token=… (nouveau mot de passe)
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";

/** Durée de validité d'un lien de réinitialisation : 1 heure. */
export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

/** Résout l'URL publique de l'application (lien du mail). */
function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.AUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

/** Hash SHA-256 : seule cette valeur est stockée, jamais le token brut. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export interface CreateResetResult {
  /** Lien à envoyer par email. */
  link: string;
  /** Expiration du lien (ISO) — utile pour les tests et le debug. */
  expiresAt: Date;
}

/**
 * Crée un jeton de réinitialisation et invalide les précédents de l'utilisateur
 * (un seul lien actif à la fois).
 *
 * @returns le lien, ou null si l'email n'existe pas. L'appelant doit répondre
 *          de façon IDENTIQUE dans les deux cas : révéler l'existence d'un compte
 *          permettrait d'énumérer les emails inscrits.
 */
export async function createResetToken(email: string): Promise<CreateResetResult | null> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true },
  });

  // Compte inexistant OU compte OAuth (sans mot de passe) : rien à réinitialiser.
  if (!user || !user.passwordHash) return null;

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

  await prisma.$transaction([
    // Un seul lien actif par utilisateur : les anciens liens deviennent invalides.
    prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
    prisma.passwordResetToken.create({
      data: { userId: user.id, tokenHash: hashToken(token), expiresAt },
    }),
  ]);

  return {
    link: `${appUrl()}/reset-password?token=${token}`,
    expiresAt,
  };
}

export type VerifyResetResult =
  | { ok: true; userId: string }
  | { ok: false; reason: "invalide" | "expire" | "utilise" };

/** Vérifie qu'un token est valide, non expiré et non déjà utilisé. */
export async function verifyResetToken(token: string): Promise<VerifyResetResult> {
  if (!token) return { ok: false, reason: "invalide" };

  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
    select: { userId: true, expiresAt: true, usedAt: true },
  });

  if (!record) return { ok: false, reason: "invalide" };
  if (record.usedAt) return { ok: false, reason: "utilise" };
  if (record.expiresAt.getTime() < Date.now()) return { ok: false, reason: "expire" };

  return { ok: true, userId: record.userId };
}

/**
 * Applique le nouveau mot de passe et invalide le jeton.
 * Le hachage bcrypt (coût 12) est volontairement fait AVANT la transaction :
 * il prend ~300 ms, à ne pas garder ouvert sur la base distante.
 */
export async function applyNewPassword(token: string, newPassword: string): Promise<VerifyResetResult> {
  const verified = await verifyResetToken(token);
  if (!verified.ok) return verified;

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verified.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash: hashToken(token) },
      data: { usedAt: new Date() },
    }),
  ]);

  return { ok: true, userId: verified.userId };
}