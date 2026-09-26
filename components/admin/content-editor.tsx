"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";

// components/admin/content-editor.tsx — édition d'un bloc éditorial (admin).
export interface BlockDraft {
  key: string;
  title: string;
  eyebrow: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
  isActive: boolean;
  isPersisted: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  title: "Titre",
  eyebrow: "Sur-titre",
  subtitle: "Texte",
  ctaLabel: "Bouton (libellé)",
  ctaHref: "Bouton (lien)",
  image: "URL de l'image",
  imageAlt: "Texte alternatif (accessibilité)",
};

export function ContentEditor({
  label,
  hint,
  block,
  fields,
}: {
  label: string;
  hint: string;
  block: BlockDraft;
  fields: (keyof BlockDraft)[];
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<BlockDraft>(block);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BlockDraft>(key: K, value: BlockDraft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
    if (status !== "idle") setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: draft.key,
          title: draft.title,
          eyebrow: draft.eyebrow || null,
          subtitle: draft.subtitle || null,
          ctaLabel: draft.ctaLabel || null,
          ctaHref: draft.ctaHref || null,
          image: draft.image || null,
          imageAlt: draft.imageAlt || null,
          isActive: draft.isActive,
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Enregistrement impossible");
        setStatus("error");
        return;
      }
      setStatus("saved");
      setDraft((d) => ({ ...d, isPersisted: true }));
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setStatus("error");
    }
  }

  async function reset() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch(`/api/admin/content?key=${encodeURIComponent(draft.key)}`, {
        method: "DELETE",
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Réinitialisation impossible");
        setStatus("error");
        return;
      }
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setStatus("error");
    }
  }
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-serif text-lg">{label}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
            draft.isPersisted
              ? "bg-green-500/10 text-green-700 dark:text-green-400"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {draft.isPersisted ? "Personnalisé" : "Valeur par défaut"}
        </span>
      </div>

      <div className="mt-4 space-y-4">
        {/* `image` et `imageAlt` ont leur propre rendu ci-dessous. */}
        {fields
          .filter((field) => field !== "image")
          .map((field) => (
          <div key={field}>
            <label htmlFor={`${draft.key}-${field}`} className="block text-sm font-medium">
              {FIELD_LABELS[field] ?? field}
            </label>
            {field === "subtitle" ? (
              <textarea
                id={`${draft.key}-${field}`}
                rows={3}
                value={String(draft[field] ?? "")}
                onChange={(e) => set(field, e.target.value as BlockDraft[typeof field])}
                className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-terracotta sm:text-sm"
              />
            ) : (
              <input
                id={`${draft.key}-${field}`}
                type="text"
                value={String(draft[field] ?? "")}
                onChange={(e) => set(field, e.target.value as BlockDraft[typeof field])}
                className="mt-1.5 h-11 w-full rounded-md border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-terracotta sm:text-sm"
              />
            )}
          </div>
          ))}

        {/* Upload + aperçu, à la place du simple champ texte. */}
        {fields.includes("image") ? (
          <ImageUploader
            value={draft.image}
            alt={draft.imageAlt}
            folder="contenu"
            onChange={(url) => set("image", url)}
          />
        ) : null}

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={draft.isActive}
            onChange={(e) => set("isActive", e.target.checked)}
            className="h-4 w-4 rounded border-input"
          />
          Publier cette section
        </label>

        {error ? (
          <p
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
          >
            {error}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-1">
          <Button onClick={save} disabled={status === "saving"} variant="terracotta">
            {status === "saving" ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…
              </>
            ) : status === "saved" ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Enregistré
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" /> Enregistrer
              </>
            )}
          </Button>
          {draft.isPersisted ? (
            <Button onClick={reset} disabled={status === "saving"} variant="ghost">
              <RotateCcw className="mr-2 h-4 w-4" /> Valeur par défaut
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}