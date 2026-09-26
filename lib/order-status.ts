import type { OrderStatus } from "@/types";

export interface OrderStatusConfig {
  label: string;
  badgeClass: string;
}

export const ORDER_STATUS_MAP: Record<OrderStatus, OrderStatusConfig> = {
  PENDING: {
    label: "En attente",
    badgeClass: "bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/50 dark:text-amber-200 dark:border-amber-800",
  },
  PAID: {
    label: "Payée",
    badgeClass: "bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/50 dark:text-blue-200 dark:border-blue-800",
  },
  SHIPPED: {
    label: "Expédiée",
    badgeClass: "bg-purple-100 text-purple-900 border-purple-300 dark:bg-purple-950/50 dark:text-purple-200 dark:border-purple-800",
  },
  DELIVERED: {
    label: "Livrée",
    badgeClass: "bg-green-100 text-green-900 border-green-300 dark:bg-green-950/50 dark:text-green-200 dark:border-green-800",
  },
  CANCELLED: {
    label: "Annulée",
    badgeClass: "bg-red-100 text-red-900 border-red-300 dark:bg-red-950/50 dark:text-red-200 dark:border-red-800",
  },
};

/** Repli affiché si la base contient un statut inconnu du mapping. */
export const ORDER_STATUS_FALLBACK: OrderStatusConfig = {
  label: "Statut inconnu",
  badgeClass: "bg-muted text-muted-foreground border-border",
};

/** Formate une date au format français standard (ex: 26 sept. 2026 à 14:30). */
export function formatOrderDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/** Formate une date sans l'heure (ex: 26 septembre 2026). */
export function formatDateOnly(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Config de statut tolérante aux valeurs inattendues venues de la base. */
export function getOrderStatusConfig(status: string): OrderStatusConfig {
  return ORDER_STATUS_MAP[status as OrderStatus] ?? ORDER_STATUS_FALLBACK;
}

/** Le client peut annuler tant que la commande n'est pas expédiée. */
export function canCancelOrder(status: string): boolean {
  return status === "PENDING" || status === "PAID";
}

/** Numéro lisible d'une commande (8 derniers caractères de l'id, en majuscules). */
export function formatOrderNumber(orderId: string): string {
  return orderId.slice(-8).toUpperCase();
}
