// lib/brand.ts — identité Revizit (PURE, testable sans DOM).
// Source : revizit.md — Afro-Luxe. Toute donnée de marque vit ici.

export const BRAND = {
  name: "Revizit",
  /** Signature de marque (section 1.1). */
  signature: "L'élégance africaine, ta signature gravée.",
  /** Slogan alternatif (section 1.1). */
  slogan: "Ton héritage. Ton style. Ta Revizit.",
  domain: "revizit.ci",
  url: "https://revizit.ci",
  city: "Abidjan",
  country: "Côte d'Ivoire",
  countryCode: "CI",
  locale: "fr_CI",
  /** WhatsApp SAV (section 17) — numéro de démonstration. */
  whatsapp: "+2250585231985",
  whatsappUrl: "https://wa.me/2250585231985",
} as const;

export const SEO_DESCRIPTION =
  "Boutique en ligne de vêtements africains exclusifs (Wax, Bogolan, Kita) et verrerie gravée personnalisée à Abidjan. Livraison 24h, paiement Orange Money, Wave, MoMo.";

export const SEO_KEYWORDS = [
  "vêtements africains Abidjan",
  "Wax CI",
  "Bogolan Abidjan",
  "coupe à vin personnalisée",
  "verrerie gravée",
  "mode africaine Côte d'Ivoire",
];

/** URL de l'image Open Graph (générée par app/opengraph-image.tsx). */
export const OG_IMAGE = "/opengraph-image";

/** Moyens de paiement affichés (section 17). */
export const PAYMENT_METHODS = [
  "Orange Money",
  "Wave",
  "MTN MoMo",
  "Moov Money",
] as const;

/** Codes promo & avantages (section 18). */
export const PROMO_CODES = {
  BIENVENUE10: {
    code: "BIENVENUE10",
    label: "-10% première commande",
    percent: 10,
  },
  REVIZIT15: {
    code: "REVIZIT15",
    label: "-15% panier abandonné (24h)",
    percent: 15,
  },
  LANCEMENT25: {
    code: "LANCEMENT25",
    label: "-25% offre de lancement",
    percent: 25,
  },
} as const;

/** Seuil de livraison offerte (FCFA) — cohérent avec lib/checkout.ts. */
export const FREE_SHIPPING_THRESHOLD = 50000;

/** Gravure offerte à partir de N coupes (section 18). */
export const FREE_ENGRAVING_FROM = 4;

/** Tarif dégressif verrerie (section 8). */
export const GLASS_PRICING = [
  { quantity: 1, label: "1 coupe", price: 8000 },
  { quantity: 2, label: "2 coupes", price: 15000 },
  { quantity: 4, label: "4 coupes", price: 28000 },
  { quantity: 6, label: "6 coupes", price: 39000 },
  { quantity: 12, label: "12+ coupes", price: 69000 },
] as const;

/** Délais de livraison (section 17). */
export const SHIPPING_ZONES = [
  { zone: "Abidjan (Cocody, Plateau, Marcory, Yopougon)", delay: "24h – 48h" },
  { zone: "Intérieur (Bouaké, Yamoussoukro, San-Pédro)", delay: "J+3 – J+5" },
  {
    zone: "International (DHL — Sénégal, Burkina, Mali, France)",
    delay: "5 – 10 jours",
  },
] as const;
