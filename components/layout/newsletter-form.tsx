"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// components/layout/newsletter-form.tsx — formulaire newsletter (Client Component isolé).
// `onDark` : variante pour fond encre (footer Revizit).
export function NewsletterForm({ onDark = false }: { onDark?: boolean }) {
  const [done, setDone] = useState(false);

  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">
        Adresse email
      </label>
      <input
        id="newsletter-email"
        type="email"
        required
        autoComplete="email"
        placeholder="ton@email.ci"
        className={cn(
          "h-10 w-full rounded-md border px-3 text-base focus:outline-none focus:ring-2 sm:text-sm",
          onDark
            ? "border-ivory/30 bg-ivory/10 text-ivory placeholder:text-ivory/50 focus:ring-gold"
            : "border-input bg-background focus:ring-gold",
        )}
      />
      <button
        type="submit"
        className={cn(
          "h-10 min-w-[44px] shrink-0 rounded-md px-4 text-sm font-medium transition-colors",
          onDark ? "bg-gold text-ink hover:bg-gold-dark" : "bg-primary text-primary-foreground",
        )}
      >
        OK
      </button>
      {done ? <span className="sr-only" role="status">Merci ! Inscription prise en compte.</span> : null}
    </form>
  );
}
