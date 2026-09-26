import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// app/api/health/route.ts — healthcheck : répond { ok:true } si la DB répond.
// `force-dynamic` est OBLIGATOIRE : sans lui, Next pré-rend la route au build et
// sert une réponse figée (`x-nextjs-cache: HIT`) qui ne reflète plus l'état réel de la DB.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [users, products, orders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
    ]);
    return NextResponse.json({ ok: true, users, products, orders });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "DB error" },
      { status: 500 },
    );
  }
}
