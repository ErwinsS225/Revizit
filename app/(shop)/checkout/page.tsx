import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/checkout-form";

export const metadata: Metadata = { title: "Commander" };

// app/(shop)/checkout/page.tsx — tunnel de commande (protégé par middleware).
export default function CheckoutPage() {
  return (
    <div className="container-shop py-6 sm:py-10">
      <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl">Commander</h1>
      <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
        Livraison en Côte d&apos;Ivoire · paiement à la réception.
      </p>
      <div className="mt-6">
        <CheckoutForm />
      </div>
    </div>
  );
}

