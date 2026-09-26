import { describe, expect, it } from "vitest";
import { ORDER_STATUSES } from "@/types";
import {
  ORDER_STATUS_FALLBACK,
  ORDER_STATUS_MAP,
  canCancelOrder,
  formatDateOnly,
  formatOrderDate,
  formatOrderNumber,
  getOrderStatusConfig,
} from "@/lib/order-status";

describe("ORDER_STATUS_MAP", () => {
  it("couvre tous les statuts de commande", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_MAP[status]).toBeDefined();
    }
  });

  it("libellés en français", () => {
    expect(ORDER_STATUS_MAP.PENDING.label).toBe("En attente");
    expect(ORDER_STATUS_MAP.PAID.label).toBe("Payée");
    expect(ORDER_STATUS_MAP.SHIPPED.label).toBe("Expédiée");
    expect(ORDER_STATUS_MAP.DELIVERED.label).toBe("Livrée");
    expect(ORDER_STATUS_MAP.CANCELLED.label).toBe("Annulée");
  });

  it("chaque statut possède des classes de badge", () => {
    for (const status of ORDER_STATUSES) {
      expect(ORDER_STATUS_MAP[status].badgeClass.length).toBeGreaterThan(0);
    }
  });
});

describe("getOrderStatusConfig", () => {
  it("renvoie la config du statut connu", () => {
    expect(getOrderStatusConfig("DELIVERED")).toEqual(ORDER_STATUS_MAP.DELIVERED);
  });

  it("retombe sur le statut inconnu si la base contient une valeur inattendue", () => {
    expect(getOrderStatusConfig("REFUNDED")).toEqual(ORDER_STATUS_FALLBACK);
    expect(getOrderStatusConfig("")).toEqual(ORDER_STATUS_FALLBACK);
  });
});

describe("canCancelOrder", () => {
  it("autorise l'annulation avant expédition", () => {
    expect(canCancelOrder("PENDING")).toBe(true);
    expect(canCancelOrder("PAID")).toBe(true);
  });

  it("refuse l'annulation une fois expédiée, livrée ou déjà annulée", () => {
    expect(canCancelOrder("SHIPPED")).toBe(false);
    expect(canCancelOrder("DELIVERED")).toBe(false);
    expect(canCancelOrder("CANCELLED")).toBe(false);
    expect(canCancelOrder("INCONNU")).toBe(false);
  });
});

describe("formatOrderNumber", () => {
  it("affiche les 8 derniers caractères en majuscules", () => {
    expect(formatOrderNumber("cm3k9x2ya0001abcdj4f8xqu")).toBe("DJ4F8XQU");
  });

  it("gère les identifiants courts", () => {
    expect(formatOrderNumber("abc")).toBe("ABC");
  });
});

describe("formatOrderDate", () => {
  it("formate une date française avec l'heure", () => {
    const formatted = formatOrderDate(new Date("2026-09-26T14:30:00Z"));
    expect(formatted.replace(/[\s\u202f\u00a0]/g, " ")).toContain("2026");
    expect(formatted).toMatch(/\d{2}:\d{2}/);
  });

  it("accepte une date au format chaîne ISO", () => {
    const date = new Date("2026-01-05T09:05:00Z");
    expect(formatOrderDate(date.toISOString())).toBe(formatOrderDate(date));
  });
});

describe("formatDateOnly", () => {
  it("formate une date sans l'heure", () => {
    const formatted = formatDateOnly(new Date("2026-09-26T14:30:00Z"));
    expect(formatted.replace(/[\s\u202f\u00a0]/g, " ")).toContain("2026");
    expect(formatted).not.toMatch(/\d{2}:\d{2}/);
  });
});
