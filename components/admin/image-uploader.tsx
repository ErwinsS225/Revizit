"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/admin/image-uploader.tsx — téléversement d'image vers Supabase Storage.
// L'URL reste modifiable à la main : upload et saisie directe coexistent.
export function ImageUploader({
  value,
  onChange,
  folder,
  alt,
}: {
  /** URL courante. */
  value: string;
  /** Rappelée avec la nouvelle URL (ou "" pour effacer). */
  onChange: (url: string) => void;
  /** Dossier de destination côté Supabase. */
  folder: string;
  /** Texte alternatif utilisé pour l'aperçu. */
  alt?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    const body = new FormData();
    body.append("file", file);
    body.append("folder", folder);

    try {
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const data = (await res.json()) as { ok: boolean; url?: string; error?: string };
      if (!res.ok || !data.ok || !data.url) {
        setError(data.error ?? "Envoi impossible");
        return;
      }
      onChange(data.url);
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setBusy(false);
    }
  }

  const inputClass =
    "h-11 w-full rounded-md border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-terracotta sm:text-sm";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="block text-sm font-medium">Image</span>
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            Retirer l&apos;image
          </button>
        ) : null}
      </div>

      {value ? (
        <div className="overflow-hidden rounded-lg border bg-muted/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt={alt || "Aperçu"} className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-lg border border-dashed bg-muted/20">
          <ImagePlus className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          // Reset pour pouvoir renvoyer le même fichier juste après.
          e.target.value = "";
        }}
      />

      <Button
        type="button"
        variant="outline"
        disabled={busy}
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
            {value ? "Remplacer l'image" : "Téléverser une image"}
          </>
        )}
      </Button>

      <label className="sr-only" htmlFor="image-url">
        URL de l&apos;image
      </label>
      <input
        id="image-url"
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="…ou collez une URL https://"
        className={inputClass}
      />

      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <p className="text-xs text-muted-foreground">
        JPG, PNG, WebP ou AVIF · 5 Mo maximum
      </p>
    </div>
  );
}