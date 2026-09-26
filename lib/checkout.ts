import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { assertStockAvailable, calcCartTotal } from "@/lib/cart-pricing";
import { checkoutSchema } from "@/lib/validators/order";

// lib/checkout.ts — création de commande côté serveur (paiement à la livraison / Mobile Money).
// Le total fait foi côté serveur : prix relus en DB, jamais depuis le client.
export interface CheckoutResult {
  orderId: string;
  total: number;
}

export async function createCashOrder(input: unknown): Promise<CheckoutResult> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Connecte-toi pour commander");
  const userId = session.user.id;

  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Commande invalide");
  const { addressId, notes, paymentMethod, lines } = parsed.data;

  const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
  if (!address) throw new Error("Adresse introuvable");

  // Relit prix + stock en DB (source de vérité).
  const productIds = [...new Set(lines.map((l) => l.productId))];
  const products = await prisma.product.findMany({
    where: { id: { in: productIds }, isActive: true },
    include: { variants: true },
  });
  const byId = new Map(products.map((p) => [p.id, p]));
  if (products.length !== productIds.length) throw new Error("Un produit n'est plus disponible");

  const resolved = lines.map((l) => {
    const p = byId.get(l.productId);
    if (!p) throw new Error("Produit introuvable");
    const variant = l.variantId ? p.variants.find((v) => v.id === l.variantId) : null;
    if (l.variantId && !variant) throw new Error(`Variante introuvable pour « ${p.name} »`);
    const unitPrice = p.price + (variant?.priceModifier ?? 0);
    const stock = variant ? variant.stock : p.stock;
    return { productId: p.id, variantId: variant?.id ?? null, quantity: l.quantity, unitPrice, stock, name: p.name };
  });

  assertStockAvailable(resolved);
  const itemsTotal = calcCartTotal(resolved);
  const shipping = itemsTotal >= 50000 ? 0 : 2000;
  const total = itemsTotal + shipping;

  // Transaction : crée la commande + décrémente le stock (variante ou produit).
  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        userId,
        status: "PENDING",
        total,
        addressId,
        items: {
          create: resolved.map((r) => ({
            productId: r.productId,
            variantId: r.variantId,
            quantity: r.quantity,
            unitPrice: r.unitPrice,
          })),
        },
      },
    });
    for (const r of resolved) {
      if (r.variantId) {
        await tx.productVariant.update({ where: { id: r.variantId }, data: { stock: { decrement: r.quantity } } });
      } else {
        await tx.product.update({ where: { id: r.productId }, data: { stock: { decrement: r.quantity } } });
      }
    }
    void notes;
    void paymentMethod;
    return created;
  });

  return { orderId: order.id, total };
}
