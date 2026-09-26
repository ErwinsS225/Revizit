import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { applyNewPassword } from "@/lib/password-reset";
import { resetPasswordSchema } from "@/lib/validators/auth";

// app/api/auth/reset-password/route.ts — applique un nouveau mot de passe.
//
// Le message de réponse ne distingue pas « token inconnu » de « token expiré » :
// dans les deux cas le lien est inutilisable, et donner le motif exact
// aiderait à distinguer les tokens émis des tokens devinés.
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      const first = parsed.error.errors[0];
      // Erreur de mot de passe → message précis (utile à l'utilisateur).
      // Erreur de token → message générique.
      const error =
        first?.path[0] === "password"
          ? (first?.message ?? "Mot de passe trop faible")
          : "Ce lien est invalide ou a expiré.";
      return NextResponse.json({ ok: false, error }, { status: 400 });
    }

    const { token, password } = parsed.data;
    const result = await applyNewPassword(token, password);

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: "Ce lien est invalide ou a expiré." },
        { status: 400 },
      );
    }

    // Toutes les sessions de l'utilisateur sont invalidées : un mot de passe
    // réinitialisé doit déconnecter les éventuelles sessions actives.
    await prisma.session.deleteMany({ where: { userId: result.userId } });

    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inattendue";
    console.error("[reset-password]", message);
    return NextResponse.json(
      { ok: false, error: "Impossible de réinitialiser le mot de passe." },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";