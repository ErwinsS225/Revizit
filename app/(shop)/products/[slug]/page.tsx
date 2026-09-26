import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Star } from "lucide-react";
import { AddToCart, ProductGallery } from "@/components/product/product-detail-client";
import { ProductCard } from "@/components/product/product-card";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { BRAND } from "@/lib/brand";
import { parseJsonStringArray } from "@/lib/cart-pricing";
import { buildMetadata, productJsonLd } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

// app/(shop)/products/[slug]/page.tsx — détail produit : galerie, variantes, avis, similaires.
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return buildMetadata({
      title: "Produit introuvable",
      description: "Ce produit n'est plus disponible sur Revizit.",
      path: `/products/${params.slug}`,
      noIndex: true,
    });
  }
  return buildMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${params.slug}`,
  });
}

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const images = parseJsonStringArray(product.images);
  const related = await getRelatedProducts(product.id, product.categoryId, product.gender);
  const reviewCount = product.reviews.length;
  const avg = reviewCount > 0 ? product.reviews.reduce((s, r) => s + r.rating, 0) / reviewCount : null;

  return (
    <div className="container-shop py-6 pb-24 md:py-10 md:pb-10">
      {/* Données structurées Product (revizit.md §9.3) : indispensable au SEO Google Shopping. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            productJsonLd({
              name: product.name,
              description: product.description,
              image: images[0] ?? `${BRAND.url}/opengraph-image`,
              url: `${BRAND.url}/products/${product.slug}`,
              sku: product.sku ?? product.slug,
              brand: product.brand,
              price: product.price,
              inStock: product.stock > 0,
            }),
          ),
        }}
      />
      <nav aria-label="Fil d'Ariane" className="text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Accueil</Link>
        {" / "}
        <Link href="/products" className="hover:text-foreground">Catalogue</Link>
        {" / "}
        <span aria-current="page" className="text-foreground">{product.name}</span>
      </nav>

      <div className="mt-4 grid gap-8 md:mt-6 md:grid-cols-2 md:gap-10">
        <ProductGallery images={images} name={product.name} />

        <div>
          {product.brand ? <p className="text-xs uppercase tracking-wide text-muted-foreground sm:text-sm">{product.brand}</p> : null}
          <h1 className="mt-1 font-serif text-2xl sm:text-3xl lg:text-4xl">{product.name}</h1>
          {avg !== null ? (
            <p className="mt-2 flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden="true" />
              {avg.toFixed(1)} · {reviewCount} avis
            </p>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">Pas encore d&apos;avis</p>
          )}
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-2xl font-bold text-terracotta sm:text-3xl">{formatPrice(product.price)}</p>
            {product.compareAtPrice && product.compareAtPrice > product.price ? (
              <p className="text-sm text-muted-foreground line-through sm:text-base">{formatPrice(product.compareAtPrice)}</p>
            ) : null}
          </div>
          <p className="mt-4 text-sm leading-relaxed text-foreground/90 sm:text-base">{product.description}</p>

          <div className="mt-6">
            <AddToCart
              productId={product.id}
              slug={product.slug}
              name={product.name}
              image={images[0] ?? ""}
              variants={product.variants}
              basePrice={product.price}
            />
          </div>

          <dl className="mt-6 space-y-1 text-sm text-muted-foreground">
            <div className="flex gap-2"><dt>Catégorie :</dt><dd>{product.category?.name ?? "—"}</dd></div>
            <div className="flex gap-2"><dt>Réf :</dt><dd>{product.sku ?? "—"}</dd></div>
            <div className="flex gap-2"><dt>Livraison :</dt><dd>24–72 h Abidjan · paiement à la livraison</dd></div>
          </dl>
        </div>
      </div>

      {/* Avis */}
      <section aria-labelledby="avis-titre" className="mt-14">
        <h2 id="avis-titre" className="font-serif text-2xl">Avis clients ({reviewCount})</h2>
        {product.reviews.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">Sois le premier à donner ton avis après ton achat.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {product.reviews.map((r) => (
              <li key={r.id} className="rounded-lg border p-4">
                <p className="flex items-center gap-2 text-sm">
                  <span aria-label={`${r.rating} sur 5`}>
                    {"★".repeat(r.rating)}{"☆".repeat(5 - r.rating)}
                  </span>
                  <span className="font-semibold">{r.user.name ?? "Client vérifié"}</span>
                </p>
                {r.comment ? <p className="mt-2 text-sm">{r.comment}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Similaires */}
      {related.length > 0 ? (
        <section aria-labelledby="similaires-titre" className="mt-14">
          <h2 id="similaires-titre" className="font-serif text-2xl">Produits similaires</h2>
          <ul className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            {related.map((p) => (
              <ProductCard
                key={p.id}
                product={{
                  ...p,
                  compareAtPrice: null,
                  brand: null,
                  gender: product.gender,
                  categoryName: product.category?.name ?? null,
                  reviewCount: 0,
                  avgRating: null,
                  images: parseJsonStringArray(p.images),
                }}
              />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
