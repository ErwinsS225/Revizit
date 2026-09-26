"use client";

import { useState } from "react";
import { MailCheck, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/home/newsletter-section.tsx — section newsletter complète (Client).
export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      return;
    }
    try {
      const stored = JSON.parse(localStorage.getItem("revizit-newsletter") ?? "[]") as string[];
      if (!stored.includes(email.trim().toLowerCase())) {
        stored.push(email.trim().toLowerCase());
        localStorage.setItem("revizit-newsletter", JSON.stringify(stored));
      }
      setStatus("done");
    } catch {
      setStatus("done");
    }
  }

  return (
    <section aria-labelledby="newsletter-titre" className="bg-ink py-14 text-ivory">
      <div className="container-shop grid items-center gap-8 md:grid-cols-2">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Club Revizit
          </p>
          <h2 id="newsletter-titre" className="mt-2 font-serif text-3xl">
            −10 % sur ta première commande
          </h2>
          <p className="mt-3 text-sm text-ivory/80">
            Nouveautés, ventes privées et codes promo — 1 email par semaine, zéro spam.
            Désinscription en 1 clic.
          </p>
        </div>
        <div>
          {status === "done" ? (
            <p role="status" className="flex items-center gap-2 rounded-lg bg-ivory/10 p-4 text-sm">
              <MailCheck className="h-5 w-5 text-gold" aria-hidden="true" />
              Merci ! Ton code <strong className="font-price">BIENVENUE10</strong> arrive par
              email. À très vite !
            </p>
          ) : (
            <form onSubmit={handleSubmit} noValidate={false}>
              <label htmlFor="home-newsletter-email" className="text-sm font-medium">
                Ton adresse email
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="home-newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="awa@example.ci"
                  aria-invalid={status === "error"}
                  aria-describedby={status === "error" ? "home-newsletter-error" : undefined}
                  className="h-11 w-full rounded-md border border-ivory/25 bg-ivory/10 px-3 text-base text-ivory placeholder:text-ivory/50 focus:outline-none focus:ring-2 focus:ring-gold sm:text-sm"
                />
                <Button type="submit" variant="gold" size="lg" className="h-11 shrink-0">
                  <Send className="h-4 w-4" /> Je m&apos;inscris
                </Button>
              </div>
              {status === "error" ? (
                <p id="home-newsletter-error" role="alert" className="mt-2 text-sm text-red-300">
                  Vérifie ton adresse email (ex : awa@example.ci).
                </p>
              ) : null}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
