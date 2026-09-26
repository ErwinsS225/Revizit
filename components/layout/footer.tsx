import Link from "next/link";
import { Instagram, MapPin, MessageCircle, Music2 } from "lucide-react";
import { NewsletterForm } from "@/components/layout/newsletter-form";
import { BRAND, PAYMENT_METHODS } from "@/lib/brand";
import { FOOTER_HELP_LINKS, FOOTER_SHOP_LINKS } from "@/lib/navigation";

// components/layout/footer.tsx — pied de page Revizit (Server Component).
export function Footer() {
  return (
    <footer className="mt-16 border-t bg-ink text-ivory">
      <div className="container-shop grid gap-10 py-12 md:grid-cols-4">
        <div>
          <p className="font-serif text-2xl font-bold tracking-[0.14em]">
            REVIZIT<span className="text-gold">.</span>
          </p>
          <p className="mt-3 text-sm text-ivory/70">{BRAND.signature}</p>
          <p className="mt-3 flex items-start gap-2 text-sm text-ivory/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold" aria-hidden="true" />
            {BRAND.city}, {BRAND.country} · {BRAND.domain}
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Revizit sur WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition-colors hover:border-gold hover:text-gold"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://instagram.com/revizit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Revizit sur Instagram"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition-colors hover:border-gold hover:text-gold"
            >
              <Instagram className="h-5 w-5" aria-hidden="true" />
            </a>
            <a
              href="https://tiktok.com/@revizit"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Revizit sur TikTok"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-ivory/25 transition-colors hover:border-gold hover:text-gold"
            >
              <Music2 className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <nav aria-label="Boutique">
          <p className="text-sm font-semibold text-gold">Collection</p>
          <ul className="mt-3 space-y-2 text-sm text-ivory/70">
            {FOOTER_SHOP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href as never} className="hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Aide">
          <p className="text-sm font-semibold text-gold">Aide</p>
          <ul className="mt-3 space-y-2 text-sm text-ivory/70">
            {FOOTER_HELP_LINKS.map((link) => (
              <li key={link.label}>
                <Link href={link.href as never} className="hover:text-ivory">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="text-sm font-semibold text-gold">Newsletter</p>
          <p className="mt-3 text-sm text-ivory/70">
            −10 % sur ta première commande avec le code BIENVENUE10. 1 email par semaine, zéro
            spam.
          </p>
          <NewsletterForm onDark />
        </div>
      </div>

      <div className="border-t border-ivory/15">
        <div className="container-shop flex flex-col items-center justify-between gap-3 py-5 text-xs text-ivory/60 sm:flex-row">
          <p>© {new Date().getFullYear()} {BRAND.name} — Tous droits réservés.</p>
          <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>Paiement : {PAYMENT_METHODS.join(" · ")}</span>
            <span className="hidden sm:inline" aria-hidden="true">
              ·
            </span>
            <span>Livraison 24-48h Abidjan · Retours 7 jours</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
