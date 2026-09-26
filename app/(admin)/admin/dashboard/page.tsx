import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CreditCard, Package, Receipt, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDateOnly, formatOrderNumber, getOrderStatusConfig } from "@/lib/order-status";
import { cn, formatPrice } from "@/lib/utils";
import { SalesChart, type SalesPoint } from "@/components/admin/sales-chart";

export const metadata: Metadata = { title: "Tableau de bord" };

// Données toujours fraîches : jamais mises en cache au build.
export const dynamic = "force-dynamic";

const DAYS = 14;

/** Agrège les ventes des `DAYS` derniers jours en journées (une case par jour). */
function buildSalesSeries(orders: { createdAt: Date; total: number }[]): SalesPoint[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const buckets: SalesPoint[] = [];
  const indexByDay = new Map<string, number>();

  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    indexByDay.set(d.toISOString().slice(0, 10), buckets.length);
    buckets.push({ date: `${d.getDate()}/${d.getMonth() + 1}`, sales: 0 });
  }

  for (const order of orders) {
    const slot = indexByDay.get(order.createdAt.toISOString().slice(0, 10));
    const bucket = slot !== undefined ? buckets[slot] : undefined;
    if (bucket) bucket.sales += order.total;
  }
  return buckets;
}

// app/(admin)/admin/dashboard/page.tsx — KPIs, graphe des ventes, dernières commandes.
export default async function AdminDashboardPage() {
  const since = new Date();
  since.setDate(since.getDate() - (DAYS - 1));
  since.setHours(0, 0, 0, 0);

  const [
    revenue,
    orderCount,
    pendingCount,
    productCount,
    lowStockCount,
    userCount,
    statuses,
    recentOrders,
    recentSales,
  ] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: { not: "CANCELLED" } },
    }),
    prisma.order.count(),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true, stock: { lte: 3 } } }),
    prisma.user.count(),
    prisma.order.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: since }, status: { not: "CANCELLED" } },
      select: { createdAt: true, total: true },
    }),
  ]);

  const stats = [
    { label: "Chiffre d'affaires", value: formatPrice(revenue._sum.total ?? 0), icon: CreditCard, hint: "hors commandes annulées" },
    { label: "Commandes", value: String(orderCount), icon: Receipt, hint: `${pendingCount} en attente` },
    { label: "Produits actifs", value: String(productCount), icon: Package, hint: `${lowStockCount} en stock faible` },
    { label: "Clients", value: String(userCount), icon: Users, hint: "inscrits au total" },
  ] as const;

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Tableau de bord</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vue d&apos;ensemble de la boutique — {formatDateOnly(new Date())}.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Nouveau produit <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <dt className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-2 font-serif text-2xl font-bold">{value}</dd>
            <dd className="mt-1 text-xs text-muted-foreground">{hint}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 shadow-sm lg:col-span-2">
          <h2 className="font-serif text-lg font-semibold">Ventes ({DAYS} derniers jours)</h2>
          <div className="mt-4">
            <SalesChart data={buildSalesSeries(recentSales)} />
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <h2 className="font-serif text-lg font-semibold">Commandes par statut</h2>
          <ul className="mt-4 space-y-3">
            {statuses.map(({ status, _count }) => {
              const config = getOrderStatusConfig(status);
              return (
                <li key={status} className="flex items-center justify-between gap-3 text-sm">
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", config.badgeClass)}>
                    {config.label}
                  </span>
                  <span className="font-semibold">{_count._all}</span>
                </li>
              );
            })}
            {statuses.length === 0 ? (
              <li className="text-sm text-muted-foreground">Aucune commande pour le moment.</li>
            ) : null}
          </ul>
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="font-serif text-lg font-semibold">Dernières commandes</h2>
          <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-terracotta hover:underline">
            Tout voir <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="px-5 py-6 text-sm text-muted-foreground">Aucune commande enregistrée.</p>
        ) : (
          <ul className="divide-y">
            {recentOrders.map((order) => {
              const config = getOrderStatusConfig(order.status);
              return (
                <li key={order.id}>
                  <Link
                    href={`/admin/orders/${order.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-accent/50"
                  >
                    <span className="font-medium">{formatOrderNumber(order.id)}</span>
                    <span className="truncate text-sm text-muted-foreground">
                      {order.user.name ?? order.user.email}
                    </span>
                    <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-medium", config.badgeClass)}>
                      {config.label}
                    </span>
                    <span className="font-semibold">{formatPrice(order.total)}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
