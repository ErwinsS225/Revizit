import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { registerSchema } from "@/lib/validators/auth";

// app/api/auth/register/route.ts — inscription utilisateur sécurisée (bcrypt + validation Zod).
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.errors[0]?.message ?? "Données invalides";
      return NextResponse.json({ ok: false, error: message }, { status: 400 });
    }

    const { email, password, name } = parsed.data;

    const existing = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existing) {
      return NextResponse.json(
        { ok: false, error: "Un compte existe déjà avec cette adresse email." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: "CUSTOMER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur lors de l'inscription";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
