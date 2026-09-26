import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { productSchema, variantSchema } from "@/lib/validators/product";

// app/api/products/route.ts — liste (GET) et création (POST) de produits, réservées à l'admin.

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim() ?? "";
  const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
  const take = 20;

  const where = q
    ? {
        OR: [
          { name: { contains: q } },
          { slug: { contains: q } },
          { brand: { contains: q } },
        ],
      }
    : {};

  const [total, products] = await Promise.all([
    prisma.product.count({ where }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * take,
      take,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        stock: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    total,
    page,
    pageCount: Math.ceil(total / take),
    products,
  });
}

export async function POST(req: Request) {
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
    const product = await prisma.product.create({
      data: {
        ...data,
        images: JSON.stringify(images),
        tags: JSON.stringify(tags),
        variants: { create: variants.data },
      },
      select: { id: true, slug: true },
    });

    return NextResponse.json({ ok: true, product }, { status: 201 });
  } catch {
    // P2002 (slug/sku unique) et autres erreurs Prisma : message explicite.
    return NextResponse.json(
      { ok: false, error: "Creation impossible (slug ou SKU deja utilise ?)" },
      { status: 409 },
    );
  }
}
