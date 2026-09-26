import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { formatOrderNumber } from "@/lib/order-status";
import { formatPrice, cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Merci !" };

// app/(shop)/merci/[orderId]/page.tsx — confirmation de commande.
export default async function ThankYouPage({ params }: { params: { orderId: string } }) {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=/merci/${params.orderId}`);

  const order = await prisma.order.findUnique({
    where: { id: params.orderId },
    include: {
      items: { include: { product: { select: { name: true, slug: true } } } },
      address: true,
    },
  });
  // Protection contre l'énumération d'identifiants : la commande doit appartenir à l'utilisateur.
  if (!order || order.userId !== session.user.id) notFound();

  return (
    <div className="container-shop max-w-2xl py-14 text-center">
      <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" aria-hidden="true" />
      <h1 className="mt-4 font-serif text-4xl">Merci pour ta commande !</h1>
      <p className="mt-2 text-muted-foreground">
        Commande <strong>{formatOrderNumber(order.id)}</strong> · {formatPrice(order.total)} · paiement à la livraison.
      </p>
      <div className="mt-8 rounded-lg border p-5 text-left">
        <h2 className="font-serif text-xl">Détail</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.id} className="flex justify-between gap-2">
              <span>
                <Link href={`/products/${i.product.slug}`} className="font-medium hover:underline">
                  {i.product.name}
                </Link>{" "}
                <span className="text-muted-foreground">× {i.quantity}</span>
              </span>
              <span className="font-medium">{formatPrice(i.unitPrice * i.quantity)}</span>
            </li>
          ))}
        </ul>
        {order.address ? (
          <p className="mt-4 border-t pt-3 text-sm text-muted-foreground">
            Livraison : {order.address.fullName}, {order.address.street}, {order.address.city} — {order.address.phone}
          </p>
        ) : null}
      </div>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/products" className={cn(buttonVariants({ variant: "outline" }))}>
          Continuer mes achats
        </Link>
        <Link href="/orders" className={cn(buttonVariants({ variant: "terracotta" }))}>
          Suivre mes commandes
        </Link>
      </div>
    </div>
  );
}
