import NextAuth from "next-auth";
import type { User } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { authConfig, toRole } from "@/lib/auth.config";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { loginSchema } from "@/lib/validators/auth";
import type { Role } from "@/types";

// lib/auth.ts — Auth.js v5 : credentials (email/password) + Google OAuth, sessions JWT.
// La partie partagée/Edge-safe vit dans lib/auth.config.ts (réutilisée par le middleware).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    // Google OAuth uniquement si configuré (sinon Auth.js lèverait une erreur au boot).
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID,
            clientSecret: process.env.AUTH_GOOGLE_SECRET,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "Email",
      credentials: { email: { label: "Email" }, password: { label: "Mot de passe", type: "password" } },
      async authorize(raw): Promise<(User & { role: Role }) | null> {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, email: true, name: true, image: true, role: true, passwordHash: true },
        });
        if (!user?.passwordHash) return null;
        const ok = await verifyPassword(parsed.data.password, user.passwordHash);
        if (!ok) return null;
        // Le rôle voyage dans le JWT : évite tout accès base depuis le middleware.
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: toRole(user.role),
        };
      },
    }),
  ],
});

/** Récupère l'utilisateur connecté (ou null). */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Exige un rôle ADMIN, sinon lève une erreur.
 * Le contrôle est déjà fait ci-dessus : le narrowing de TypeScript permet
 * d'éviter les assertions non-null, qui masqueraient une régression future.
 */
export async function requireAdmin() {
  const session = await auth();
  const user = session?.user;
  if (!user || user.role !== "ADMIN") {
    throw new Error("Accès réservé à l'administrateur");
  }
  return user;
}
