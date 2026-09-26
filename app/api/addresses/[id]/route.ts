import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// app/api/addresses/[id]/route.ts — suppression d'une adresse de l'utilisateur.
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ ok: false, error: "Non autorisé" }, { status: 401 });
  }

  try {
    const address = await prisma.address.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!address) {
      return NextResponse.json({ ok: false, error: "Adresse introuvable" }, { status: 404 });
    }

    if (address.userId !== session.user.id) {
      return NextResponse.json({ ok: false, error: "Accès refusé" }, { status: 403 });
    }

    await prisma.address.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur suppression adresse";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
