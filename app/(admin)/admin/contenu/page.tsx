import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { DEFAULT_CONTENT } from "@/lib/content";
import { ContentEditor, type BlockDraft } from "@/components/admin/content-editor";

export const metadata: Metadata = { title: "Contenu du site" };
export const dynamic = "force-dynamic";

type StoredRow = {
  key: string;
  title: string;
  eyebrow: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: string | null;
  imageAlt: string | null;
  isActive: boolean;
};

const SECTIONS: {
  key: keyof typeof DEFAULT_CONTENT;
  label: string;
  hint: string;
  fields: (keyof BlockDraft)[];
}[] = [
  {
    key: "hero-1",
    label: "Hero — diapositive 1",
    hint: "Première diapositive du carrousel, affichée à l'ouverture de la page.",
    fields: ["eyebrow", "title", "subtitle", "ctaLabel", "ctaHref", "image", "imageAlt"],
  },
  {
    key: "hero-2",
    label: "Hero — diapositive 2",
    hint: "Deuxième diapositive du carrousel.",
    fields: ["eyebrow", "title", "subtitle", "ctaLabel", "ctaHref", "image", "imageAlt"],
  },
  {
    key: "hero-3",
    label: "Hero — diapositive 3",
    hint: "Troisième diapositive du carrousel.",
    fields: ["eyebrow", "title", "subtitle", "ctaLabel", "ctaHref", "image", "imageAlt"],
  },
  {
    key: "univers",
    label: "Nos univers",
    hint: "Titres de la section catégories. Les images viennent des catégories.",
    fields: ["eyebrow", "title", "ctaLabel", "ctaHref"],
  },
  {
    key: "verrerie",
    label: "Atelier verrerie",
    hint: "Section signature : bannière, textes et bouton.",
    fields: ["eyebrow", "title", "subtitle", "ctaLabel", "ctaHref", "image", "imageAlt"],
  },
  {
    key: "selection",
    label: "Sélection du moment",
    hint: "Titres de la vitrine produits. Les produits viennent de la base.",
    fields: ["eyebrow", "title"],
  },
];

/** Fusionne la ligne stockée (si elle existe) avec les valeurs par défaut. */
function toDraft(key: string, row?: StoredRow): BlockDraft {
  const fallback = DEFAULT_CONTENT[key as keyof typeof DEFAULT_CONTENT];
  return {
    key,
    title: row?.title || fallback.title,
    eyebrow: row?.eyebrow ?? fallback.eyebrow ?? "",
    subtitle: row?.subtitle ?? fallback.subtitle ?? "",
    ctaLabel: row?.ctaLabel ?? fallback.ctaLabel ?? "",
    ctaHref: row?.ctaHref ?? fallback.ctaHref ?? "",
    image: row?.image ?? fallback.image ?? "",
    imageAlt: row?.imageAlt ?? fallback.imageAlt ?? "",
    isActive: row?.isActive ?? true,
    isPersisted: Boolean(row),
  };
}

// app/(admin)/admin/contenu/page.tsx — édition des textes et images de la home.
export default async function ContentAdminPage() {
  const rows = (await prisma.contentBlock.findMany()) as StoredRow[];

  return (
    <div>
      <header className="mb-6">
        <h1 className="font-serif text-2xl sm:text-3xl">Contenu du site</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Modifiez les textes et images de la page d&apos;accueil. Les changements sont
          visibles immédiatement sur le site.
        </p>
        <p className="mt-2 rounded-lg border border-gold/30 bg-gold/5 p-3 text-xs text-muted-foreground">
          Astuce : cliquez sur «&nbsp;Enregistrer&nbsp;» pour voir la section modifiée
          directement sur{" "}
          <Link href="/" target="_blank" className="underline hover:text-foreground">
            la page d&apos;accueil
          </Link>
          . «&nbsp;Valeur par défaut&nbsp;» annule vos modifications.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        {SECTIONS.map((section) => (
          <ContentEditor
            key={section.key}
            label={section.label}
            hint={section.hint}
            block={toDraft(section.key, rows.find((r) => r.key === section.key))}
            fields={section.fields}
          />
        ))}
      </div>
    </div>
  );
}