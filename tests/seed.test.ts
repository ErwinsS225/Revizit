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

  it("contient 3 utilisateurs (1 admin + 2 clients)", async () => {
    const [admins, customers] = await Promise.all([
      prisma!.user.count({ where: { role: "ADMIN" } }),
      prisma!.user.count({ where: { role: "CUSTOMER" } }),
    ]);
    expect(admins).toBe(1);
    expect(customers).toBe(2);
  }, TIMEOUT_MS);

  it("admin@shop.com existe avec un hash bcrypt", async () => {
    const admin = await prisma!.user.findUnique({ where: { email: "admin@shop.com" } });
    expect(admin?.role).toBe("ADMIN");
    expect(admin?.passwordHash?.startsWith("$2")).toBe(true);
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

  it("contient 5 commandes avec items et total cohérent", async () => {
    const orders = await prisma!.order.findMany({ include: { items: true } });
    expect(orders.length).toBe(5);
    for (const o of orders) {
      expect(o.items.length).toBeGreaterThan(0);
      const sum = o.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
      expect(o.total).toBe(sum);
    }
  }, TIMEOUT_MS);
});
