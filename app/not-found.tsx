import type { Metadata } from "next";
import Link from "next/link";

// app/not-found.tsx — page 404 globale.
// `noindex` : quand `notFound()` est appelé après le début du streaming (page sous un
// `loading.tsx`), Next a déjà envoyé le statut 200. On empêche au moins l'indexation
// des URLs fantômes (produit/commande inexistants).
export const metadata: Metadata = {
  title: "Page introuvable",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container-shop py-20 text-center">
      <h1 className="font-serif text-3xl">Page introuvable</h1>
      <Link href="/" className="mt-6 inline-block underline">
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
