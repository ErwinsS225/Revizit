import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Nouveau produit" };

export const dynamic = "force-dynamic";

// app/(admin)/admin/products/new/page.tsx — formulaire de création d'un produit.
export default async function NewProductPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="min-w-0">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux produits
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">Nouveau produit</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Renseigne les informations du produit, ses images et ses variantes (taille/couleur).
      </p>
      <div className="mt-6">
        <ProductForm categories={categories} />
      </div>
    </div>
  );
}
