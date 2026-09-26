"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Timer } from "lucide-react";
import {
  FLASH_PROMO_PERCENT,
  formatCountdown,
  nextFlashDeadline,
  remainingMs,
} from "@/lib/flash-promo";

// SSR : la promo expire à minuit ; on affiche un compte à rebours neutre de 2 h.
const FLASH_FALLBACK_MS = 2 * 60 * 60 * 1000;

// components/marketing/flash-countdown.tsx — offre flash -25% avec compte à rebours (§10.3).
export function FlashCountdown() {
  const [parts, setParts] = useState(() => formatCountdown(FLASH_FALLBACK_MS));

  useEffect(() => {
    const deadline = nextFlashDeadline();
    const tick = () => setParts(formatCountdown(remainingMs(deadline)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <section
      aria-labelledby="flash-promo-titre"
      className="border-y border-gold/30 bg-gradient-to-r from-ink via-ink to-indigo-dark text-ivory"
    >
      <div className="container-shop flex flex-col items-center gap-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="flex items-center justify-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-gold sm:justify-start">
            <Timer className="h-4 w-4" aria-hidden="true" />
            Offre flash
          </p>
          <h2 id="flash-promo-titre" className="mt-1 font-serif text-2xl">
            −{FLASH_PROMO_PERCENT}% sur la collection Wax
          </h2>
          <p className="mt-1 text-sm text-ivory/70">Fin de l&apos;offre dans</p>
        </div>

        <div
          className="flex items-center gap-3"
          role="timer"
          aria-live="off"
          aria-label={`Temps restant : ${parts.hours} heures ${parts.minutes} minutes ${parts.seconds} secondes`}
        >
          {[
            [parts.hours, "heures"],
            [parts.minutes, "minutes"],
            [parts.seconds, "secondes"],
          ].map(([value, unit]) => (
            <div key={unit} className="min-w-[4.5rem] rounded-lg bg-ivory/10 px-3 py-2 text-center">
              <p className="font-price text-2xl font-bold tabular-nums text-gold">{value}</p>
              <p className="text-[0.65rem] uppercase tracking-wider text-ivory/60">{unit}</p>
            </div>
          ))}
          <Link
            href="/products?q=wax"
            className="ml-2 inline-flex h-11 items-center rounded-md bg-gold px-5 text-sm font-semibold text-ink transition-colors hover:bg-gold-dark"
          >
            J&apos;en profite
          </Link>
        </div>
      </div>
    </section>
  );
}