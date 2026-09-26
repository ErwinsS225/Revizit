import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { categorySchema } from "@/lib/validators/product";

// app/api/categories/[id]/route.ts — édition et suppression d'une catégorie (admin).

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const body: unknown = await req.json();
    const parsed = categorySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0]?.message ?? "Categorie invalide" },
        { status: 400 },
      );
    }
    const { name, slug } = parsed.data;
    const category = await prisma.category.update({
      where: { id: params.id },
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ ok: true, category });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Edition impossible (categorie introuvable ou slug deja utilise)" },
      { status: 409 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    await prisma.category.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "Suppression impossible : des produits sont rattaches a cette categorie.",
      },
      { status: 409 },
    );
  }
}
