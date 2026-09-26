// lib/flash-promo.ts — logique PURE du compte à rebours promo (revizit.md §10.3).
// Testable sans DOM : aucune dépendance à React ou au navigateur.

/** Durée de la promo flash (ms) — 72h. */
export const FLASH_PROMO_DURATION_MS = 72 * 60 * 60 * 1000;

/** Remise de l'offre flash (%). */
export const FLASH_PROMO_PERCENT = 25;

export interface CountdownParts {
  hours: string;
  minutes: string;
  seconds: string;
  /** true si la promo est terminée. */
  expired: boolean;
}

/** Prochaine échéance : fin de la journée en cours (minuit heure locale), ou `now` si dépassée. */
export function nextFlashDeadline(now: Date = new Date()): Date {
  const deadline = new Date(now);
  deadline.setHours(24, 0, 0, 0);
  return deadline;
}

/** Découpe le temps restant en HH:MM:SS (bornes 00). */
export function formatCountdown(remainingMs: number): CountdownParts {
  const safe = Math.max(0, Math.floor(remainingMs / 1000));
  const hours = Math.floor(safe / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    expired: safe <= 0,
  };
}

/** Millisecondes restantes avant `deadline` (0 si dépassé). */
export function remainingMs(deadline: Date, now: Date = new Date()): number {
  return deadline.getTime() - now.getTime();
}