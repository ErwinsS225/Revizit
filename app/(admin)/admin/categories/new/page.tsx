import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CategoryForm } from "@/components/admin/category-form";

export const metadata: Metadata = { title: "Nouvelle catégorie" };

export const dynamic = "force-dynamic";

// app/(admin)/admin/categories/new/page.tsx — création de catégorie.
export default function NewCategoryPage() {
  return (
    <div className="min-w-0">
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux catégories
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">Nouvelle catégorie</h1>
      <div className="mt-6">
        <CategoryForm />
      </div>
    </div>
  );
}