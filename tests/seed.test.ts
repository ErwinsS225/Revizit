import { afterAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";

// Test d'intégration DB : vérifie le contenu du seed sur une base RÉELLE.
// ⚠️ Nécessite une base Postgres accessible (Supabase en dev/prod, ou locale) :
//    TEST_DATABASE_URL ou DATABASE_URL doit pointer vers une base seedée.
//    Sans cela le test est ignoré (et non Vert trompeur).
//
// ⚠️ Latence réseau : la base est distante (pooler Supabase), un aller-retour
//    peut dépasser le timeout Vitest par défaut de 5 s. D'où TIMEOUT_MS=30_000.
const dbUrl = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
const prisma = dbUrl
  ? new PrismaClient({ datasources: { db: { url: dbUrl } } })
  : null;

const TIMEOUT_MS = 30_000;

// Sans fermer le client, Prisma maintient le pool ouvert et Vitest ne peut pas
// terminer proprement le processus sur une base distante.
afterAll(async () => {
  await prisma?.$disconnect();
});

const describeDb = prisma ? describe : describe.skip;

describeDb("seed (intégration Postgres)", () => {
  it("la base de test est configurée", () => {
    expect(prisma, "TEST_DATABASE_URL ou DATABASE_URL requis").not.toBeNull();
  }, TIMEOUT_MS);

  it("ne crée AUCUN utilisateur de démonstration", async () => {
    // Les comptes de test (admin@shop.com / Admin123!) ont été supprimés :
    // ils donnaient un accès total au back-office. Les utilisateurs réels
    // s'inscrivent via /register.
    expect(await prisma!.user.count()).toBe(0);
  }, TIMEOUT_MS);

  it("aucun email de démonstration résiduel en base", async () => {
    const leak = await prisma!.user.findMany({
      where: { email: { in: ["admin@shop.com", "marie@example.com", "karim@example.com"] } },
      select: { email: true },
    });
    expect(leak).toEqual([]);
  }, TIMEOUT_MS);

  it("contient 6 catégories dont 3 avec parent", async () => {
    expect(await prisma!.category.count()).toBe(6);
    expect(await prisma!.category.count({ where: { parentId: { not: null } } })).toBe(3);
  }, TIMEOUT_MS);

  it("inclut la catégorie verrerie Revizit", async () => {
    const verrerie = await prisma!.category.findUnique({ where: { slug: "verrerie" } });
    expect(verrerie).not.toBeNull();
  }, TIMEOUT_MS);

  it("contient des produits de verrerie personnalisée", async () => {
    const glass = await prisma!.product.count({
      where: { category: { slug: "verrerie" }, isActive: true },
    });
    expect(glass).toBeGreaterThanOrEqual(3);
  }, TIMEOUT_MS);

  it("contient 30 produits actifs (15 hommes / 15 femmes)", async () => {
    const [total, men, women] = await Promise.all([
      prisma!.product.count({ where: { isActive: true } }),
      prisma!.product.count({ where: { gender: "MEN" } }),
      prisma!.product.count({ where: { gender: "WOMEN" } }),
    ]);
    expect(total).toBe(30);
    expect(men).toBe(15);
    expect(women).toBe(15);
  }, TIMEOUT_MS);

  it("chaque produit a des variantes avec stock > 0 et prix en centimes", async () => {
    const products = await prisma!.product.findMany({
      select: { id: true, price: true, variants: { select: { stock: true } } },
    });
    expect(products.length).toBe(30);
    for (const p of products) {
      expect(Number.isInteger(p.price) && p.price > 0).toBe(true);
      expect(p.variants.length).toBeGreaterThan(0);
      expect(p.variants.every((v) => v.stock > 0)).toBe(true);
    }
  }, TIMEOUT_MS);

  it("ne crée aucune commande de démonstration", async () => {
    // Les commandes fictives étaient rattachées aux clients de test supprimés.
    // Une boutique qui vient d'ouvrir démarre avec 0 commande.
    expect(await prisma!.order.count()).toBe(0);
  }, TIMEOUT_MS);
});
