import bcrypt from "bcryptjs";

// lib/password.ts — hash / vérification mot de passe (bcryptjs, cost 12).
const SALT_ROUNDS = 12;

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < 8) throw new Error("Le mot de passe doit contenir au moins 8 caractères");
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  if (!plain || !hash) return false;
  return bcrypt.compare(plain, hash);
}
