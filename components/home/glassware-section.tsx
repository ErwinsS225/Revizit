import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Sparkles, Wine } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { DEFAULT_CONTENT, type ContentBlockData as GlassContent } from "@/lib/content";
import { GLASS_PRICING } from "@/lib/brand";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const STEPS = [
  { step: "01", title: "Choisis ta coupe", text: "Coupe à vin, flûte à champagne ou verre à whisky — forme classique ou design." },
  { step: "02", title: "Grave ton texte", text: "Prénom, initiales, date de mariage ou logo d'entreprise (20 caractères max)." },
  { step: "03", title: "Reçois-la en 48h", text: "Gravure laser faite main dans notre atelier d'Abidjan, livraison à domicile." },
];

// components/home/glassware-section.tsx — section signature « Atelier verrerie » (revizit.md §8).
//
// `content` vient de /admin/contenu ; sans prop, on retombe sur les valeurs
// par défaut du code, ce qui garde le composant utilisable seul.
export function GlasswareSection({ content }: { content?: GlassContent }) {
  const c = content ?? DEFAULT_CONTENT.verrerie;
  const image = c.image ?? DEFAULT_CONTENT.verrerie.image;
  const imageAlt = c.imageAlt ?? DEFAULT_CONTENT.verrerie.imageAlt;
  const ctaHref = c.ctaHref ?? "/products?category=verrerie";
  const ctaLabel = c.ctaLabel ?? "Créer ma coupe personnalisée";
  return (
    <section aria-labelledby="verrerie-titre" className="bg-ink py-16 text-ivory">
      <div className="container-shop grid items-center gap-10 lg:grid-cols-2">
        {image ? (
          <div className="relative overflow-hidden rounded-2xl">
            <Image
              src={image}
              alt={imageAlt ?? ""}
              width={1200}
              height={900}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" aria-hidden="true" />
          </div>
        ) : null}

        <div>
          <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            <Wine className="h-4 w-4" aria-hidden="true" />
            {c.eyebrow}
          </p>
          <h2 id="verrerie-titre" className="mt-2 font-serif text-3xl sm:text-4xl">
            {c.title}
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm text-ivory/75 sm:text-base">
            {c.subtitle}
          </p>

          <ol className="mt-6 space-y-4">
            {STEPS.map((s) => (
              <li key={s.step} className="flex gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gold/50 font-price text-sm font-bold text-gold">
                  {s.step}
                </span>
                <div>
                  <p className="font-serif text-lg">{s.title}</p>
                  <p className="text-sm text-ivory/70">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-6 overflow-hidden rounded-lg border border-ivory/15">
            <table className="w-full text-sm">
              <caption className="sr-only">Tarif dégressif des coupes gravées</caption>
              <thead>
                <tr className="bg-ivory/5 text-left text-ivory/70">
                  <th scope="col" className="px-4 py-2 font-medium">Quantité</th>
                  <th scope="col" className="px-4 py-2 text-right font-medium">Tarif</th>
                </tr>
              </thead>
              <tbody>
                {GLASS_PRICING.map((row) => (
                  <tr key={row.quantity} className="border-t border-ivory/10">
                    <td className="px-4 py-2">{row.label}</td>
                    <td className="px-4 py-2 text-right font-price tabular-nums text-gold">
                      {formatPrice(row.price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link href={ctaHref} className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              {ctaLabel}
            </Link>
            <span className="flex items-center gap-1.5 text-xs text-ivory/60">
              <Gift className="h-4 w-4" aria-hidden="true" />
              Emballage cadeau offert
            </span>
            <Link
              href="/products?category=verrerie"
              className="inline-flex items-center gap-1 text-sm text-ivory/70 underline-offset-4 hover:text-gold hover:underline"
            >
              Voir la collection <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}