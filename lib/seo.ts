// lib/seo.ts — helpers SEO PURE (JSON-LD). Aucune dépendance DOM.
import { BRAND, OG_IMAGE, SEO_DESCRIPTION } from "@/lib/brand";

/** Organization / LocalBusiness JSON-LD (revizit.md §9.3). */
export function organizationJsonLd(): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: BRAND.name,
    url: BRAND.url,
    slogan: BRAND.signature,
    description: SEO_DESCRIPTION,
    image: `${BRAND.url}${OG_IMAGE}`,
    telephone: BRAND.whatsapp,
    priceRange: "8000 - 500000 FCFA",
    currenciesAccepted: "XOF",
    address: {
      "@type": "PostalAddress",
      addressLocality: BRAND.city,
      addressCountry: BRAND.countryCode,
    },
    areaServed: ["CI", "SN", "BF", "ML", "FR"],
    // Doit être dérivé de BRAND.whatsappUrl : une valeur écrite en dur ici
    // créait deux numéros de téléphone différents sur le site (incohérence
    // visible par Google et pénalisant le SEO local).
    sameAs: [BRAND.whatsappUrl, BRAND.social.instagram, BRAND.social.facebook, BRAND.social.tiktok],
  };
}

/**
 * Construit les Metadata d'une page avec son canonical propre.
 * Chaque page DOIT passer par ici : une canonical posée à la racine s'hériterait
 * sur tout le site et ferait pointer chaque URL vers `/`.
 */
export function buildMetadata(input: {
  title: string;
  description: string;
  /** Chemin canonique, ex. "/products/robe-bogolan". "/" pour la home. */
  path: string;
  /**
   * Type OpenGraph. Attention : `product` n'existe PAS dans le standard OG
   * (Next.js rejette la page avec une 500). On reste sur "website" ; le type
   * produit réel est porté par le JSON-LD Product (productJsonLd).
   */
  type?: "website" | "article";
  noIndex?: boolean;
}): {
  title: string;
  description: string;
  alternates: { canonical: string };
  robots: { index: boolean; follow: boolean };
  openGraph: { title: string; description: string; url: string; type: string; siteName: string };
  twitter: { card: "summary_large_image"; title: string; description: string; images: string[] };
} {
  const url = `${BRAND.url}${input.path === "/" ? "" : input.path}`;
  return {
    title: input.title,
    description: input.description,
    alternates: { canonical: url },
    robots: { index: !input.noIndex, follow: !input.noIndex },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      type: input.type ?? "website",
      siteName: BRAND.name,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [`${BRAND.url}${OG_IMAGE}`],
    },
  };
}

/** Product JSON-LD pour la page produit (schema.org/Product). */
export function productJsonLd(input: {
  name: string;
  description: string;
  image: string;
  url: string;
  sku?: string | null;
  brand?: string | null;
  price: number;
  currency?: string;
  inStock?: boolean;
}): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: input.name,
    description: input.description,
    image: input.image,
    url: input.url,
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.brand ? { brand: { "@type": "Brand", name: input.brand } } : {}),
    offers: {
      "@type": "Offer",
      price: input.price,
      priceCurrency: input.currency ?? "XOF",
      availability: input.inStock === false
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      url: input.url,
    },
  };
}