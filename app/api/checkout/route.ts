import { NextResponse } from "next/server";
import { createCashOrder } from "@/lib/checkout";

// app/api/checkout/route.ts — crée une commande (paiement à la livraison / Mobile Money).
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const result = await createCashOrder(body);
    return NextResponse.json({ ok: true, ...result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Commande impossible";
    const status = message.includes("Connecte-toi") ? 401 : 400;
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
