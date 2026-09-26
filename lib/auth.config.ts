import type { NextAuthConfig, User } from "next-auth";
import type { AdapterUser } from "@auth/core/adapters";
import type { JWT } from "next-auth/jwt";
import type { Role } from "@/types";

// lib/auth.config.ts — config Auth.js PARTAGÉE et compatible Edge (aucun import Prisma/bcrypt).
// Utilisée par middleware.ts : un import de Prisma ici casserait le middleware (runtime Edge).

/** Normalise un rôle venu de la base (String en SQLite). */
export function toRole(value: unknown): Role {
  return value === "ADMIN" ? "ADMIN" : "CUSTOMER";
}

export const authConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [],
  callbacks: {
    // Aucun accès base ici : le rôle est porté par `user` au moment de la connexion
    // (fourni par `authorize` en credentials, par l'adaptateur en OAuth).
    // Paramètres typés EXPLICITEMENT (signature exacte Auth.js) : jamais d'any implicite.
    jwt({ token, user }: { token: JWT; user: User | AdapterUser }) {
      if (user?.id) {
        token.sub = user.id;
        token.role = toRole((user as { role?: unknown }).role);
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        (session.user as { role?: string }).role = (token.role as string) ?? "CUSTOMER";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
