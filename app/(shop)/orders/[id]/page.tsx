import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, MapPin, Package } from "lucide-react";
import { OrderCancelButton } from "@/components/account/order-cancel-button";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  canCancelOrder,
  formatOrderDate,
  formatOrderNumber,
  getOrderStatusConfig,
} from "@/lib/order-status";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = { title: "Détail de la commande" };

export const dynamic = "force-dynamic";

// app/(shop)/orders/[id]/page.tsx — détail d'une commande appartenant à l'utilisateur.
export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/orders/${params.id}`);

  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      address: true,
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          variant: { select: { size: true, color: true } },
        },
      },
    },
  });

  // Protection contre l'énumération d'identifiants : 404 si la commande n'est pas la sienne.
  if (!order || order.userId !== session.user.id) notFound();

  const status = getOrderStatusConfig(order.status);
  const itemsTotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = order.total - itemsTotal;

  return (
    <div className="container-shop max-w-3xl py-8 sm:py-12">
      <Link
        href="/orders"
        className="inline-flex min-h-[44px] items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour à mes commandes
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            Commande {formatOrderNumber(order.id)}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Passée le {formatOrderDate(order.createdAt)}
          </p>
        </div>
        <span
          className={cn("rounded-full border px-3 py-1 text-sm font-medium", status.badgeClass)}
        >
          {status.label}
        </span>
      </div>

      <section aria-labelledby="order-items" className="mt-8 rounded-xl border bg-card p-5 shadow-sm">
        <h2 id="order-items" className="font-serif text-lg font-bold">
          Articles
        </h2>
        <ul className="mt-4 divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
              <div className="min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium text-foreground hover:text-terracotta hover:underline"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.variant
                    ? `${item.variant.size}${item.variant.color ? ` · ${item.variant.color}` : ""} · `
                    : ""}
                  Quantité : {item.quantity} · {formatPrice(item.unitPrice)} l&apos;unité
                </p>
              </div>
              <span className="font-semibold">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          ))}
        </ul>

        <dl className="mt-4 space-y-1.5 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Sous-total</dt>
            <dd>{formatPrice(itemsTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Livraison</dt>
            <dd>{shipping <= 0 ? "Offerte" : formatPrice(shipping)}</dd>
          </div>
          <div className="flex justify-between border-t pt-2 text-base font-bold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>

      <section aria-labelledby="order-shipping" className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        <h2 id="order-shipping" className="flex items-center gap-2 font-serif text-lg font-bold">
          <MapPin className="h-5 w-5 text-terracotta" aria-hidden="true" /> Livraison
        </h2>
        {order.address ? (
          <address className="mt-3 text-sm not-italic text-muted-foreground">
            <span className="block font-medium text-foreground">{order.address.fullName}</span>
            <span className="block">{order.address.street}</span>
            <span className="block">
              {order.address.city} {order.address.postalCode}, {order.address.country}
            </span>
            {order.address.phone ? <span className="block">Tél : {order.address.phone}</span> : null}
          </address>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Adresse de livraison indisponible.</p>
        )}
      </section>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11 px-4")}
        >
          <Package className="mr-2 h-4 w-4" /> Continuer mes achats
        </Link>
        {canCancelOrder(order.status) ? <OrderCancelButton orderId={order.id} /> : null}
      </div>
    </div>
  );
}
