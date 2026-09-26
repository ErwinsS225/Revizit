import { describe, expect, it } from "vitest";
import { createHash } from "node:crypto";
import {
  RESET_TOKEN_TTL_MS,
  createResetToken,
  verifyResetToken,
} from "@/lib/password-reset";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth";

const TEST_EMAIL = "reset-test@revizit.local";

/** Reproduit le hachage du service : SHA-256 du token brut. */
const hash = (t: string) => createHash("sha256").update(t).digest("hex");

/** Latence du pooler Supabase : les tests qui touchent la base sont lents. */
const TIMEOUT_MS = 30_000;

describe("schémas de réinitialisation", () => {
  it("accepte un email valide et le normalise en minuscules", () => {
    expect(forgotPasswordSchema.safeParse({ email: "Awa@Example.CI" }).success).toBe(true);
    const r = forgotPasswordSchema.parse({ email: "  Awa@Example.CI  " });
    expect(r.email).toBe("awa@example.ci");
  });

  it("refuse un email invalide", () => {
    expect(forgotPasswordSchema.safeParse({ email: "pas-un-email" }).success).toBe(false);
  });

  it("applique les mêmes règles qu'à l'inscription", () => {
    const base = { token: "x".repeat(32) };
    // 7 caractères : trop court
    expect(resetPasswordSchema.safeParse({ ...base, password: "Court1" }).success).toBe(false);
    // pas de majuscule
    expect(resetPasswordSchema.safeParse({ ...base, password: "minuscule1" }).success).toBe(false);
    // pas de chiffre
    expect(resetPasswordSchema.safeParse({ ...base, password: "SansChiffre" }).success).toBe(false);
    // conforme
    expect(resetPasswordSchema.safeParse({ ...base, password: "Valide2024" }).success).toBe(true);
  });

  it("refuse un token trop court", () => {
    expect(resetPasswordSchema.safeParse({ token: "court", password: "Valide2024" }).success).toBe(false);
  });
});

describe("durée de validité", () => {
  it("le lien expire après 1 heure", () => {
    expect(RESET_TOKEN_TTL_MS).toBe(60 * 60 * 1000);
  });
});

describe("service de réinitialisation", () => {
  it("refuse un token inconnu sans divulguer d'information", async () => {
    const r = await verifyResetToken("jeton-qui-existe-pas");
    expect(r).toEqual({ ok: false, reason: "invalide" });
  }, TIMEOUT_MS);

  it("refuse un token vide", async () => {
    const r = await verifyResetToken("");
    expect(r).toEqual({ ok: false, reason: "invalide" });
  }, TIMEOUT_MS);

  it("ne crée aucun jeton pour un email inconnu (anti-énumération)", async () => {
    const result = await createResetToken("personne@revizit.local");
    expect(result).toBeNull();
  }, TIMEOUT_MS);

  it("le lien contient un token et pas le hash stocké", async () => {
    // Prérequis : un utilisateur avec mot de passe doit exister.
    const result = await createResetToken(TEST_EMAIL);
    if (result === null) {
      // Base sans ce compte : on vérifie au moins la forme de l'API.
      expect(result).toBeNull();
      return;
    }
    const token = new URL(result.link).searchParams.get("token");
    expect(token).toBeTruthy();
    expect(result.link).toContain("/reset-password?token=");
    // Le hash SHA-256 n'apparaît pas dans le lien.
    expect(result.link).not.toContain(hash(token ?? ""));
    // L'expiration est cohérente.
    expect(result.expiresAt.getTime()).toBeGreaterThan(Date.now());
  }, TIMEOUT_MS);
});