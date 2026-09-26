import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/admin-guard";
import { isStorageConfigured, uploadImage, MAX_FILE_BYTES } from "@/lib/storage";

// app/api/admin/upload/route.ts — envoi d'images vers Supabase Storage.
// Réservé aux administrateurs (une image téléversée est servie publiquement).

/** Dossiers autorisés : évite de polluer le bucket avec des chemins arbitraires. */
const ALLOWED_FOLDERS = new Set(["contenu", "produits", "categories"]);

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (!guard.ok) return guard.response;

  if (!isStorageConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Stockage non configuré : ajoutez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SECRET_KEY dans .env.local",
      },
      { status: 503 },
    );
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folderRaw = form.get("folder");
    const folder = typeof folderRaw === "string" ? folderRaw : "contenu";

    if (!ALLOWED_FOLDERS.has(folder)) {
      return NextResponse.json({ ok: false, error: "Dossier non autorisé" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ ok: false, error: "Aucun fichier reçu" }, { status: 400 });
    }

    if (file.size > MAX_FILE_BYTES) {
      return NextResponse.json(
        { ok: false, error: "Fichier trop lourd (maximum 5 Mo)" },
        { status: 413 },
      );
    }

    const result = await uploadImage(file, folder);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({ ok: true, url: result.url });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Envoi impossible";
    // `req.formData()` lève si l'appelant n'envoie pas un multipart/form-data
    // (erreur fréquente côté client) : on renvoie un 400 explicite, pas un 500.
    const badRequest =
      message.includes("formData") ||
      message.includes("multipart") ||
      message.includes("boundary");
    console.error("[admin/upload]", message);
    return NextResponse.json(
      { ok: false, error: "Envoi invalide : le fichier doit être envoyé en multipart/form-data" },
      { status: badRequest ? 400 : 500 },
    );
  }
}

export const dynamic = "force-dynamic";