import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { productSchema, variantSchema } from "@/lib/validators/product";

// app/api/products/[id]/route.ts — édition (PATCH) et suppression (DELETE) d'un produit.

type Params = { params: { id: string } };

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Corps de requete invalide" }, { status: 400 });
    }
    const { variants: rawVariants, ...rest } = body as Record<string, unknown>;

    const parsed = productSchema.safeParse(rest);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0]?.message ?? "Produit invalide" },
        { status: 400 },
      );
    }
    const variants = z.array(variantSchema).max(30).safeParse(rawVariants ?? []);
    if (!variants.success) {
      return NextResponse.json(
        { ok: false, error: variants.error.errors[0]?.message ?? "Variantes invalides" },
        { status: 400 },
      );
    }

    const { images, tags, ...data } = parsed.data;
    // Remplacement intégral des variantes (l'ordre suit le formulaire).
    const product = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...data,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
        variants: { deleteMany: {}, create: variants.data },
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ ok: true, product });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Edition impossible (produit introuvable ou slug deja utilise)" },
      { status: 409 },
    );
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    await prisma.product.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch {
    // Produit référencé par une commande (FK Restrict) → refusé :
    // conseiller la désactivation (isActive = false) à la place.
    return NextResponse.json(
      {
        ok: false,
        error: "Suppression impossible : le produit figure dans des commandes. Desactive-le plutot.",
      },
      { status: 409 },
    );
  }
}
