"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/admin/manual-url-add.tsx — ajout manuel d'une URL d'image.
// Utile pour conserver des images déjà hébergées ailleurs (CDN, Unsplash).
export function ManualUrlAdd({
  onAdd,
  disabled = false,
}: {
  onAdd: (url: string) => void;
  disabled?: boolean;
}) {
  const [url, setUrl] = useState("");

  return (
    <details className="rounded-lg border bg-muted/20 p-3">
      <summary className="cursor-pointer text-xs text-muted-foreground">
        <Plus className="mr-1 inline h-3 w-3" aria-hidden="true" />
        Ajouter par URL
      </summary>
      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          const trimmed = url.trim();
          if (!trimmed || disabled) return;
          onAdd(trimmed);
          setUrl("");
        }}
      >
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
        />
        <Button type="submit" variant="ghost" size="sm" disabled={disabled || !url.trim()}>
          <Plus className="h-4 w-4" aria-label="Ajouter l'URL" />
        </Button>
        {url ? (
          <button
            type="button"
            onClick={() => setUrl("")}
            aria-label="Effacer"
            className="flex h-10 w-8 items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </form>
    </details>
  );
}