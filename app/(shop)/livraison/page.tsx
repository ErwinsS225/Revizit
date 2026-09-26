import type { Metadata } from "next";
import { Clock, MapPin, PackageCheck, Truck } from "lucide-react";
import { BRAND, FREE_SHIPPING_THRESHOLD, SHIPPING_ZONES } from "@/lib/brand";
import { buildMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";

export const metadata: Metadata = buildMetadata({
  title: "Livraison & retours",
  description:
    "Livraison Revizit à Abidjan en 24-48h, intérieur du pays en J+3 à J+5, international par DHL. Retours sous 7 jours.",
  path: "/livraison",
});

// app/(shop)/livraison/page.tsx — zones de livraison, frais et retours (revizit.md §17).
export default function LivraisonPage() {
  return (
    <div className="container-shop py-10 sm:py-14">
      <header className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
          Livraison & retours
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl">
          Livré chez toi, où que tu sois à {BRAND.city}
        </h1>
        <p className="mt-3 text-muted-foreground">
          Livraison offerte dès {formatPrice(FREE_SHIPPING_THRESHOLD)} à Abidjan. En dessous de{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD)}, les frais sont indiqués avant validation de la commande.
        </p>
      </header>

      <section aria-labelledby="zones-titre" className="mt-10">
        <h2 id="zones-titre" className="font-serif text-2xl">
          Zones & délais
        </h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {SHIPPING_ZONES.map((z) => (
            <li key={z.zone} className="rounded-lg border p-5">
              <MapPin className="h-5 w-5 text-gold" aria-hidden="true" />
              <p className="mt-3 font-medium">{z.zone}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" aria-hidden="true" />
                {z.delay}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
          <Truck className="h-4 w-4 text-gold" aria-hidden="true" />
          Abidjan : Yango, Gozem et livreurs partenaires. International : DHL (Sénégal, Burkina, Mali, France).
        </p>
      </section>

      <section aria-labelledby="retours-titre" className="mt-12 max-w-3xl">
        <h2 id="retours-titre" className="font-serif text-2xl">
          Retours & échanges
        </h2>
        <div className="mt-4 space-y-3 text-muted-foreground">
          <p className="flex items-start gap-2">
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" aria-hidden="true" />
            7 jours pour demander un retour ou un échange, sous conditions (pièce non portée, étiquette intacte).
          </p>
          <p className="pl-7">
            SAV disponible sur WhatsApp au {BRAND.whatsapp} — réponse en moins de 2h de 8h à 20h.
          </p>
        </div>
      </section>
    </div>
  );
}
