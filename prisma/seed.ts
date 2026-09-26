// prisma/seed.ts — jeu de données Revizit : 6 catégories, 30 produits, variantes.
// ⚠️ DESTRUCTIF : le seed purge la base avant insertion. En production il est
//    refusé (voir purge()) et ne doit tourner que sur une base jetable.
// Aucun compte de démonstration n'est créé : les utilisateurs réels s'inscrivent
// via /register. Usage : npm run prisma:seed (ou npx prisma db seed).
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** URL Unsplash optimisée. */
const U = (id: string): string => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&q=80`;

const CATEGORIES: { name: string; slug: string; description: string; image: string; parent?: string }[] = [
  { name: "Hommes", slug: "hommes", description: "Wax, Kita et Bogolan pour homme : cérémonies, bureau, quotidien.", image: U("photo-1531901599143-df5010ab9438") },
  { name: "Femmes", slug: "femmes", description: "Tenues africaines féminines : dot, mariage, baptême et quotidien.", image: U("photo-1708170372323-bd2652ca788e") },
  { name: "Verrerie", slug: "verrerie", description: "Coupes à vin et champagne gravées au laser, personnalisées à Abidjan.", image: U("photo-1446822775955-c34f483b410b") },
  { name: "Chemises", slug: "chemises", description: "Chemises et tuniques en Wax, Kita et Bogolan.", image: U("photo-1531384698654-7f6e477ca221"), parent: "hommes" },
  { name: "Robes", slug: "robes", description: "Robes longues, ensembles de dot et pièces de cérémonie.", image: U("photo-1708170236080-6cb6d2d5497c"), parent: "femmes" },
  { name: "Ensembles", slug: "ensembles", description: "Ensembles deux pièces et tailleurs complets.", image: U("photo-1708170236083-4671c6b83ad3"), parent: "femmes" },
];

/**
 * Comptes de démonstration — supprimés.
 *
 * Historique : le seed créait admin@shop.com / Admin123!, un accès total au
 * back-office avec un mot de passe deviné en une seconde. Ces comptes
 * n'existent plus : un administrateur se crée lui-même via /register, puis se
 * promeut en ADMIN (directement en base, ou via /admin/users).
 *
 * Les données de démonstration restantes (produits, catégories) sont conservées :
 * elles sont utiles au catalogue. Seuls les COMPTES sont retirés.
 */

// [nom, slug, prixFCFA, prixBarréFCFA (0 = aucun), genre, slugCatégorie, marque, couleur, idUnsplash, tag]
// Taux indicatif : 1 € ≈ 655,957 F CFA.
type ProductRow = [string, string, number, number, "MEN" | "WOMEN" | "UNISEX", string, string, string, string, string];

const MEN_PRODUCTS: ProductRow[] = [
  ["Chemise wax premium", "chemise-wax-premium", 68500, 85000, "MEN", "chemises", "Revizit Atelier", "Wax indigo", "photo-1531901599143-df5010ab9438", "chemise"],
  ["Tunique Kita homme", "tunique-kita-homme", 72000, 0, "MEN", "chemises", "Revizit Atelier", "Ocre", "photo-1531384698654-7f6e477ca221", "chemise"],
  ["Chemise bogolan casually", "chemise-bogolan-casually", 65500, 0, "MEN", "chemises", "Revizit Atelier", "Noir & blanc", "photo-1440451185281-11ff5853ce0a", "chemise"],
  ["Ensemble dot Kita 3 pièces", "ensemble-dot-kita-3-pieces", 195000, 240000, "MEN", "hommes", "Revizit Cérémonie", "Or & indigo", "photo-1708170236215-b6edcad7f49a", "ensemble"],
  ["Grand bubi wax", "grand-bubi-wax", 89500, 0, "MEN", "hommes", "Revizit Cérémonie", "Wax vert", "photo-1708170372318-ef24ebd2634f", "ensemble"],
  ["Kuta brodé argent", "kuta-brode-argent", 155000, 189000, "MEN", "hommes", "Revizit Cérémonie", "Blanc & argent", "photo-1708170236295-20ab8fbadcef", "ensemble"],
  ["Tenue traditionnelle complète", "tenue-traditionnelle-complete", 185000, 0, "MEN", "hommes", "Revizit Cérémonie", "Bogolan", "photo-1602699121555-2640db5a4639", "ensemble"],
  ["Pantalon wax large", "pantalon-wax-large", 59500, 0, "MEN", "hommes", "Revizit Atelier", "Wax brique", "photo-1473594659356-a404044aa2c2", "pantalon"],
  ["Chemise wax bureau slim", "chemise-wax-bureau-slim", 64500, 0, "MEN", "chemises", "Revizit Atelier", "Wax bleu", "photo-1533108344127-a586d2b02479", "chemise"],
  ["Polo brodé fil d'or", "polo-brode-fil-dor", 58500, 69000, "MEN", "hommes", "Revizit Atelier", "Écru", "photo-1485570661444-73b3f0ff9d2f", "maille"],
  ["Veste kita structurée", "veste-kita-structuree", 135000, 0, "MEN", "hommes", "Revizit Cérémonie", "Indigo", "photo-1531384698654-7f6e477ca221", "veste"],
  ["Sandales cuir Revizit", "sandales-cuir-revizit", 65000, 0, "MEN", "hommes", "Revizit Atelier", "Cuir brun", "photo-1549298916-b41d501d3772", "sandale"],
  ["Cape wax de cérémonie", "cape-wax-ceremonie", 145000, 0, "MEN", "hommes", "Revizit Cérémonie", "Wax pourpre", "photo-1720718517204-a66cc17a1052", "cape"],
  ["Derby cuir miel", "derby-cuir-miel", 85000, 99000, "MEN", "hommes", "Revizit Atelier", "Cuir miel", "photo-1560343090-f0409e92791a", "derbies"],
  ["Montre acier doré", "montre-acier-dore", 145000, 0, "MEN", "hommes", "Revizit Atelier", "Or & noir", "photo-1523170335258-f5ed11844a49", "montre"],
];

const WOMEN_PRODUCTS: ProductRow[] = [
  ["Robe bogolan authentique", "robe-bogolan-authentique", 145000, 178000, "WOMEN", "robes", "Revizit Cérémonie", "Bogolan noir & blanc", "photo-1708170236215-b6edcad7f49a", "robe"],
  ["Robe wax assortie", "robe-wax-assortie", 125000, 0, "WOMEN", "robes", "Revizit Cérémonie", "Wax jaune & or", "photo-1708170372323-bd2652ca788e", "robe"],
  ["Ensemble dot complet", "ensemble-dot-complet", 285000, 350000, "WOMEN", "ensembles", "Revizit Cérémonie", "Wax vert & doré", "photo-1708170372318-ef24ebd2634f", "robe"],
  ["Robe longue ankara", "robe-longue-ankara", 118000, 0, "WOMEN", "robes", "Revizit Cérémonie", "Ankara bleu", "photo-1708170236295-20ab8fbadcef", "robe"],
  ["Robe wax plissée", "robe-wax-plissee", 98500, 118000, "WOMEN", "robes", "Revizit Atelier", "Wax terracotta", "photo-1542513217-0b0eedf7005d", "robe"],
  ["Gown brodé perlée", "gown-brode-perlee", 395000, 0, "WOMEN", "robes", "Revizit Cérémonie", "Ivoire & perle", "photo-1485570661444-73b3f0ff9d2f", "robe"],
  ["Ensemble pagne wax quotidien", "ensemble-pagne-quotidien", 89000, 105000, "WOMEN", "ensembles", "Revizit Atelier", "Wax brique", "photo-1602699121555-2640db5a4639", "ensemble"],
  ["Tailleur ankara femme", "tailleur-ankara-femme", 165000, 198000, "WOMEN", "ensembles", "Revizit Cérémonie", "Indigo & blanc", "photo-1653489333284-cf91cae3812e", "tailleur"],
  ["Chemise wax loose", "chemise-wax-loose", 64500, 0, "WOMEN", "ensembles", "Revizit Atelier", "Wax écru", "photo-1720718517204-a66cc17a1052", "chemise"],
  ["Foulard wax soie", "foulard-wax-soie", 32000, 39000, "WOMEN", "ensembles", "Revizit Atelier", "Wax multicolore", "photo-1473594659356-a404044aa2c2", "foulard"],
  ["Coupe à vin gravée", "coupe-a-vin-gravee", 18000, 0, "WOMEN", "verrerie", "Revizit Atelier Verrerie", "Cristal", "photo-1544598740-358704557d82", "verre"],
  ["Flûte champagne gravée", "flute-champagne-gravee", 22000, 0, "WOMEN", "verrerie", "Revizit Atelier Verrerie", "Cristal", "photo-1446822775955-c34f483b410b", "verre"],
  ["Pack 4 coupes gravées", "pack-4-coupes-graves", 55000, 66000, "WOMEN", "verrerie", "Revizit Atelier Verrerie", "Cristal", "photo-1498429152472-9a433d9ddf3b", "verre"],
  ["Pack 6 coupes mariage", "pack-6-coupes-mariage", 79000, 95000, "WOMEN", "verrerie", "Revizit Atelier Verrerie", "Cristal", "photo-1628336707631-68131ca720c3", "verre"],
  ["Pack 12 coupes entreprise", "pack-12-coupes-entreprise", 138000, 0, "WOMEN", "verrerie", "Revizit Atelier Verrerie", "Cristal", "photo-1527529482837-4698179dc6ce", "verre"],
];

const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL"];
const SHOE_SIZES = ["36", "37", "38", "39", "40", "41", "42", "43"];
const ONE_SIZES = ["TU"];

function isShoeRow(tag: string): boolean {
  return tag === "sneakers" || tag === "derbies" || tag === "escarpins" || tag === "sandale";
}

function isAccessoryRow(tag: string): boolean {
  return tag === "montre" || tag === "sac" || tag === "foulard" || tag === "verre";
}

/** Verrerie personnalisée : description dédiée (gravure laser). */
function isGlasswareRow(tag: string): boolean {
  return tag === "verre";
}

/**
 * Purge du CATALOGUE et des données de démonstration, dans l'ordre des
 * dépendances (clés étrangères).
 *
 * ⚠️ Ne supprime PLUS les utilisateurs : le seed ne crée plus de comptes de
 * démonstration, donc les effacer n'aurait aucun intérêt — cela détruirait les
 * clients réels et leurs commandes. Les utilisateurs (et tout ce qui s'y
 * rattache : adresses, panier, favoris, avis, commandes, sessions) sont
 * conservés ; seul le catalogue produits est réinitialisé.
 *
 * Un seed reste BLOQUÉ en production : même limité au catalogue, il effacerait
 * le vrai catalogue d'une boutique ouverte.
 */
async function purge(): Promise<void> {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Refus de purger : NODE_ENV=production. Le seed est destructif (catalogue, " +
        "avis, variantes). Il ne doit tourner que sur une base jetable.",
    );
  }
  // Commandes / avis / variantes : données rattachées au catalogue.
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  // Nettoyage des données orphelines d'un panier laissé en cours.
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlist.deleteMany();
}

async function main(): Promise<void> {
  console.log("🌱 Seed : purge…");
  await purge();

  // Aucun utilisateur de démonstration n'est créé : les comptes de test
  // (admin@shop.com / Admin123!) ont été retirés. Un administrateur réel se
  // crée via /register, puis se promeut en ADMIN.
  console.log("👤 Seed : aucun compte de démonstration (désactivé)");

  console.log("🗂️ Seed : catégories…");
  const catBySlug = new Map<string, string>();
  for (const c of CATEGORIES.filter((c) => !c.parent)) {
    const created = await prisma.category.create({
      data: { name: c.name, slug: c.slug, description: c.description, image: c.image },
    });
    catBySlug.set(c.slug, created.id);
  }
  for (const c of CATEGORIES.filter((c) => c.parent)) {
    const parentId = c.parent ? catBySlug.get(c.parent) : undefined;
    const created = await prisma.category.create({
      data: { name: c.name, slug: c.slug, description: c.description, image: c.image, parentId },
    });
    catBySlug.set(c.slug, created.id);
  }

  console.log("👕 Seed : 30 produits + variantes…");
  const allRows = [...MEN_PRODUCTS, ...WOMEN_PRODUCTS];
  const createdProducts: { id: string; price: number }[] = [];
  let skuCounter = 1000;
  for (const [name, slug, price, compare, gender, catSlug, brand, color, imgId, tag] of allRows) {
    const sizes = isShoeRow(tag) ? SHOE_SIZES : isAccessoryRow(tag) ? ONE_SIZES : CLOTHING_SIZES;
    const totalStock = sizes.length * 8;
    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description: isGlasswareRow(tag)
          ? `${name} — verrerie personnalisée Revizit, en ${color.toLowerCase()}. Gravure laser de ton prénom, de tes initiales ou d'une date (20 caractères max). Tarif dégressif dès 4 coupes, emballage cadeau offert. Fabrication à Abidjan, livraison 24-48h.`
          : `${name} — pièce ${brand.toLowerCase()} en coloris ${color.toLowerCase()}. Coupe soignée, matière durable, fait main pour durer.`,
        price,
        compareAtPrice: compare === 0 ? null : compare,
        images: JSON.stringify([U(imgId)]),
        categoryId: catBySlug.get(catSlug),
        brand,
        stock: totalStock,
        sku: `SKU-${skuCounter++}`,
        isFeatured: price >= 65500 || tag === "verre",
        isActive: true,
        tags: JSON.stringify([tag, color.toLowerCase(), gender === "MEN" ? "homme" : gender === "WOMEN" ? "femme" : "unisexe"]),
        gender,
        variants: {
          create: sizes.map((size) => ({ size, color, stock: 8, priceModifier: 0 })),
        },
      },
    });
    createdProducts.push({ id: product.id, price: product.price });
  }

  // Adresses, commandes et avis étaient rattachés aux clients de démonstration
  // supprimés : ces blocs ne sont donc plus exécutés. Le back-office démarre
  // vide, ce qui est l'état normal d'une boutique qui vient d'ouvrir.
  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    products: await prisma.product.count(),
    variants: await prisma.productVariant.count(),
    orders: await prisma.order.count(),
  };
  console.log("✅ Seed terminé :", counts);
}

main()
  .catch((e: unknown) => {
    console.error("❌ Seed échoué :", e);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });

