import { ProductCard } from "@/components/product/product-card";
import type { CatalogProduct } from "@/lib/catalog";
import { Stagger, StaggerItem } from "@/components/motion/motion-tokens";

// components/product/product-grid.tsx — grille animée en cascade + état vide.
export function ProductGrid({ products }: { products: CatalogProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="font-serif text-xl">Aucun produit trouvé</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Essaie d&apos;élargir tes critères (retire un filtre ou change le mot-clé).
        </p>
      </div>
    );
  }
  return (
    <Stagger className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
      {products.map((p) => (
        <StaggerItem key={p.id} className="h-full">
          <ProductCard product={p} />
        </StaggerItem>
      ))}
    </Stagger>
  );
}

