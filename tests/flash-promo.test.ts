import { describe, expect, it } from "vitest";
import {
  FLASH_PROMO_PERCENT,
  formatCountdown,
  nextFlashDeadline,
  remainingMs,
} from "@/lib/flash-promo";

describe("promo flash", () => {
  it("remise de lancement à 25%", () => {
    expect(FLASH_PROMO_PERCENT).toBe(25);
  });

  it("découpe le temps restant en HH:MM:SS", () => {
    const parts = formatCountdown(2 * 3600 * 1000 + 47 * 60 * 1000 + 13 * 1000);
    expect(parts).toEqual({ hours: "02", minutes: "47", seconds: "13", expired: false });
  });

  it("borne à zéro quand le délai est dépassé", () => {
    const parts = formatCountdown(-5000);
    expect(parts.expired).toBe(true);
    expect(parts.hours).toBe("00");
  });

  it("échéance à minuit, dans le futur", () => {
    const now = new Date("2025-03-04T21:15:00");
    const deadline = nextFlashDeadline(now);
    expect(deadline.getDate()).toBe(5);
    expect(remainingMs(deadline, now)).toBeGreaterThan(0);
  });
});