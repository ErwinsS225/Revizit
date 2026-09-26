// scripts/create-admin.ts — crée ou promeut un compte administrateur.
//
// Pourquoi : l'inscription publique (/register) force le rôle "CUSTOMER", et
// /admin/users exige déjà ADMIN pour changer un rôle. Sans ce script, impossible
// d'obtenir le premier administrateur.
//
// Usage : npm run create-admin -- votre@email.com
// Le mot de passe est saisi de façon interactive : il n'apparaît JAMAIS dans
// l'historique du shell ni dans les arguments du processus.
import { PrismaClient } from "@prisma/client";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { hashPassword } from "../lib/password";

const prisma = new PrismaClient();

/** Mêmes règles que l'inscription (cf. lib/validators/auth.ts). */
const PASSWORD_RULES: { test: (p: string) => boolean; message: string }[] = [
  { test: (p) => p.length >= 8, message: "8 caractères minimum" },
  { test: (p) => /[A-Z]/.test(p), message: "1 majuscule requise" },
  { test: (p) => /[0-9]/.test(p), message: "1 chiffre requis" },
];

function checkPassword(password: string): string | null {
  return PASSWORD_RULES.find((r) => !r.test(password))?.message ?? null;
}

/** Question au terminal. `hidden` masque la frappe par un point par caractère. */
async function ask(question: string, hidden = false): Promise<string> {
  // Sans TTY (CI, pipe) : pas de masquage, sinon l'utilisateur taperait à l'aveugle.
  const mask = hidden && Boolean(stdin.isTTY);
  const rl = createInterface({ input: stdin, output: stdout, terminal: mask });

  let started = false;
  const onKeypress = (char: string) => {
    if (char === "\n" || char === "\r" || char === "") {
      if (started) stdout.write("\n");
    } else if (!started) {
      started = true;
      stdout.write("*");
    }
  };

  process.stdout.write(question);
  if (mask) process.stdin.on("data", onKeypress);

  const answer = await rl.question("");
  rl.close();
  process.stdin.off("data", onKeypress);
  if (!started) stdout.write("\n");

  return answer.trim();
}

async function main(): Promise<void> {
  const email = process.argv[2]?.trim().toLowerCase();

  if (!email) {
    console.error("Usage : npm run create-admin -- votre@email.com");
    process.exitCode = 1;
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    console.error(`Email invalide : ${email}`);
    process.exitCode = 1;
    return;
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { name: true, role: true, passwordHash: true },
  });

  // ── Compte déjà inscrit : on promeut, et on ne change le mot de passe que si demandé.
  if (existing) {
    console.log(`Compte existant : ${email} (rôle actuel : ${existing.role})`);
    if (!existing.passwordHash) {
      console.log(
        "  Ce compte vient de Google OAuth et n'a pas de mot de passe :\n" +
          "  choisissez-en un pour pouvoir vous connecter par email.",
      );
    }

    const entered = await ask(
      existing.passwordHash
        ? "Nouveau mot de passe (Entrée = conserver l'actuel) : "
        : "Mot de passe : ",
      true,
    );

    if (!entered) {
      await prisma.user.update({ where: { email }, data: { role: "ADMIN" } });
      console.log(`\n✅ ${email} est maintenant ADMIN (mot de passe inchangé).`);
      console.log("   Connexion : /login  puis  /admin");
      return;
    }

    const error = checkPassword(entered);
    if (error) {
      console.error(`Mot de passe refusé : ${error}`);
      process.exitCode = 1;
      return;
    }

    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", passwordHash: await hashPassword(entered) },
    });
    console.log(`\n✅ ${email} est maintenant ADMIN.`);
    console.log("   Connexion : /login  puis  /admin");
    return;
  }

  // ── Nouveau compte.
  const name = (await ask("Nom : ")) || "Administrateur";
  const password = await ask("Mot de passe : ", true);
  const confirm = await ask("Confirmer le mot de passe : ", true);

  if (password !== confirm) {
    console.error("Les deux mots de passe ne correspondent pas.");
    process.exitCode = 1;
    return;
  }
  const error = checkPassword(password);
  if (error) {
    console.error(`Mot de passe refusé : ${error}`);
    process.exitCode = 1;
    return;
  }

  await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password), role: "ADMIN" },
  });
  console.log(`\n✅ ${email} créé avec le rôle ADMIN.`);
  console.log("   Connexion : /login  puis  /admin");
}

main()
  .catch((e: unknown) => {
    console.error("❌ Échec :", e instanceof Error ? e.message : e);
    process.exitCode = 1;
  })
  .finally(() => void prisma.$disconnect());