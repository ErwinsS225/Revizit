"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { Filter, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  SORT_OPTIONS,
  countActiveFilters,
  type CatalogFilters,
} from "@/lib/validators/catalog";
import { formatPrice } from "@/lib/utils";
import { DURATION, EASE } from "@/components/motion/motion-tokens";

interface Facets {
  categories: { name: string; slug: string }[];
  sizes: string[];
  colors: string[];
  maxPrice: number;
}

// components/product/catalog-filters.tsx — filtres catalogue avec drawer mobile & sync URL.
export function CatalogFiltersPanel({
  facets,
  initial,
  total,
}: {
  facets: Facets;
  initial: CatalogFilters;
  total: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(initial.q ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeCount = countActiveFilters(initial);

  const update = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(patch)) {
        if (value === undefined || value === "") params.delete(key);
        else params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const resetAll = useCallback(() => {
    setQ("");
    router.push(pathname, { scroll: false });
  }, [pathname, router]);

  const genderLabel = (g: string) => (g === "MEN" ? "Hommes" : g === "WOMEN" ? "Femmes" : "Unisexe");
  const chip = (active: boolean) =>
    `min-h-[40px] rounded-full border px-3 py-1.5 text-sm transition ${active ? "border-primary bg-primary text-primary-foreground font-semibold" : "hover:bg-muted"}`;

  const filtersForm = (
    <div className="space-y-6">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          update({ q: q.trim() || undefined });
        }}
      >
        <label htmlFor="catalog-search" className="text-sm font-semibold">Rechercher</label>
        <div className="mt-2 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              id="catalog-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Robe, chemise, sneakers…"
              className="h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <Button type="submit" size="sm" className="h-10 min-w-[44px]">OK</Button>
        </div>
      </form>

      <div>
        <label htmlFor="catalog-sort" className="text-sm font-semibold">Trier par</label>
        <select
          id="catalog-sort"
          value={initial.sort}
          onChange={(e) => update({ sort: e.target.value })}
          className="mt-2 h-10 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <fieldset>
        <legend className="text-sm font-semibold">Genre</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {[undefined, "MEN", "WOMEN", "UNISEX"].map((g) => {
            const active = (initial.gender ?? undefined) === g;
            return (
              <button key={g ?? "all"} type="button" aria-pressed={active} onClick={() => update({ gender: g })} className={chip(active)}>
                {g ? genderLabel(g) : "Tous"}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Catégorie</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" aria-pressed={!initial.category} onClick={() => update({ category: undefined })} className={chip(!initial.category)}>
            Toutes
          </button>
          {facets.categories.map((c) => (
            <button key={c.slug} type="button" aria-pressed={initial.category === c.slug} onClick={() => update({ category: c.slug })} className={chip(initial.category === c.slug)}>
              {c.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Taille</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {facets.sizes.map((s) => (
            <button key={s} type="button" aria-pressed={initial.size === s} onClick={() => update({ size: initial.size === s ? undefined : s })} className={chip(initial.size === s)}>
              {s}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-semibold">Couleur</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {facets.colors.map((c) => (
            <button key={c} type="button" aria-pressed={initial.color === c} onClick={() => update({ color: initial.color === c ? undefined : c })} className={chip(initial.color === c)}>
              {c}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="catalog-maxprice" className="text-sm font-semibold">
          Prix max : {initial.maxPrice ? formatPrice(initial.maxPrice) : "tous"}
        </label>
        <input
          id="catalog-maxprice"
          type="range"
          min={10000}
          max={facets.maxPrice}
          step={5000}
          value={initial.maxPrice ?? facets.maxPrice}
          onChange={(e) => update({ maxPrice: e.target.value })}
          className="mt-2 h-8 w-full accent-terracotta"
        />
      </div>

      {activeCount > 0 ? (
        <Button type="button" variant="outline" onClick={resetAll} className="w-full">
          Réinitialiser tous les filtres ({activeCount})
        </Button>
      ) : null}

      <p className="text-sm text-muted-foreground" role="status">
        {total} produit{total > 1 ? "s" : ""} trouvé{total > 1 ? "s" : ""}
      </p>
    </div>
  );

  return (
    <>
      {/* Bouton déclencheur mobile avec compteur de filtres actifs */}
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          onClick={() => setMobileOpen(true)}
          className="flex h-11 flex-1 items-center justify-center gap-2"
          aria-expanded={mobileOpen}
          aria-controls="catalog-filters-sheet"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filtres &amp; tri</span>
          {activeCount > 0 ? (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-terracotta px-1 text-xs font-bold text-white">
              {activeCount}
            </span>
          ) : null}
        </Button>
        <p className="text-xs text-muted-foreground whitespace-nowrap" role="status">
          {total} résultat{total > 1 ? "s" : ""}
        </p>
      </div>

      {/* Sidebar Desktop visible en lg: */}
      <div className="hidden lg:block">
        {filtersForm}
      </div>

      {/* Drawer Mobile glissant depuis le bas avec fond sombre */}
      <AnimatePresence>
        {mobileOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.fast, ease: EASE }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              aria-hidden="true"
            />

            <motion.div
              id="catalog-filters-sheet"
              role="dialog"
              aria-modal="true"
              aria-label="Filtres et options de tri"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: DURATION.base, ease: EASE }}
              className="fixed inset-x-0 bottom-0 top-16 flex flex-col rounded-t-2xl bg-background shadow-2xl"
            >
              <div className="flex items-center justify-between border-b px-5 py-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-terracotta" />
                  <h2 className="font-serif text-lg font-bold">Filtres &amp; Tri</h2>
                  {activeCount > 0 ? (
                    <span className="rounded-full bg-terracotta px-2 py-0.5 text-xs font-semibold text-white">
                      {activeCount}
                    </span>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-muted"
                  aria-label="Fermer les filtres"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 pb-24">
                {filtersForm}
              </div>

              <div className="border-t bg-background/95 p-4 backdrop-blur">
                <Button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="h-12 w-full text-base font-medium"
                >
                  Voir les {total} résultat{total > 1 ? "s" : ""}
                </Button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
