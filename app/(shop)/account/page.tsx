import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarDays, Heart, Mail, Package, ShoppingBag } from "lucide-react";
import { AddressManager, type AddressItem } from "@/components/account/address-manager";
import { buttonVariants } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateOnly, formatOrderDate, formatOrderNumber, getOrderStatusConfig } from "@/lib/order-status";
import { cn, formatPrice } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mon compte",
  description: "Gérez vos informations, vos adresses de livraison et suivez vos commandes.",
};

export const dynamic = "force-dynamic";

// app/(shop)/account/page.tsx — espace client : profil, commandes récentes, carnet d'adresses.
export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?callbackUrl=/account");
  const userId = session.user.id;

  const [user, orders, wishlistCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        name: true,
        email: true,
        createdAt: true,
        addresses: { orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] },
      },
    }),
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 3,
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        _count: { select: { items: true } },
      },
    }),
    prisma.wishlist.count({ where: { userId } }),
  ]);

  if (!user) redirect("/login?callbackUrl=/account");

  const displayName = user.name ?? user.email.split("@")[0] ?? "Client";
  const initials = displayName.slice(0, 2).toUpperCase();

  const addresses: AddressItem[] = user.addresses.map((address) => ({
    id: address.id,
    fullName: address.fullName,
    street: address.street,
    city: address.city,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? "—",
    isDefault: address.isDefault,
  }));

  return (
    <div className="container-shop py-8 sm:py-12">
      <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Mon compte</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Bonjour {displayName}, retrouvez ici vos informations, vos commandes et vos adresses.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-base font-bold text-white"
              >
                {initials}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-foreground">{displayName}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                <dd className="truncate">{user.email}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" aria-hidden="true" />
                <dd>Membre depuis le {formatDateOnly(user.createdAt)}</dd>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Heart className="h-4 w-4 shrink-0" aria-hidden="true" />
                <dd>
                  {wishlistCount} favori{wishlistCount > 1 ? "s" : ""}
                </dd>
              </div>
            </dl>
          </div>

          <nav aria-label="Raccourcis du compte" className="rounded-xl border bg-card p-2 shadow-sm">
            <Link
              href="/orders"
              className="flex min-h-[44px] items-center gap-2.5 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Mes commandes
            </Link>
            <Link
              href="/wishlist"
              className="flex min-h-[44px] items-center gap-2.5 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <Heart className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Mes favoris
            </Link>
            <Link
              href="/cart"
              className="flex min-h-[44px] items-center gap-2.5 rounded-md px-3 text-sm text-foreground transition-colors hover:bg-accent"
            >
              <ShoppingBag className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              Mon panier
            </Link>
          </nav>
        </aside>

        <div className="space-y-10">
          <section aria-labelledby="recent-orders">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 id="recent-orders" className="font-serif text-xl font-bold sm:text-2xl">
                Commandes récentes
              </h2>
              <Link
                href="/orders"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "h-11 px-4")}
              >
                Toutes mes commandes
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="mt-4 rounded-xl border border-dashed p-8 text-center">
                <Package className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <p className="mt-2 text-sm text-muted-foreground">Aucune commande pour le moment.</p>
                <Link
                  href="/products"
                  className={cn(buttonVariants({ variant: "terracotta", size: "sm" }), "mt-4 h-11 px-5")}
                >
                  Découvrir le catalogue
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {orders.map((order) => {
                  const status = getOrderStatusConfig(order.status);
                  return (
                    <li key={order.id}>
                      <Link
                        href={`/orders/${order.id}`}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-4 shadow-sm transition-colors hover:bg-accent/50"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-foreground">
                            Commande {formatOrderNumber(order.id)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatOrderDate(order.createdAt)} · {order._count.items} article
                            {order._count.items > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span
                            className={cn(
                              "rounded-full border px-2.5 py-0.5 text-xs font-medium",
                              status.badgeClass,
                            )}
                          >
                            {status.label}
                          </span>
                          <span className="font-semibold">{formatPrice(order.total)}</span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section aria-labelledby="address-book" className="border-t pt-8">
            <h2 id="address-book" className="sr-only">
              Carnet d&apos;adresses
            </h2>
            <AddressManager initialAddresses={addresses} />
          </section>
        </div>
      </div>
    </div>
  );
}
