// lib/testimonials.ts — 7 témoignages clients Revizit (PURE, testable sans DOM).
// Personas revizit.md : Aïcha (mariée), Yann (cadre), Mariam (boss cérémonie)…
export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  comment: string;
  product: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Aïcha Koné",
    city: "Abidjan, Cocody Riviera",
    rating: 5,
    comment:
      "Ma tenue de dot en Wax est arrivée en 24h. La coupe est sublime et les coupes gravées à nos prénoms ont fait sensation !",
    product: "Ensemble Wax Pagne Premium",
  },
  {
    name: "Yann Yao",
    city: "Abidjan, Plateau",
    rating: 5,
    comment:
      "Chemise en Wax pour le bureau, reçu en 48h. La qualité du tissu est au rendez-vous, et j'ai payé par Wave à la livraison.",
    product: "Chemise wax premium",
  },
  {
    name: "Mariam Diallo",
    city: "Bouaké",
    rating: 5,
    comment:
      "Service clé en main pour le baptême de ma fille : tenues + coupes gravées, livrés à domicile. Zéro stress.",
    product: "Pack Cérémonie Mariam",
  },
  {
    name: "Ibrahim Traoré",
    city: "Abidjan, Yopougon",
    rating: 4,
    comment:
      "Ensemble Kita impeccable pour mon mariage traditionnel. Le livreur Yango est passé à l'heure convenue.",
    product: "Ensemble Kita royal",
  },
  {
    name: "Fatou Sylla",
    city: "San-Pédro",
    rating: 5,
    comment:
      "Enfin une boutique qui livre vite hors Abidjan. Le pack de 6 coupes gravées pour notre-anniversaire est magnifique.",
    product: "Pack 6 coupes gravées",
  },
  {
    name: "Koffi Mensah",
    city: "Yamoussoukro",
    rating: 5,
    comment:
      "Coupe à vin gravée avec la date de notre mariage : effet garanti à table. Conseil taille très fiable.",
    product: "Coupe à vin gravée",
  },
  {
    name: "Aïcha Bah",
    city: "Abidjan, Marcory",
    rating: 5,
    comment:
      "Bogolan authentique, la qualité du tissu est exceptionnelle. Le personnel m'a conseillé patiemment sur les tissus. Revizit, c'est ma référence.",
    product: "Robe Bogolan authentique",
  },
];

/** Durée d'un cycle complet du marquee (ms) — assez lent pour rester lisible. */
export const TESTIMONIALS_MARQUEE_MS = 30000;
