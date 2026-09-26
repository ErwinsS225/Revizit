import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

// Valide le schéma Prisma (rapide, sans se connecter : `validate` ne résout pas l'URL).
// Le schéma déclare provider = "postgresql" et utilise env("DATABASE_URL") +
// env("DIRECT_URL"). On fournit donc une URL Postgres factice mais bien formée —
// `validate` vérifie la syntaxe, il n'essaie pas de joindre le serveur.
const PLACEHOLDER_URL = "postgresql://user:password@localhost:5432/revizit?schema=public";

describe("prisma schema", () => {
  it("prisma validate passe", () => {
    const out = execFileSync("node_modules/.bin/prisma", ["validate"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL ?? PLACEHOLDER_URL,
        DIRECT_URL: process.env.DIRECT_URL ?? PLACEHOLDER_URL,
      },
    });
    expect(out).toMatch(/valid/i);
  }, 60_000);
});
