import { Star } from "lucide-react";
import { TESTIMONIALS } from "@/lib/testimonials";

// components/home/testimonials.tsx — marquee auto 7 avis (Server Component, CSS only).
export function Testimonials() {
  const doubled = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <section aria-labelledby="avis-titre" className="bg-muted/40 py-14">
      <div className="container-shop">
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">
          Ils nous font confiance
        </p>
        <h2 id="avis-titre" className="mt-2 text-center font-serif text-3xl">
          Ce que disent nos clients
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          4,9/5 — plus de 500 avis vérifiés en Côte d&apos;Ivoire
        </p>
      </div>

      <div
        className="testimonials-marquee mt-8 overflow-hidden"
        role="region"
        aria-label="Témoignages clients (défilement automatique, pause au survol)"
      >
        <ul className="testimonials-track flex w-max gap-4 px-4">
          {doubled.map((t, i) => (
            <li
              key={`${t.name}-${i}`}
              aria-hidden={i >= TESTIMONIALS.length}
              className="w-80 shrink-0 rounded-lg border bg-background p-5"
            >
              <p className="flex gap-0.5" aria-label={`Note : ${t.rating} sur 5`}>
                {Array.from({ length: 5 }, (_, s) => (
                  <Star
                    key={s}
                    aria-hidden="true"
                    className={`h-4 w-4 ${s < t.rating ? "fill-amber-400 text-amber-400" : "text-muted"}`}
                  />
                ))}
              </p>
              <blockquote className="mt-3 text-sm leading-relaxed">« {t.comment} »</blockquote>
              <p className="mt-4 text-sm font-semibold">{t.name}</p>
              <p className="text-xs text-muted-foreground">
                {t.city} · Achat vérifié : {t.product}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
