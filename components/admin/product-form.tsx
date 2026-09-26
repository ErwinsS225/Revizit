"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { productSchema, variantSchema } from "@/lib/validators/product";
import { slugify } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

// components/admin/product-form.tsx — formulaire produit (création + édition).
// Le schéma client est DÉRIVÉ du schéma serveur (productSchema) afin de garder
// exactement les mêmes règles, avec images/tags/sous-catégorie saisis en texte
// brut puis convertis avant envoi (le serveur revalide avec productSchema).

const variantFormSchema = variantSchema.extend({
  color: z.string().max(30).default(""), // "" → null à la conversion
});

const formSchema = productSchema
  .omit({
    images: true,
    tags: true,
    categoryId: true,
    compareAtPrice: true,
    brand: true,
    sku: true,
    price: true,
    stock: true,
  })
  .extend({
    imagesText: z.string().min(1, "Ajoute au moins une URL d'image (une par ligne)"),
    tagsText: z.string().max(200, "Trop de tags").default(""),
    categoryId: z.string().default(""), // "" = aucune catégorie
    brand: z.string().max(60).default(""),
    sku: z.string().max(40).default(""),
    compareAtPrice: z.number().int().min(0).nullable().optional(),
    // valueAsNumber produit NaN si le champ est vidé : messages d'erreur en français.
    price: z
      .number({ invalid_type_error: "Prix requis (FCFA)" })
      .int("Prix entier requis (FCFA)")
      .min(0, "Prix positif requis"),
    stock: z
      .number({ invalid_type_error: "Stock requis" })
      .int("Stock entier requis")
      .min(0, "Stock positif requis"),
    variants: z.array(variantFormSchema).max(30).default([]),
  });

type FormValues = z.infer<typeof formSchema>;

interface ProductFormProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice: number | null;
  images: string[];
  categoryId: string | null;
  brand: string | null;
  stock: number;
  sku: string | null;
  isFeatured: boolean;
  isActive: boolean;
  tags: string[];
  gender: "MEN" | "WOMEN" | "UNISEX";
  variants: { size: string; color: string | null; stock: number; priceModifier: number }[];
}

interface ProductFormProps {
  categories: { id: string; name: string }[];
  /** Présent en édition, absent en création. */
  product?: ProductFormProduct;
}

const CREATE_DEFAULTS: FormValues = {
  name: "",
  slug: "",
  description: "",
  price: 0,
  compareAtPrice: null,
  imagesText: "",
  categoryId: "",
  brand: "",
  stock: 0,
  sku: "",
  isFeatured: false,
  isActive: true,
  tagsText: "",
  gender: "UNISEX",
  variants: [],
};

function toFormValues(product: ProductFormProduct): FormValues {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    imagesText: product.images.join("\n"),
    categoryId: product.categoryId ?? "",
    brand: product.brand ?? "",
    stock: product.stock,
    sku: product.sku ?? "",
    isFeatured: product.isFeatured,
    isActive: product.isActive,
    tagsText: product.tags.join(", "),
    gender: product.gender,
    variants: product.variants.map(({ size, color, stock, priceModifier }) => ({
      size,
      color: color ?? "",
      stock,
      priceModifier,
    })),
  };
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

