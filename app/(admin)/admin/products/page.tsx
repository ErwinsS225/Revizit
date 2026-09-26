import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus, Search } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";

export const metadata: Metadata = { title: "Produits" };

export const dynamic = "force-dynamic";

const PER_PAGE = 10;

type ProductRow = {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  category: { name: string } | null;
};

function firstParam(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

// app/(admin)/admin/products/page.tsx — liste des produits (recherche, pagination, actions).
export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = firstParam(searchParams.q).trim();
  const page = Math.max(1, Number(firstParam(searchParams.page)) || 1);

  const where = q
    ? { OR: [{ name: { contains: q } }, { slug: { contains: q } }, { brand: { contains: q } }] }
    : {};

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        isActive: true,
        isFeatured: true,
        category: { select: { name: true } },
      },
    }),
  ]);
  const pageCount = Math.ceil(total / PER_PAGE);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/admin/products?${params.toString()}`;
  };

  const columns: AdminColumn<ProductRow>[] = [
    {
      key: "name",
      header: "Produit",
      cell: (row) => (
        <div className="flex items-center gap-3">
          <span
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted font-serif text-sm font-bold uppercase"
            aria-hidden="true"
          >
            {row.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.name}</p>
            <p className="truncate text-xs text-muted-foreground">/{row.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: "price",
      header: "Prix",
      cell: (row) => <span className="font-medium">{formatPrice(row.price)}</span>,
    },
    {
      key: "stock",
      header: "Stock",
      cell: (row) => (
        <span
          className={
            row.stock === 0
              ? "rounded-full border border-destructive/40 bg-destructive/10 px-2.5 py-0.5 text-xs font-medium text-destructive"
              : row.stock <= 3
                ? "rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-600"
                : "rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {row.stock === 0 ? "Rupture" : `${row.stock} en stock`}
        </span>
      ),
    },
    { key: "category", header: "Catégorie", cell: (row) => row.category?.name ?? "—" },
    {
      key: "status",
      header: "Statut",
      cell: (row) => (
        <span className="flex flex-wrap gap-1">
          <span
            className={
              row.isActive
                ? "rounded-full border border-emerald-600/30 bg-emerald-600/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700"
                : "rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            }
          >
            {row.isActive ? "Actif" : "Inactif"}
          </span>
          {row.isFeatured ? (
            <span className="rounded-full border border-terracotta/40 bg-terracotta/10 px-2.5 py-0.5 text-xs font-medium text-terracotta">
              Vedette
            </span>
          ) : null}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[110px]",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/products/${row.id}`}
            aria-label={`Éditer ${row.name}`}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Link>
          <AdminDeleteButton
            href={`/api/products/${row.id}`}
            confirmMessage={`Supprimer « ${row.name} » ? Cette action est définitive.`}
            label={`Supprimer ${row.name}`}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Produits</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {total} produit{total > 1 ? "s" : ""} au total
            {q ? ` · recherche « ${q} »` : ""}.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Nouveau produit
        </Link>
      </div>

      <form action="/admin/products" method="get" className="mt-5 flex max-w-md gap-2">
        <label htmlFor="admin-products-q" className="sr-only">
          Rechercher un produit
        </label>
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            id="admin-products-q"
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Nom, slug ou marque…"
            className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
          />
        </div>
        <button
          type="submit"
          className="h-10 rounded-md border border-input px-4 text-sm font-medium transition-colors hover:bg-accent"
        >
          Rechercher
        </button>
      </form>

      <div className="mt-5">
        <AdminTable
          caption="Liste des produits"
          columns={columns}
          rows={products}
          empty={
            q
              ? `Aucun produit ne correspond à « ${q} ».`
              : "Aucun produit pour le moment. Crée le premier !"
          }
        />
      </div>

      {pageCount > 1 ? (
        <nav aria-label="Pagination produits" className="mt-6 flex items-center justify-between gap-2">
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
