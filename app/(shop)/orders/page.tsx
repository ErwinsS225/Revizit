import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Package, ShoppingBag } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatOrderDate, formatOrderNumber, getOrderStatusConfig } from "@/lib/order-status";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mes commandes",
  description: "Suivez l'état de vos commandes et consultez leur détail.",
};

export const dynamic = "force-dynamic";

// app/(shop)/orders/page.tsx — historique des commandes de l'utilisateur connecté.
export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/orders");

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      _count: { select: { items: true } },
      items: { take: 3, select: { id: true, product: { select: { name: true } } } },
    },
  });

  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Mes commandes</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        {orders.length} commande{orders.length > 1 ? "s" : ""} au total.
      </p>

      {orders.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-semibold text-foreground">Aucune commande enregistrée</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Vos futures commandes apparaîtront ici avec leur suivi.
          </p>
          <Link
            href="/products"
            className={cn(buttonVariants({ variant: "terracotta", size: "sm" }), "mt-5 h-11 px-5")}
          >
            <ShoppingBag className="mr-2 h-4 w-4" /> Découvrir le catalogue
          </Link>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {orders.map((order) => {
            const status = getOrderStatusConfig(order.status);
            const preview = order.items.map((item) => item.product.name);
            return (
              <li key={order.id}>
                <Link
                  href={`/orders/${order.id}`}
                  className="block rounded-xl border bg-card p-5 shadow-sm transition-colors hover:bg-accent/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-serif text-lg font-bold text-foreground">
                        Commande {formatOrderNumber(order.id)}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        {formatOrderDate(order.createdAt)} · {order._count.items} article
                        {order._count.items > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                          status.badgeClass,
                        )}
                      >
                        {status.label}
                      </span>
                      <span className="font-semibold">{formatPrice(order.total)}</span>
                    </div>
                  </div>

                  {preview.length > 0 ? (
                    <p className="mt-3 truncate border-t pt-3 text-sm text-muted-foreground">
                      {preview.join(" · ")}
                      {order._count.items > preview.length
                        ? ` · +${order._count.items - preview.length} autre${order._count.items - preview.length > 1 ? "s" : ""}`
                        : ""}
                    </p>
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
