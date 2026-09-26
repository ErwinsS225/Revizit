import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User as UserIcon } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatOrderDate, formatOrderNumber } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import { type OrderStatus } from "@/types";
import { OrderStatusSelect } from "@/components/admin/order-status-select";

export const metadata: Metadata = { title: "Détail commande" };

export const dynamic = "force-dynamic";

// app/(admin)/admin/orders/[id]/page.tsx — détail d'une commande (admin).
export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  const order = await prisma.order.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      address: true,
      items: {
        include: {
          product: { select: { name: true, slug: true } },
          variant: { select: { size: true, color: true } },
        },
      },
    },
  });
  if (!order) notFound();

  const itemsTotal = order.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = order.total - itemsTotal;

  return (
    <div className="min-w-0 max-w-4xl">
      <Link
        href="/admin/orders"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux commandes
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">
            {formatOrderNumber(order.id)}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Passée le {formatOrderDate(order.createdAt)}</p>
        </div>
        <div className="w-full max-w-[220px]">
          <label htmlFor="order-status" className="mb-1 block text-xs font-medium text-muted-foreground">
            Statut
          </label>
          <OrderStatusSelect orderId={order.id} status={order.status as OrderStatus} />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Client */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <UserIcon className="h-4 w-4 text-terracotta" aria-hidden="true" /> Client
          </h2>
          <p className="mt-3 font-medium">{order.user.name ?? "—"}</p>
          <p className="text-sm text-muted-foreground">{order.user.email}</p>
        </section>

        {/* Adresse de livraison */}
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="flex items-center gap-2 font-serif text-lg font-semibold">
            <MapPin className="h-4 w-4 text-terracotta" aria-hidden="true" /> Adresse de livraison
          </h2>
          {order.address ? (
            <div className="mt-3 text-sm leading-relaxed">
              <p className="font-medium">{order.address.fullName}</p>
              <p>{order.address.street}</p>
              <p>
                {order.address.city} {order.address.postalCode}, {order.address.country}
              </p>
              {order.address.phone ? <p className="text-muted-foreground">Tél : {order.address.phone}</p> : null}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">Aucune adresse enregistrée.</p>
          )}
        </section>
      </div>

      {/* Articles */}
      <section className="mt-6 rounded-xl border bg-card p-5 shadow-sm">
        <h2 className="font-serif text-lg font-semibold">Articles</h2>
        <ul className="mt-4 divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-3 text-sm">
              <div className="min-w-0">
                <Link
                  href={`/products/${item.product.slug}`}
                  className="font-medium transition-colors hover:text-terracotta"
                >
                  {item.product.name}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {item.variant ? `Taille ${item.variant.size}${item.variant.color ? ` · ${item.variant.color}` : ""} · ` : ""}
                  Quantité {item.quantity} × {formatPrice(item.unitPrice)}
                </p>
              </div>
              <span className="shrink-0 font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
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
            <dd>{shipping > 0 ? formatPrice(shipping) : "Offerte"}</dd>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}