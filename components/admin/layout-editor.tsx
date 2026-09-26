"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Eye, EyeOff, GripVertical, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/admin/layout-editor.tsx — réordonnancement et masquage des sections.
export interface LayoutItem {
  key: string;
  label: string;
  position: number;
  isVisible: boolean;
  /** La section a-t-elle aussi un bloc de texte éditable ? */
  hasBlock: boolean;
}

export function LayoutEditor({ initial }: { initial: LayoutItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState<LayoutItem[]>(
    initial.map((i, idx) => ({ ...i, position: idx })),
  );
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  function move(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [item] = next.splice(from, 1);
    if (!item) return;
    next.splice(to, 0, item);
    setItems(next.map((i, idx) => ({ ...i, position: idx })));
    setStatus("idle");
  }

  function toggle(key: string) {
    setItems((prev) =>
      prev.map((i) => (i.key === key ? { ...i, isVisible: !i.isVisible } : i)),
    );
    setStatus("idle");
  }

  async function save() {
    setStatus("saving");
    setError(null);
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: items.map((i) => ({
            key: i.key,
            position: i.position,
            isVisible: i.isVisible,
          })),
        }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Enregistrement impossible");
        setStatus("error");
        return;
      }
      setStatus("saved");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
      setStatus("error");
    }
  }
  return (
    <section className="rounded-xl border bg-card p-5 sm:p-6">
      <h2 className="font-serif text-lg">Ordre et visibilité des sections</h2>
      <p className="mt-0.5 text-sm text-muted-foreground">
        Glissez une section ou utilisez les flèches pour changer l&apos;ordre d&apos;affichage.
        Décochez une section pour la retirer temporairement de la page d&apos;accueil.
      </p>

      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li
            key={item.key}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null) move(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
            className={`flex items-center gap-3 rounded-lg border bg-background p-3 transition-opacity ${
              dragIndex === index ? "opacity-40" : ""
            } ${item.isVisible ? "" : "bg-muted/50"}`}
          >
            <GripVertical className="h-4 w-4 shrink-0 cursor-grab text-muted-foreground" aria-hidden="true" />

            <div className="min-w-0 flex-1">
              <p className={`truncate text-sm font-medium ${item.isVisible ? "" : "text-muted-foreground line-through"}`}>
                {item.label}
              </p>
              {item.hasBlock ? (
                <p className="text-xs text-muted-foreground">Textes et images modifiables ci-dessous</p>
              ) : (
                <p className="text-xs text-muted-foreground">Contenu géré par le code</p>
              )}
            </div>

            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
                aria-label={`Monter ${item.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-30 hover:bg-muted"
              >
                <ArrowUp className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => move(index, index + 1)}
                disabled={index === items.length - 1}
                aria-label={`Descendre ${item.label}`}
                className="flex h-9 w-9 items-center justify-center rounded-md border disabled:opacity-30 hover:bg-muted"
              >
                <ArrowDown className="h-4 w-4" />
              </button>
              <label className="ml-1 flex cursor-pointer items-center gap-1.5 text-xs">
                <input
                  type="checkbox"
                  checked={item.isVisible}
                  onChange={() => toggle(item.key)}
                  className="h-4 w-4 rounded border-input"
                />
                {item.isVisible ? (
                  <Eye className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-4 w-4 text-destructive" aria-hidden="true" />
                )}
                <span className="sr-only">Afficher {item.label}</span>
              </label>
            </div>
          </li>
        ))}
      </ul>

      {error ? (
        <p
          role="alert"
          className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={save} disabled={status === "saving"} variant="terracotta">
          {status === "saving" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement…
            </>
          ) : status === "saved" ? (
            <>
              <Check className="mr-2 h-4 w-4" /> Disposition enregistrée
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Enregistrer la disposition
            </>
          )}
        </Button>
      </div>
    </section>
  );
}