const SELECT_CLASS =
  "h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta";

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isEdit = product !== undefined;

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: product ? toFormValues(product) : CREATE_DEFAULTS,
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });
  const nameValue = watch("name");

  async function onSubmit(values: FormValues) {
    const endpoint = isEdit && product ? `/api/products/${product.id}` : "/api/products";
    setBusy(true);
    try {
      // Conversion des champs texte → tableaux/NULL attendus par l'API.
      const payload = {
        name: values.name,
        slug: values.slug,
        description: values.description,
        price: values.price,
        compareAtPrice: values.compareAtPrice ?? null,
        images: values.imagesText.split("\n").map((s) => s.trim()).filter(Boolean),
        categoryId: values.categoryId || null,
        brand: values.brand || null,
        stock: values.stock,
        sku: values.sku || null,
        isFeatured: values.isFeatured,
        isActive: values.isActive,
        tags: values.tagsText.split(",").map((s) => s.trim()).filter(Boolean),
        gender: values.gender,
        variants: values.variants.map((v) => ({
          size: v.size,
          color: v.color || null,
          stock: v.stock,
          priceModifier: v.priceModifier,
        })),
      };

      // Double filet : validation client avec le schéma exact du serveur.
      const check = productSchema.safeParse(payload);
      if (!check.success) {
        toast.error(check.error.errors[0]?.message ?? "Formulaire invalide");
        return;
      }
      const variantsCheck = z.array(variantSchema).max(30).safeParse(payload.variants);
      if (!variantsCheck.success) {
        toast.error(variantsCheck.error.errors[0]?.message ?? "Variantes invalides");
        return;
      }

      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Enregistrement impossible");
        return;
      }
      toast.success(isEdit ? "Produit mis à jour" : "Produit créé");
      router.push("/admin/products");
      router.refresh();
    } catch {
      toast.error("Erreur réseau, réessaie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-3xl space-y-6" noValidate>
      {/* Identité */}
      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-lg font-semibold">Identité du produit</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-name">Nom *</Label>
            <Input id="product-name" {...register("name")} placeholder="ex: Robe d'été en lin" />
            <FieldError message={errors.name?.message} />
          </div>
          <div>
            <Label htmlFor="product-slug">Slug (URL) *</Label>
            <div className="flex gap-2">
              <Input id="product-slug" {...register("slug")} placeholder="robe-ete-lin" />
              <Button
                type="button"
                variant="outline"
                className="shrink-0"
                onClick={() => setValue("slug", slugify(nameValue), { shouldValidate: true })}
                aria-label="Générer le slug à partir du nom"
              >
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <FieldError message={errors.slug?.message} />
          </div>
        </div>
        <div>
          <Label htmlFor="product-description">Description *</Label>
          <Textarea
            id="product-description"
            rows={5}
            {...register("description")}
            placeholder="Matière, coupe, entretien…"
          />
          <FieldError message={errors.description?.message} />
        </div>
      </section>

      {/* Commercial */}
      <section className="space-y-4 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-lg font-semibold">Prix &amp; catalogue</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="product-price">Prix (FCFA) *</Label>
            <Input id="product-price" type="number" min={0} step={1} {...register("price", { valueAsNumber: true })} />
            <FieldError message={errors.price?.message} />
          </div>
          <div>
            <Label htmlFor="product-compare-at">Prix barré (optionnel)</Label>
            <Input
              id="product-compare-at"
              type="number"
              min={0}
              step={1}
              placeholder="Laisser vide si aucun"
              {...register("compareAtPrice", {
                // RHF peut rappeler setValueAs(null) (valeur par défaut) → garde defensif.
                setValueAs: (v: unknown) => {
                  const raw = v == null ? "" : String(v);
                  return raw.trim() === "" ? null : Number(raw);
                },
              })}
            />
            <FieldError message={errors.compareAtPrice?.message} />
          </div>
          <div>
            <Label htmlFor="product-stock">Stock global *</Label>
            <Input id="product-stock" type="number" min={0} step={1} {...register("stock", { valueAsNumber: true })} />
            <FieldError message={errors.stock?.message} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="product-category">Catégorie</Label>
            <select id="product-category" className={SELECT_CLASS} {...register("categoryId")}>
              <option value="">— Aucune —</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <FieldError message={errors.categoryId?.message} />
          </div>
          <div>
            <Label htmlFor="product-gender">Genre</Label>
            <select id="product-gender" className={SELECT_CLASS} {...register("gender")}>
              <option value="UNISEX">Unisexe</option>
              <option value="WOMEN">Femme</option>
              <option value="MEN">Homme</option>
            </select>
            <FieldError message={errors.gender?.message} />
          </div>
          <div>
            <Label htmlFor="product-brand">Marque</Label>
            <Input id="product-brand" {...register("brand")} placeholder="ex: Maison Nour" />
            <FieldError message={errors.brand?.message} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="product-sku">SKU (référence interne)</Label>
            <Input id="product-sku" {...register("sku")} placeholder="ex: RN-ROBE-001" />
            <FieldError message={errors.sku?.message} />
          </div>
          <div>
            <Label htmlFor="product-tags">Tags (séparés par des virgules)</Label>
            <Input id="product-tags" {...register("tagsText")} placeholder="lin, été, nouvelle-collection" />
            <FieldError message={errors.tagsText?.message} />
          </div>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-terracotta" {...register("isActive")} />
            Produit actif (visible en boutique)
          </label>
          <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-terracotta" {...register("isFeatured")} />
            Mettre en avant (carrousel)
          </label>
        </div>
      </section>

      {/* Images */}
      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <h2 className="font-serif text-lg font-semibold">Images</h2>
        <div>
          <Label htmlFor="product-images">URLs (une par ligne, HTTPS)</Label>
          <Textarea
            id="product-images"
            rows={4}
            {...register("imagesText")}
            placeholder={"https://images.unsplash.com/photo-…\nhttps://images.unsplash.com/photo-…"}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            La première image est utilisée comme vignette dans les listes.
          </p>
          <FieldError message={errors.imagesText?.message} />
        </div>
      </section>

      {/* Variantes */}
      <section className="space-y-3 rounded-xl border bg-card p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-serif text-lg font-semibold">Variantes (taille / couleur)</h2>
            <p className="text-xs text-muted-foreground">
              Optionnel : gère le stock par taille si le produit en propose.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => append({ size: "", color: "", stock: 0, priceModifier: 0 })}
          >
            <Plus className="mr-1.5 h-4 w-4" aria-hidden="true" /> Ajouter
          </Button>
        </div>
        <FieldError message={errors.variants?.message} />
        <ul className="space-y-3">
          {fields.map((field, index) => (
            <li key={field.id} className="flex flex-wrap items-end gap-3 rounded-lg border p-3">
              <div className="min-w-[90px] flex-1">
                <Label htmlFor={`variant-size-${index}`}>Taille *</Label>
                <Input id={`variant-size-${index}`} placeholder="S" {...register(`variants.${index}.size`)} />
                <FieldError message={errors.variants?.[index]?.size?.message} />
              </div>
              <div className="min-w-[110px] flex-1">
                <Label htmlFor={`variant-color-${index}`}>Couleur</Label>
                <Input id={`variant-color-${index}`} placeholder="Terre cuite" {...register(`variants.${index}.color`)} />
                <FieldError message={errors.variants?.[index]?.color?.message} />
              </div>
              <div className="w-24">
                <Label htmlFor={`variant-stock-${index}`}>Stock *</Label>
                <Input
                  id={`variant-stock-${index}`}
                  type="number"
                  min={0}
                  step={1}
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                />
                <FieldError message={errors.variants?.[index]?.stock?.message} />
              </div>
              <div className="w-32">
                <Label htmlFor={`variant-mod-${index}`}>Ajust. prix</Label>
                <Input
                  id={`variant-mod-${index}`}
                  type="number"
                  step={1}
                  {...register(`variants.${index}.priceModifier`, { valueAsNumber: true })}
                />
                <FieldError message={errors.variants?.[index]?.priceModifier?.message} />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(index)}
                aria-label={`Supprimer la variante ${index + 1}`}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ul>
        {fields.length === 0 ? (
          <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            Aucune variante. Le stock est géré au niveau du produit.
          </p>
        ) : null}
      </section>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={busy} className="h-11 px-6">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isEdit ? "Enregistrer les modifications" : "Créer le produit"}
        </Button>
        <Button type="button" variant="outline" className="h-11" onClick={() => router.push("/admin/products")}>
          Annuler
        </Button>
      </div>
    </form>
  );
}

