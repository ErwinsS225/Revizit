import { NextResponse } from "next/server";
import { createResetToken } from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/email";
import { forgotPasswordSchema } from "@/lib/validators/auth";

// app/api/auth/forgot-password/route.ts — demande de lien de réinitialisation.
//
// Sécurité : la réponse est IDENTIQUE que l'email existe ou non (200 + même
// message). Sinon un attaquant pourrait tester des adresses et découvrir
// qui a un compte chez Revizit.
export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: "Adresse email invalide." },
        { status: 400 },
      );
    }

    const { email } = parsed.data;
    const result = await createResetToken(email);

    if (result) {
      await sendPasswordResetEmail(email, result.link);
    }

    // Réponse volontairement identique dans les deux cas.
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur inattendue";
    console.error("[forgot-password]", message);
    return NextResponse.json(
      { ok: false, error: "Impossible de traiter la demande pour le moment." },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";