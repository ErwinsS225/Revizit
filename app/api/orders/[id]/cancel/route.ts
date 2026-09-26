import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canCancelOrder } from "@/lib/order-status";

// app/api/orders/[id]/cancel/route.ts — annule une commande non expédiée et remet le stock.
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, status: true },
  });

  if (!order) {
    return NextResponse.json({ ok: false, error: "Commande introuvable" }, { status: 404 });
  }

  if (order.userId !== session.user.id) {
    return NextResponse.json({ ok: false, error: "Accès refusé" }, { status: 403 });
  }

  if (!canCancelOrder(order.status)) {
    return NextResponse.json(
      { ok: false, error: "Cette commande ne peut plus être annulée" },
      { status: 409 },
    );
  }

  try {
    await prisma.$transaction(async (tx) => {
      const items = await tx.orderItem.findMany({
        where: { orderId: order.id },
        select: { productId: true, variantId: true, quantity: true },
      });

      // Mise à jour conditionnelle : évite une double annulation concurrente.
      const updated = await tx.order.updateMany({
        where: { id: order.id, status: { in: ["PENDING", "PAID"] } },
        data: { status: "CANCELLED" },
      });
      if (updated.count === 0) throw new Error("Cette commande ne peut plus être annulée");

      for (const item of items) {
        if (item.variantId) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { increment: item.quantity } },
          });
        } else {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    return NextResponse.json({ ok: true, status: "CANCELLED" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Annulation impossible";
    const status = message.includes("ne peut plus") ? 409 : 500;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
