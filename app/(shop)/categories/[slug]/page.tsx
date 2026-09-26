import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/product/product-grid";
import { getCategoryBySlug, searchProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Catégorie" };

// app/(shop)/categories/[slug]/page.tsx — redirige visuellement vers le catalogue filtré.
export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // Une catégorie inconnue doit renvoyer un vrai 404 (sinon page vide indexée en 200).
  const category = await getCategoryBySlug(params.slug);
  if (!category) notFound();

  const result = await searchProducts({
    category: category.slug,
    sort: "newest",
    page: 1,
  });

  return (
    <div className="container-shop py-10">
      <h1 className="font-serif text-4xl capitalize">{category.name}</h1>
      <p className="mt-2 text-muted-foreground">
        {result.total} produit{result.total > 1 ? "s" : ""} —{" "}
        <Link href={`/products?category=${category.slug}`} className="underline">
          ouvrir avec les filtres
        </Link>
      </p>
      <div className="mt-6">
        <ProductGrid products={result.products} />
      </div>
    </div>
  );
}
