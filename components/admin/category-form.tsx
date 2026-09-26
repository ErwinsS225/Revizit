"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { slugify } from "@/lib/utils";

// components/admin/category-form.tsx — création/édition d'une catégorie.
// Mêmes règles que categoryCreateSchema côté serveur (l'API revalide le payload).
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Nom requis (2 caractères min)")
    .max(60, "Nom trop long (60 caractères max)"),
  slug: z
    .string()
    .min(2, "Slug requis (2 caractères min)")
    .max(60, "Slug trop long (60 caractères max)")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug : minuscules, chiffres et tirets uniquement"),
});

type FormValues = z.infer<typeof formSchema>;

interface CategoryFormProps {
  category?: { id: string; name: string; slug: string };
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const isEdit = category !== undefined;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
    },
  });

  const nameValue = watch("name");

  async function onSubmit(values: FormValues) {
    const endpoint = isEdit && category ? `/api/categories/${category.id}` : "/api/categories";
    setBusy(true);
    try {
      const res = await fetch(endpoint, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const body = (await res.json().catch(() => null)) as { ok?: boolean; error?: string } | null;
      if (!res.ok || !body?.ok) {
        toast.error(body?.error ?? "Enregistrement impossible");
        return;
      }
      toast.success(isEdit ? "Catégorie mise à jour" : "Catégorie créée");
      router.push("/admin/categories");
      router.refresh();
    } catch {
      toast.error("Erreur réseau, réessaie");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-4" noValidate>
      <div>
        <Label htmlFor="category-name">Nom *</Label>
        <Input id="category-name" {...register("name")} placeholder="ex: Robes d'été" />
        {errors.name ? <p className="mt-1 text-xs text-destructive">{errors.name.message}</p> : null}
      </div>
      <div>
        <Label htmlFor="category-slug">Slug (URL) *</Label>
        <div className="flex gap-2">
          <Input id="category-slug" {...register("slug")} placeholder="robes-ete" />
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
        {errors.slug ? <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p> : null}
      </div>
      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={busy} className="h-11 px-6">
          {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isEdit ? "Enregistrer" : "Créer la catégorie"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11"
          onClick={() => router.push("/admin/categories")}
        >
          Annuler
        </Button>
      </div>
    </form>
  );
}
