import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { ORDER_STATUSES } from "@/types";

// app/api/admin/orders/[id]/route.ts — changement de statut d'une commande (admin).
type Params = { params: { id: string } };

const statusSchema = z.object({ status: z.enum(ORDER_STATUSES) });

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const body: unknown = await req.json();
    const parsed = statusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0]?.message ?? "Statut invalide" },
        { status: 400 },
      );
    }
    const order = await prisma.order.update({
      where: { id: params.id },
      data: { status: parsed.data.status },
      select: { id: true, status: true },
    });
    return NextResponse.json({ ok: true, order });
  } catch {
    return NextResponse.json({ ok: false, error: "Commande introuvable" }, { status: 404 });
  }
}
