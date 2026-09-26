import type { Metadata } from "next";
import { Suspense } from "react";
import { CatalogFiltersPanel } from "@/components/product/catalog-filters";
import { Pagination } from "@/components/product/pagination";
import { ProductGrid } from "@/components/product/product-grid";
import { getCatalogFacets, searchProducts } from "@/lib/catalog";
import { buildMetadata } from "@/lib/seo";
import { catalogFiltersSchema } from "@/lib/validators/catalog";

export const metadata: Metadata = buildMetadata({
  title: "Catalogue",
  description:
    "Découvre la collection Revizit : wax, bogolan et kita pour homme et femme, plus la verrerie gravée personnalisée.",
  path: "/products",
});

// app/(shop)/products/page.tsx — catalogue + filtres + tri + pagination + recherche.
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const flat: Record<string, string> = {};
  for (const [k, v] of Object.entries(searchParams)) {
    if (typeof v === "string") flat[k] = v;
    else if (Array.isArray(v) && v[0]) flat[k] = v[0];
  }
  // Valeurs invalides → défauts (jamais de crash 500 sur query malformée).
  const filters = catalogFiltersSchema.safeParse(flat).success
    ? catalogFiltersSchema.parse(flat)
    : catalogFiltersSchema.parse({});
  const safePage = filters.page;

  const [result, facets] = await Promise.all([searchProducts({ ...filters, page: safePage }), getCatalogFacets()]);

  const baseQuery = new URLSearchParams(flat);
  baseQuery.delete("page");

  return (
    <div className="container-shop py-10">
      <h1 className="font-serif text-4xl">Catalogue</h1>
      <p className="mt-2 text-muted-foreground">Robes, chemises, denim & accessoires — prix en FCFA.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[260px_1fr]">
        <aside aria-label="Filtres">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement des filtres…</p>}>
            <CatalogFiltersPanel facets={facets} initial={filters} total={result.total} />
          </Suspense>
        </aside>
        <div>
          <ProductGrid products={result.products} />
          <Pagination page={result.page} pageCount={result.pageCount} baseQuery={baseQuery.toString()} />
        </div>
      </div>
    </div>
  );
}
