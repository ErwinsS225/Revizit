// lib/prisma.ts — singleton Prisma (évite les connexions multiples en dev avec HMR).
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Pool de connexions.
 * - Dev (Postgres local) : pool Prisma par défaut.
 * - Prod sur Supabase : le port 6543 est le pooler transactionnel (PgBouncer).
 *   Obligatoire pour ne pas épuiser les connexions du plan gratuit ; le nombre
 *   de connexions est porté dans l'URL : `?pgbouncer=true&connection_limit=N`.
 * - Serveurs serverless (Vercel) : une instance par invocation est recréée.
 *   C'est le comportement attendu, le pooler prend le relais côté Supabase.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
