"use client";

import { useEffect, useState } from "react";
import { Gift, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PROMO_CODES } from "@/lib/brand";

const STORAGE_KEY = "revizit-welcome-popup-seen";
const CODE = PROMO_CODES.BIENVENUE10.code;

// components/marketing/welcome-popup.tsx — pop-up de bienvenue 1ère visite (revizit.md §10.1).
// Affiché une seule fois (localStorage), email facultatif, fermeture possible.
export function WelcomePopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Laisse le hero se charger avant d'afficher le pop-up.
        const t = setTimeout(() => setOpen(true), 2500);
        return () => clearTimeout(t);
      }
    } catch {
      return;
    }
  }, []);

  function close() {
    setOpen(false);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* stockage indisponible : on ignore */
    }
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-titre"
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/70 p-4 backdrop-blur-sm"
    >
      <div className="relative w-full max-w-md rounded-2xl border border-gold/40 bg-background p-6 shadow-2xl sm:p-8">
        <button
          type="button"
          onClick={close}
          aria-label="Fermer"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <Gift className="h-9 w-9 text-gold" aria-hidden="true" />
        <h2 id="welcome-popup-titre" className="mt-4 font-serif text-2xl">
          Bienvenue chez Revizit !
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          −10 % sur ta première commande avec le code{" "}
          <strong className="font-price text-foreground">{CODE}</strong>. L&apos;élégance
          africaine, ta signature gravée.
        </p>

        {sent ? (
          <p role="status" className="mt-5 rounded-lg border border-gold/40 bg-gold/10 p-4 text-sm">
            Ton code <strong className="font-price">{CODE}</strong> est confirmé. Il est aussi
            valide sans inscription.
          </p>
        ) : (
          <form
            className="mt-5 space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              // On marque le pop-up comme vu sans le fermer : la confirmation doit rester lisible.
              try {
                localStorage.setItem(STORAGE_KEY, "1");
              } catch {
                /* stockage indisponible : on ignore */
              }
              setSent(true);
            }}
          >
            <label htmlFor="welcome-email" className="block text-sm font-medium">
              Ton email
            </label>
            <input
              id="welcome-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="awa@example.ci"
              className="h-11 w-full rounded-md border border-input bg-background px-3 text-base focus:outline-none focus:ring-2 focus:ring-gold sm:text-sm"
            />
            <Button type="submit" variant="gold" className="h-11 w-full">
              Recevoir mon code
            </Button>
          </form>
        )}

        <button
          type="button"
          onClick={close}
          className="mt-4 w-full text-center text-xs text-muted-foreground underline-offset-4 hover:underline"
        >
          Non merci, je paie plein tarif
        </button>
      </div>
    </div>
  );
}