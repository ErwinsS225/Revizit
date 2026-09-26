// lib/hero-slides.ts — contenu PURE du Hero carousel (testable sans DOM).
// 3 slides Revizit : mode africaine, verrerie gravée, confiance/paiement.
// Libellés en français, prix en FCFA. Images : Unsplash, vérifiées visuellement.

export interface HeroSlide {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  image: string;
  imageAlt: string;
}

const U = (id: string): string =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`;

export const HERO_SLIDES: HeroSlide[] = [
  {
    eyebrow: "Nouvelle collection Wax & Bogolan",
    title: "L'élégance africaine, ta signature",
    subtitle:
      "Tenues exclusives en Wax, Bogolan, Kita et Ankara — fait main à Abidjan, livrées en 24h.",
    ctaLabel: "Découvrir la collection",
    ctaHref: "/products?gender=WOMEN",
    image: U("photo-1708170372323-bd2652ca788e"),
    imageAlt: "Femme en robe jaune tenant un éventail, style afro-luxe",
  },
  {
    eyebrow: "Atelier verrerie · Gravure laser",
    title: "Crée ta coupe. Ta signature. Ton souvenir.",
    subtitle:
      "Coupe à vin & champagne gravées à ton prénom, tes initiales ou ta date. Dès 8 000 FCFA.",
    ctaLabel: "Personnaliser ma coupe",
    ctaHref: "/products?category=verrerie",
    image: U("photo-1446822775955-c34f483b410b"),
    imageAlt: "Quatre flûtes à champagne en cristal sur une table",
  },
  {
    eyebrow: "Partout en Côte d'Ivoire",
    title: "Mode exclusive & verrerie, livrées chez toi",
    subtitle:
      "Commande en ligne, règle par Orange Money, Wave ou MoMo — ou à la livraison à Abidjan.",
    ctaLabel: "Commander",
    ctaHref: "/products",
    image: U("photo-1527529482837-4698179dc6ce"),
    imageAlt: "Groupe levant des verres à pied pour célébrer un mariage",
  },
];

/** Durée d'affichage d'une slide (ms). */
export const HERO_AUTOPLAY_MS = 6000;
