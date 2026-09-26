"use client";

import Image from "next/image";
import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart-store";

interface Variant {
  id: string;
  size: string;
  color: string | null;
  stock: number;
  priceModifier: number;
}

// components/product/add-to-cart.tsx — sélecteur taille/couleur + ajout panier (Client).
export function AddToCart({
  productId,
  slug,
  name,
  image,
  variants,
  basePrice,
}: {
  productId: string;
  slug: string;
  name: string;
  image: string;
  variants: Variant[];
  basePrice: number;
}) {
  const addLine = useCartStore((s) => s.addLine);
  const sizes = [...new Set(variants.map((v) => v.size))];
  const [size, setSize] = useState<string | null>(sizes[0] ?? null);
  const colors = [...new Set(variants.filter((v) => v.size === size).map((v) => v.color ?? "—"))];
  const [color, setColor] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

  const selected = variants.find(
    (v) => v.size === size && (color === null || (v.color ?? "—") === color),
  );
  const unitPrice = basePrice + (selected?.priceModifier ?? 0);
  const stock = selected?.stock ?? 0;

  const handleAdd = () => {
    if (!selected || stock === 0) return;
    addLine(
      {
        productId,
        variantId: selected.id,
        name,
        slug,
        image,
        size: selected.size,
        color: selected.color,
        unitPrice,
        stock,
      },
      qty,
    );
    toast.success(`${name} ajouté au panier`, { description: `${qty} × ${formatPrice(unitPrice)}` });
  };

  return (
    <div className="space-y-4">
      <fieldset>
        <legend className="text-sm font-semibold">Taille</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              type="button"
              aria-pressed={size === s}
              onClick={() => { setSize(s); setColor(null); }}
              className={`min-w-11 rounded-md border px-3 py-2 text-sm ${size === s ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      {colors.length > 1 ? (
        <fieldset>
          <legend className="text-sm font-semibold">Couleur</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                aria-pressed={color === c}
                onClick={() => setColor(c)}
                className={`rounded-full border px-3 py-1.5 text-sm ${color === c ? "border-primary bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {c}
              </button>
            ))}
          </div>
        </fieldset>
      ) : null}

      <p className="text-sm" role="status">
        {stock > 0 ? (
          <span className="text-green-700">{stock} en stock</span>
        ) : (
          <span className="text-destructive">Rupture de stock</span>
        )}
        {" · "}
        <strong>{formatPrice(unitPrice)}</strong>
      </p>

      <div className="flex items-center gap-3">
        <div className="flex h-12 items-center rounded-md border">
          <button
            type="button"
            aria-label="Diminuer la quantité"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-12 w-11 items-center justify-center hover:bg-muted"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span aria-live="polite" className="w-8 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            aria-label="Augmenter la quantité"
            onClick={() => setQty((q) => Math.min(stock || 1, q + 1))}
            className="flex h-12 w-11 items-center justify-center hover:bg-muted"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <Button
          disabled={stock === 0}
          onClick={handleAdd}
          className="h-12 flex-1 text-base font-medium"
        >
          <ShoppingBag className="h-5 w-5" /> Ajouter au panier
        </Button>
      </div>

      {/* Barre d'action fixe mobile "Sticky Add to Cart" (visible seulement sur mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 shadow-lg backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="line-clamp-1 text-xs text-muted-foreground">{name}</p>
            <p className="text-base font-bold text-terracotta">{formatPrice(unitPrice)}</p>
          </div>
          <Button
            disabled={stock === 0}
            onClick={handleAdd}
            className="h-11 shrink-0 px-6 font-semibold"
          >
            <ShoppingBag className="h-4 w-4" />
            {stock === 0 ? "Épuisé" : "Ajouter"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// components/product/product-gallery.tsx — galerie avec miniature (Client).
export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];
  return (
    <div>
      <div className="relative aspect-[3/4] overflow-hidden rounded-lg border bg-muted">
        {current ? (
          <Image src={current} alt={name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" priority />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Sans image</div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="mt-3 flex gap-2" role="tablist" aria-label="Miniatures produit">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              role="tab"
              aria-selected={i === active}
              aria-label={`Voir l'image ${i + 1}`}
              onClick={() => setActive(i)}
              className={`relative h-20 w-16 overflow-hidden rounded-md border ${i === active ? "ring-2 ring-terracotta" : "opacity-70 hover:opacity-100"}`}
            >
              <Image src={src} alt="" fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
