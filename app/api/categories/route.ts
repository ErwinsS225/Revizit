import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { categorySchema } from "@/lib/validators/product";

// app/api/categories/route.ts — création de catégorie (admin).
export async function POST(req: Request) {
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
    const category = await prisma.category.create({
      data: { name, slug },
      select: { id: true, name: true, slug: true },
    });
    return NextResponse.json({ ok: true, category }, { status: 201 });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Creation impossible (slug deja utilise ?)" },
      { status: 409 },
    );
  }
}
