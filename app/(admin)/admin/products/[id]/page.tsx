import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/product-form";

export const metadata: Metadata = { title: "Éditer un produit" };

export const dynamic = "force-dynamic";

/** Décodage prudent du champ JSON `images` stocké en String (SQLite). */
function parseJsonArray(raw: string): string[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

// app/(admin)/admin/products/[id]/page.tsx — édition d'un produit existant.
export default async function EditProductPage({ params }: { params: { id: string } }) {
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id: params.id },
      include: { variants: { orderBy: { size: "asc" } } },
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);
  if (!product) notFound();

  return (
    <div className="min-w-0">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-terracotta"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Retour aux produits
      </Link>
      <h1 className="mt-3 font-serif text-2xl font-bold tracking-tight sm:text-3xl">Éditer « {product.name} »</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Modifier le produit mettra à jour le catalogue public immédiatement.
      </p>
      <div className="mt-6">
        <ProductForm
          categories={categories}
          product={{
            id: product.id,
            name: product.name,
            slug: product.slug,
            description: product.description,
            price: product.price,
            compareAtPrice: product.compareAtPrice,
            images: parseJsonArray(product.images),
            categoryId: product.categoryId,
            brand: product.brand,
            stock: product.stock,
            sku: product.sku,
            isFeatured: product.isFeatured,
            isActive: product.isActive,
            tags: parseJsonArray(product.tags),
            gender: product.gender as "MEN" | "WOMEN" | "UNISEX",
            variants: product.variants.map((variant) => ({
              id: variant.id,
              size: variant.size,
              color: variant.color,
              stock: variant.stock,
              priceModifier: variant.priceModifier,
            })),
          }}
        />
      </div>
    </div>
  );
}
