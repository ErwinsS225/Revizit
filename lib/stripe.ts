import Stripe from "stripe";

// lib/stripe.ts — client Stripe lazy (n'explose pas si clé absente en dev/test).
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (stripeInstance) return stripeInstance;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key.includes("...")) {
    throw new Error("STRIPE_SECRET_KEY manquante — renseigne .env.local (clé test sk_test_...)");
  }
  stripeInstance = new Stripe(key);
  return stripeInstance;
}

/** Montant minimum Stripe en centimes (0,50 €). */
export const MIN_CHARGE_CENTS = 50;
