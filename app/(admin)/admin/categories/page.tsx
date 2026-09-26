import type { Metadata } from "next";
import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { AdminDeleteButton } from "@/components/admin/admin-delete-button";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";

export const metadata: Metadata = { title: "Catégories" };

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
};

// app/(admin)/admin/categories/page.tsx — liste des catégories.
export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
  });

  const columns: AdminColumn<CategoryRow>[] = [
    {
      key: "name",
      header: "Catégorie",
      cell: (row) => (
        <div>
          <p className="font-medium">{row.name}</p>
          <p className="text-xs text-muted-foreground">/{row.slug}</p>
        </div>
      ),
    },
    {
      key: "products",
      header: "Produits",
      cell: (row) => `${row._count.products}`,
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-[110px]",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/admin/categories/${row.id}`}
            aria-label={`Éditer ${row.name}`}
            className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </Link>
          <AdminDeleteButton
            href={`/api/categories/${row.id}`}
            confirmMessage={`Supprimer « ${row.name} » ? Les produits rattachés devront être replacés.`}
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
          <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Catégories</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {categories.length} catégorie{categories.length > 1 ? "s" : ""} au total.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Nouvelle catégorie
        </Link>
      </div>

      <div className="mt-5">
        <AdminTable
          caption="Liste des catégories"
          columns={columns}
          rows={categories}
          empty="Aucune catégorie pour le moment."
        />
      </div>
    </div>
  );
}