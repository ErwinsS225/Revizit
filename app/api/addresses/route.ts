import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { addressSchema } from "@/lib/validators/order";

// app/api/addresses/route.ts — crée une adresse pour l'utilisateur connecté.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Connecte-toi pour commander" }, { status: 401 });
  }
  try {
    const body: unknown = await req.json();
    const parsed = addressSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: parsed.error.errors[0]?.message ?? "Adresse invalide" }, { status: 400 });
    }
    const address = await prisma.address.create({
      data: { ...parsed.data, userId: session.user.id },
    });
    return NextResponse.json({ ok: true, address: { id: address.id } }, { status: 201 });
  } catch {
    return NextResponse.json({ ok: false, error: "Adresse impossible" }, { status: 400 });
  }
}
