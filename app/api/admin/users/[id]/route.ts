import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-guard";
import { ROLES } from "@/types";

// app/api/admin/users/[id]/route.ts — changement de rôle (admin).
type Params = { params: { id: string } };

const roleSchema = z.object({ role: z.enum(ROLES) });

export async function PATCH(req: Request, { params }: Params) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  try {
    const body: unknown = await req.json();
    const parsed = roleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.errors[0]?.message ?? "Role invalide" },
        { status: 400 },
      );
    }
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { role: parsed.data.role },
      select: { id: true, role: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch {
    return NextResponse.json({ ok: false, error: "Utilisateur introuvable" }, { status: 404 });
  }
}
