import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MessageCircle, Sparkles, Truck, Undo2, Wallet } from "lucide-react";
import { GlasswareSection } from "@/components/home/glassware-section";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { NewsletterSection } from "@/components/home/newsletter-section";
import { Testimonials } from "@/components/home/testimonials";
import { FlashCountdown } from "@/components/marketing/flash-countdown";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/motion-tokens";
import { buttonVariants } from "@/components/ui/button";
import { BRAND, FREE_SHIPPING_THRESHOLD, SEO_DESCRIPTION } from "@/lib/brand";
import { parseJsonStringArray } from "@/lib/cart-pricing";
import { prisma } from "@/lib/prisma";
import { buildMetadata } from "@/lib/seo";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

const TRUST_POINTS = [
  {
    icon: Truck,
    title: "Livraison 24-48h à Abidjan",
    text: "Yango, Gozem et livreurs partenaires. Intérieur du pays en J+3 à J+5.",
  },
  {
    icon: Wallet,
    title: "Orange Money, Wave & MoMo",
    text: "Ou paiement à la livraison dans toute la ville d'Abidjan.",
  },
  {
    icon: Undo2,
    title: "Retours sous 7 jours",
    text: `Livraison offerte dès ${formatPrice(FREE_SHIPPING_THRESHOLD)} à Abidjan.`,
  },
];

// app/page.tsx — Home Revizit : hero + promo flash + catégories + verrerie + vedettes.
// app/page.tsx — home Revizit : hero, promo flash, catégories, sélection, verrerie, avis.
export const metadata: Metadata = buildMetadata({
  title: "Revizit — L'élégance africaine, ta signature gravée.",
  description: SEO_DESCRIPTION,
  path: "/",
});

export default async function HomePage() {
  const [categories, featured] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true, image: true },
    }),
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      orderBy: { createdAt: "asc" },
      select: { id: true, name: true, slug: true, price: true, images: true, gender: true },
    }),
  ]);

  return (
    <div>
      <HeroCarousel />
      <FlashCountdown />

      {/* Catégories */}
      <section aria-labelledby="categories-titre" className="container-shop py-14">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Nos univers</p>
              <h2 id="categories-titre" className="mt-2 font-serif text-3xl">
                Mode &amp; verrerie Revizit
              </h2>
            </div>
            <Link href="/products" className={cn(buttonVariants({ variant: "gold-outline" }), "hidden sm:inline-flex")}>
              Tout voir <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </Reveal>
        <Stagger className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {categories.map((c) => (
            <StaggerItem key={c.id} className="h-full">
              <Link
                href={`/products?category=${c.slug}` as never}
                className="group block h-full overflow-hidden rounded-lg border"
              >
                <div className="relative aspect-[4/5]">
                  {c.image ? (
                    <Image
                      src={c.image}
                      alt={c.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" aria-hidden="true" />
                  <p className="absolute bottom-3 left-3 font-serif text-xl text-white">{c.name}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </section>

      {/* Section signature : atelier verrerie personnalisée */}
      <GlasswareSection />

      {/* Produits vedettes */}
      <section aria-labelledby="vedettes-titre" className="bg-muted/40 py-14">
        <div className="container-shop">
          <Reveal>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-gold">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Sélection du moment
            </p>
            <h2 id="vedettes-titre" className="mt-2 font-serif text-3xl">
              Pièces Revizit
            </h2>
          </Reveal>
          <Stagger className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            {featured.map((p) => {
              const images = parseJsonStringArray(p.images);
              return (
                <StaggerItem key={p.id}>
                  <div className="group h-full overflow-hidden rounded-lg border bg-background">
                    <Link href={`/products/${p.slug}`}>
                      {images[0] ? (
                        <Image
                          src={images[0]}
                          alt={p.name}
                          width={400}
                          height={400}
                          className="aspect-square w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="aspect-square bg-muted" />
                      )}
                      <div className="p-3">
                        <p className="text-sm font-medium">{p.name}</p>
                        <p className="mt-1 font-price text-sm font-semibold text-gold">
                          {formatPrice(p.price)}
                        </p>
                      </div>
                    </Link>
                  </div>
                </StaggerItem>
              );
            })}
          </Stagger>
        </div>
      </section>

      {/* Réassurance CI */}
      <section className="container-shop py-14">
        <Stagger className="grid gap-4 sm:grid-cols-3">
          {TRUST_POINTS.map(({ icon: Icon, title, text }) => (
            <StaggerItem key={title}>
              <div className="h-full rounded-lg border p-6">
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                <p className="mt-3 font-serif text-lg">{title}</p>
                <p className="mt-2 text-sm text-muted-foreground">{text}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal>
          <div className="mt-10 flex flex-col items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 p-8 text-center">
            <p className="font-serif text-2xl">{BRAND.signature}</p>
            <p className="max-w-xl text-sm text-muted-foreground">
              Une question sur un tissu, une taille ou une gravure ? L&apos;équipe Revizit répond
              sur WhatsApp en moins de 2h, de 8h à 20h.
            </p>
            <a
              href={BRAND.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ variant: "gold" }), "mt-1")}
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" />
              Écrire sur WhatsApp
            </a>
          </div>
        </Reveal>
      </section>

      <Reveal>
        <Testimonials />
      </Reveal>
      <Reveal>
        <NewsletterSection />
      </Reveal>
    </div>
  );
}

