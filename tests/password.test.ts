import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/lib/password";

describe("password (bcryptjs)", () => {
  it("hash puis vérifie le mot de passe", async () => {
    const hash = await hashPassword("Secret123");
    expect(hash).not.toBe("Secret123");
    await expect(verifyPassword("Secret123", hash)).resolves.toBe(true);
    await expect(verifyPassword("Mauvais123", hash)).resolves.toBe(false);
  });
  it("rejette les mots de passe trop courts", async () => {
    await expect(hashPassword("court")).rejects.toThrow();
  });
});
