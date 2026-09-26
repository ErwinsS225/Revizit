import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { contentBlockSchema } from "@/lib/validators/content";
import { DEFAULT_CONTENT, isContentKey } from "@/lib/content";

// app/api/admin/content/route.ts — lecture et mise à jour des blocs éditoriaux
// de la page d'accueil. Réservées à l'administrateur.

/** GET : renvoie les valeurs en base, avec les valeurs par défaut en secours. */
export async function GET() {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const rows = await prisma.contentBlock.findMany({
    select: {
      key: true,
      title: true,
      eyebrow: true,
      subtitle: true,
      ctaLabel: true,
      ctaHref: true,
      image: true,
      imageAlt: true,
      position: true,
      isActive: true,
    },
  });

  // L'admin doit voir l'état réel de chaque section gérée, y compris celles
  // encore vierges (jamais enregistrées) : on fusionne donc les défauts.
  const merged = Object.fromEntries(
    Object.entries(DEFAULT_CONTENT).map(([key, fallback]) => {
      const row = rows.find((r) => r.key === key);
      return [
        key,
        row
          ? { ...fallback, ...row, isActive: row.isActive }
          : { ...fallback, isActive: true, isPersisted: false },
      ];
    }),
  );

  return NextResponse.json({ ok: true, blocks: merged });
}

/** POST : enregistre un bloc (upsert sur `key`). */
export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const body: unknown = await req.json();
    const parsed = contentBlockSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.errors[0];
      return NextResponse.json(
        { ok: false, error: first?.message ?? "Contenu invalide", field: first?.path[0] },
        { status: 400 },
      );
    }

    const { key, eyebrow, subtitle, ctaLabel, ctaHref, image, imageAlt, isActive } = parsed.data;
    const fallback = DEFAULT_CONTENT[key];

    const block = await prisma.contentBlock.upsert({
      where: { key },
      create: {
        key,
        title: parsed.data.title,
        eyebrow: eyebrow ?? null,
        subtitle: subtitle ?? null,
        ctaLabel: ctaLabel ?? null,
        ctaHref: ctaHref ?? null,
        image: image ?? null,
        imageAlt: imageAlt ?? null,
        position: fallback.position,
        isActive: isActive ?? true,
      },
      update: {
        title: parsed.data.title,
        eyebrow: eyebrow ?? null,
        subtitle: subtitle ?? null,
        ctaLabel: ctaLabel ?? null,
        ctaHref: ctaHref ?? null,
        image: image ?? null,
        imageAlt: imageAlt ?? null,
        ...(isActive === undefined ? {} : { isActive }),
      },
      select: { key: true, title: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, block });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Enregistrement impossible";
    console.error("[admin/content]", message);
    return NextResponse.json(
      { ok: false, error: "Enregistrement impossible" },
      { status: 500 },
    );
  }
}

/** DELETE : réinitialise un bloc sur les valeurs par défaut du code. */
export async function DELETE(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";

  if (!isContentKey(key)) {
    return NextResponse.json({ ok: false, error: "Section inconnue" }, { status: 400 });
  }

  // Supprimer la ligne fait repasser la home sur les valeurs par défaut.
  await prisma.contentBlock.deleteMany({ where: { key } });

  return NextResponse.json({ ok: true, reset: key });
}

export const dynamic = "force-dynamic";