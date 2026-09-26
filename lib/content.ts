// lib/content.ts — contenus éditoriaux de la page d'accueil.
//
// Principe : chaque section a une valeur par DÉFAUT dans le code. Si l'admin
// n'a rien enregistré (ou a désactivé le bloc), le site affiche ces valeurs.
// Aucune requête ne peut casser la home : le repli est systématique.
import { prisma } from "@/lib/prisma";
import { HERO_SLIDES } from "@/lib/hero-slides";
import { GLASS_PRICING, FREE_ENGRAVING_FROM } from "@/lib/brand";

export interface ContentBlockData {
  key: string;
  title: string;
  eyebrow: string | null;
  subtitle: string | null;
  ctaLabel: string | null;
  ctaHref: string | null;
  image: string | null;
  imageAlt: string | null;
  position: number;
}

/** Clés gérées par l'admin. Toute clé inconnue est ignorée côté serveur. */
export const CONTENT_KEYS = [
  "hero-1",
  "hero-2",
  "hero-3",
  "univers",
  "verrerie",
  "selection",
] as const;

export type ContentKey = (typeof CONTENT_KEYS)[number];

/**
 * Valeurs par défaut : reprennent à l'identique le contenu figé actuel.
 * Elles garantissent que la home reste identique tant que l'admin n'a rien
 * modifié, et servent de référence à l'interface d'administration.
 */
export const DEFAULT_CONTENT: Record<ContentKey, ContentBlockData> = {
  "hero-1": {
    key: "hero-1",
    eyebrow: HERO_SLIDES[0]?.eyebrow ?? "Collection",
    title: HERO_SLIDES[0]?.title ?? "Revizit",
    subtitle: HERO_SLIDES[0]?.subtitle ?? "",
    ctaLabel: HERO_SLIDES[0]?.ctaLabel ?? "Découvrir",
    ctaHref: HERO_SLIDES[0]?.ctaHref ?? "/products",
    image: HERO_SLIDES[0]?.image ?? null,
    imageAlt: HERO_SLIDES[0]?.imageAlt ?? "",
    position: 1,
  },
  "hero-2": {
    key: "hero-2",
    eyebrow: HERO_SLIDES[1]?.eyebrow ?? "Atelier",
    title: HERO_SLIDES[1]?.title ?? "",
    subtitle: HERO_SLIDES[1]?.subtitle ?? "",
    ctaLabel: HERO_SLIDES[1]?.ctaLabel ?? "Découvrir",
    ctaHref: HERO_SLIDES[1]?.ctaHref ?? "/products",
    image: HERO_SLIDES[1]?.image ?? null,
    imageAlt: HERO_SLIDES[1]?.imageAlt ?? "",
    position: 2,
  },
  "hero-3": {
    key: "hero-3",
    eyebrow: HERO_SLIDES[2]?.eyebrow ?? "Livraison",
    title: HERO_SLIDES[2]?.title ?? "",
    subtitle: HERO_SLIDES[2]?.subtitle ?? "",
    ctaLabel: HERO_SLIDES[2]?.ctaLabel ?? "Commander",
    ctaHref: HERO_SLIDES[2]?.ctaHref ?? "/products",
    image: HERO_SLIDES[2]?.image ?? null,
    imageAlt: HERO_SLIDES[2]?.imageAlt ?? "",
    position: 3,
  },
  univers: {
    key: "univers",
    eyebrow: "Nos univers",
    title: "Mode & verrerie Revizit",
    subtitle: null,
    ctaLabel: "Tout voir",
    ctaHref: "/products",
    image: null,
    imageAlt: null,
    position: 1,
  },
  verrerie: {
    key: "verrerie",
    eyebrow: "Atelier verrerie",
    title: "Crée ta coupe. Ta signature. Ton souvenir.",
    subtitle: `Choisis ta coupe, grave ton prénom, tes initiales ou ta date. Idéal mariages, dots, baptêmes et cadeaux d'entreprise. Gravure offerte dès ${FREE_ENGRAVING_FROM} coupes achetées.`,
    ctaLabel: "Créer ma coupe personnalisée",
    ctaHref: "/products?category=verrerie",
    image:
      "https://images.unsplash.com/photo-1446822775955-c34f483b410b?auto=format&fit=crop&w=1200&q=80",
    imageAlt: "Flûtes à champagne en cristal prêtes à être gravées",
    position: 1,
  },
  selection: {
    key: "selection",
    eyebrow: "Sélection du moment",
    title: "Pièces Revizit",
    subtitle: null,
    ctaLabel: null,
    ctaHref: null,
    image: null,
    imageAlt: null,
    position: 1,
  },
};

/** Tarif verrerie exposé à l'admin (lecture seule, pour l'affichage). */
export const GLASS_PRICING_ROWS = GLASS_PRICING;

/**
 * Charge les blocs publiés et fusionne avec les valeurs par défaut.
 * Un champ laissé vide en base retombe sur la valeur par défaut : impossible
 * de « casser » une section en enregistrant un formulaire à moitié rempli.
 */
export async function getContent(): Promise<Record<ContentKey, ContentBlockData>> {
  const result = { ...DEFAULT_CONTENT };

  try {
    const rows = await prisma.contentBlock.findMany({
      where: { isActive: true, key: { in: [...CONTENT_KEYS] } },
      select: {
        key: true,
        title: true,
        eyebrow: true,
        subtitle: true,
        ctaLabel: true,
        ctaHref: true,
        image: true,
        imageAlt: true,
        position: true,
      },
    });

    for (const row of rows) {
      if (!isContentKey(row.key)) continue;
      const fallback = DEFAULT_CONTENT[row.key];
      // `||` (et non `??`) : une chaîne vide en base doit retomber sur le défaut.
      result[row.key] = {
        key: row.key,
        title: row.title || fallback.title,
        eyebrow: row.eyebrow || fallback.eyebrow,
        subtitle: row.subtitle || fallback.subtitle,
        ctaLabel: row.ctaLabel || fallback.ctaLabel,
        ctaHref: row.ctaHref || fallback.ctaHref,
        image: row.image || fallback.image,
        imageAlt: row.imageAlt || fallback.imageAlt,
        position: row.position,
      };
    }
  } catch (e) {
    // La home ne doit jamais planter à cause du contenu éditorial.
    console.error("[content] chargement impossible, repli sur les valeurs par défaut :", e);
  }

  return result;
}

/** Garde de type : la clé vient de la base, elle peut être inconnue. */
export function isContentKey(value: string): value is ContentKey {
  return (CONTENT_KEYS as readonly string[]).includes(value);
}