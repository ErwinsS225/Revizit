import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// lib/admin-guard.ts — vérification ADMIN pour les routes API.
// Le middleware ne couvre que les pages (/admin/*) : chaque mutation API doit
// donc faire elle-même ce contrôle (défense en profondeur).
// Note : les messages sont en ASCII (« pas d'accents ») pour rester cohérents
// avec les autres réponses JSON d'erreur de l'API.
export type AdminGuard =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

export async function requireAdminApi(): Promise<AdminGuard> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Connecte-toi pour continuer" },
        { status: 401 },
      ),
    };
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "ADMIN") {
    return {
      ok: false,
      response: NextResponse.json(
        { ok: false, error: "Acces reserve aux administrateurs" },
        { status: 403 },
      ),
    };
  }
  return { ok: true, userId: session.user.id };
}
