import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Éditer une catégorie" };

export const dynamic = "force-dynamic";

// app/(admin)/admin/categories/[id]/page.tsx — édition d'une catégorie.
export default async function EditCategoryPage({ params }: { params: { id: string } }) {
  const category = await prisma.category.findUnique({ where: { id: params.id } });
  if (!category) notFound();

  return (
    <div className="min-w-0">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux catégories
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">
        Éditer « {category.name} »
      </h1>
      <div className="mt-6">
        <CategoryForm category={category} />
      </div>
    </div>
  );
}