"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Loader2, Star, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ManualUrlAdd } from "@/components/admin/manual-url-add";

// components/admin/image-gallery.tsx — galerie d'images produit (upload + réordonnancement).
//
// La première image de la liste est la principale : vignette dans les listes,
// image d'en-tête sur la fiche produit. L'ordre se règle avec les flèches
// plutôt qu'à la souris : plus fiable au mobile et accessible au clavier.
export function ImageGallery({
  value,
  onChange,
  max = 8,
  folder = "produits",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  max?: number;
  folder?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFiles(files: FileList) {
    const room = max - value.length;
    if (room <= 0) {
      setError(`Maximum ${max} images par produit.`);
      return;
    }
    // Le surplus est ignoré silencieusement plutôt que de faire échouer l'envoi.
    const list = Array.from(files).slice(0, room);
    if (list.length === 0) return;

    setBusy(true);
    setError(null);
    const uploaded: string[] = [];

    for (const file of list) {
      const body = new FormData();
      body.append("file", file);
      body.append("folder", folder);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
        if (!res.ok || !data.ok || !data.url) {
          // On continue les fichiers suivants : un échec isolé ne doit pas
          // faire perdre les images déjà téléversées.
          setError(data.error ?? "Un envoi a échoué");
          continue;
        }
        uploaded.push(data.url);
      } catch {
        setError("Erreur réseau pendant l'envoi");
      }
    }

    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    setBusy(false);
  }

  function move(index: number, delta: number) {
    const target = index + delta;
    if (target < 0 || target >= value.length) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    if (item === undefined) return;
    next.splice(target, 0, item);
    onChange(next);
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  /** Promeut une image en position 0 (principale). */
  function makePrimary(index: number) {
    if (index === 0) return;
    const next = [...value];
    const [item] = next.splice(index, 1);
    if (item === undefined) return;
    next.unshift(item);
    onChange(next);
  }
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Images du produit
          <span className="ml-1 font-normal text-muted-foreground">
            ({value.length}/{max})
          </span>
        </span>
        {value.length > 0 ? (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Tout retirer
          </button>
        ) : null}
      </div>

      {value.length === 0 ? (
        <div className="flex h-28 items-center justify-center rounded-lg border border-dashed bg-muted/20 text-xs text-muted-foreground">
          Aucune image — ajoutez au moins une
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {value.map((url, i) => (
            <li key={`${url}-${i}`}>
              <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted/40">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Image ${i + 1}`} className="h-full w-full object-cover" />
                {i === 0 ? (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[10px] font-semibold text-ink">
                    <Star className="h-2.5 w-2.5" aria-hidden="true" /> Principale
                  </span>
                ) : null}
              </div>

              <div className="mt-1.5 flex items-center justify-center gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`Déplacer l'image ${i + 1} avant`}
                  className="flex h-8 w-8 items-center justify-center rounded border disabled:opacity-30 hover:bg-muted"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => makePrimary(i)}
                  disabled={i === 0}
                  aria-label={`Définir l'image ${i + 1} comme principale`}
                  title="Définir comme principale"
                  className="flex h-8 w-8 items-center justify-center rounded border disabled:opacity-30 hover:bg-muted"
                >
                  <Star className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label={`Déplacer l'image ${i + 1} après`}
                  className="flex h-8 w-8 items-center justify-center rounded border disabled:opacity-30 hover:bg-muted"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => remove(i)}
                  aria-label={`Supprimer l'image ${i + 1}`}
                  className="flex h-8 w-8 items-center justify-center rounded border text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void uploadFiles(e.target.files);
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={busy || value.length >= max}
        onClick={() => inputRef.current?.click()}
        className="w-full"
      >
        {busy ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi en cours…
          </>
        ) : (
          <>
            <Upload className="mr-2 h-4 w-4" />
            {value.length === 0 ? "Téléverser des images" : "Ajouter des images"}
          </>
        )}
      </Button>

      <ManualUrlAdd
        onAdd={(url) => {
          if (value.length < max) onChange([...value, url]);
        }}
        disabled={value.length >= max}
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP ou AVIF · 5 Mo par fichier · {max} images maximum. La première sert de
        vignette.
      </p>
    </div>
  );
}