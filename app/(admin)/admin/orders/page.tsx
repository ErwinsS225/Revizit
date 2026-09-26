import type { Metadata } from "next";
import Link from "next/link";
import { Eye, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatOrderDate, formatOrderNumber, getOrderStatusConfig } from "@/lib/order-status";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUSES, type OrderStatus } from "@/types";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";

export const metadata: Metadata = { title: "Commandes" };

export const dynamic = "force-dynamic";

const PER_PAGE = 15;

const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

type OrderRow = {
  id: string;
  total: number;
  createdAt: Date;
  status: OrderStatus;
  user: { name: string | null; email: string };
  items: { id: string }[];
};

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// app/(admin)/admin/orders/page.tsx — liste des commandes avec filtre de statut.
export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const statusFilter = firstParam(searchParams.status);
  const status = ORDER_STATUSES.includes(statusFilter as OrderStatus)
    ? (statusFilter as OrderStatus)
    : null;
  const page = Math.max(1, Number(firstParam(searchParams.page)) || 1);

  const where = status ? { status } : {};
  const [total, rawOrders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        total: true,
        createdAt: true,
        status: true,
        user: { select: { name: true, email: true } },
        items: { select: { id: true } },
      },
    }),
  ]);
  const pageCount = Math.ceil(total / PER_PAGE);

  // SQLite : les statuts sont stockés en String → réalignement sur l'union.
  const orders: OrderRow[] = rawOrders.map((order) => ({
    ...order,
    status: order.status as OrderStatus,
  }));

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/admin/orders?${params.toString()}`;
  };

  const columns: AdminColumn<OrderRow>[] = [
    {
      key: "number",
      header: "Commande",
      cell: (row) => (
        <div>
          <p className="font-medium">{formatOrderNumber(row.id)}</p>
          <p className="text-xs text-muted-foreground">{formatOrderDate(row.createdAt)}</p>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Client",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.user.name ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.user.email}</p>
        </div>
      ),
    },
    { key: "items", header: "Articles", cell: (row) => `${row.items.length}` },
    {
      key: "total",
      header: "Total",
      cell: (row) => <span className="font-medium">{formatPrice(row.total)}</span>,
    },
    {
      key: "status",
      header: "Statut",
      cell: (row) => (
        <span
          className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${getOrderStatusConfig(row.status).badgeClass}`}
        >
          {STATUS_LABELS[row.status]}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[80px]",
      cell: (row) => (
        <Link
          href={`/admin/orders/${row.id}`}
          aria-label={`Voir la commande ${formatOrderNumber(row.id)}`}
          className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
        </Link>
      ),
    },
  ];

  return (
    <div className="min-w-0">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Commandes</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {total} commande{total > 1 ? "s" : ""} au total
          {status ? ` · filtre ${STATUS_LABELS[status]}` : ""}.
        </p>
      </div>

      <form action="/admin/orders" method="get" className="mt-5 flex max-w-xs gap-2">
        <label htmlFor="admin-orders-status" className="sr-only">
          Filtrer par statut
        </label>
        <select
          id="admin-orders-status"
          name="status"
          defaultValue={status ?? ""}
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
        >
          <option value="">Tous les statuts</option>
          {ORDER_STATUSES.map((value) => (
            <option key={value} value={value}>
              {STATUS_LABELS[value]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="inline-flex h-10 items-center gap-1.5 rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Search className="h-4 w-4" aria-hidden="true" /> Filtrer
        </button>
      </form>

      <div className="mt-5">
        <AdminTable
          caption="Liste des commandes"
          columns={columns}
          rows={orders}
          empty="Aucune commande pour ce filtre."
        />
      </div>

      {pageCount > 1 ? (
        <nav aria-label="Pagination commandes" className="mt-6 flex items-center justify-between gap-2">
          <Link
            href={pageHref(Math.max(1, page - 1))}
            aria-disabled={page <= 1}
            className={`rounded-md border px-3 py-2 text-sm ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
          >
            ← Précédent
          </Link>
          <p className="text-sm text-muted-foreground" role="status">
            Page {page} sur {pageCount}
          </p>
          <Link
            href={pageHref(Math.min(pageCount, page + 1))}
            aria-disabled={page >= pageCount}
            className={`rounded-md border px-3 py-2 text-sm ${page >= pageCount ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
          >
            Suivant →
          </Link>
        </nav>
      ) : null}
    </div>
  );
}