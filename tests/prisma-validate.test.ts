import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";

// Valide le schéma Prisma (rapide, sans toucher la DB).
// NOTE : nécessite DATABASE_URL car le schéma utilise env("DATABASE_URL").
describe("prisma schema", () => {
  it("prisma validate passe", () => {
    const out = execFileSync("node_modules/.bin/prisma", ["validate"], {
      cwd: process.cwd(),
      encoding: "utf-8",
      env: { ...process.env, DATABASE_URL: "file:./dev.db" },
    });
    expect(out).toMatch(/valid/i);
  }, 60_000);
});
