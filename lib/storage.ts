// lib/storage.ts — envoi d'images vers Supabase Storage (côté SERVEUR).
//
// Les clés Supabase ne quittent JAMAIS le serveur : ce module n'est importé
// que par des routes API / Server Components, jamais par un composant client.
//
// Prérequis (une fois) : créer un bucket "products" dans Supabase
// (Storage → New bucket), ideally "Public" pour des photos de catalogue.
import { createClient } from "@supabase/supabase-js";

export const BUCKET = "products";

/** Types MIME acceptés. Le reste est refusé avant tout envoi. */
const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

/** Taille maximale par fichier : 5 Mo. */
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

export type UploadResult =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string };

/** Client serveur, créé à la demande. Null si la configuration manque. */
function serverClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Clé secrète : accès complet au projet, doit rester côté serveur.
  const key = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export function isStorageConfigured(): boolean {
  return serverClient() !== null;
}

/** Nom de fichier sûr : slugs ASCII, pas d'espace ni d'accent. */
function safeName(original: string): string {
  const base = original
    .normalize("NFD")
    // Retire les diacritiques (é → e) via la propriété Unicode \p{Diacritic},
    // plus lisible qu'une plage de caractères combinants.
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase()
    .slice(-60);
  return base || "image";
}

/**
 * Envoie un fichier. Le nom stocké est préfixé par un horodatage et un
 * identifiant aléatoire : deux images nommées `photo.jpg` ne s'écrasent pas.
 */
export async function uploadImage(file: File, folder = "contenu"): Promise<UploadResult> {
  const client = serverClient();
  if (!client) {
    return {
      ok: false,
      error:
        "Supabase Storage non configuré (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY manquants)",
    };
  }

  const ext = ALLOWED_TYPES[file.type];
  if (!ext) {
    return {
      ok: false,
      error: `Format non supporté (${file.type || "inconnu"}). Utilisez JPG, PNG, WebP ou AVIF.`,
    };
  }

  if (file.size > MAX_FILE_BYTES) {
    return {
      ok: false,
      error: `Fichier trop lourd (${(file.size / 1024 / 1024).toFixed(1)} Mo). Maximum : 5 Mo.`,
    };
  }

  // Dossier daté : évite d'exploser un seul préfixe et simplifie le tri.
  const now = new Date();
  const prefix = `${folder}/${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  // Un nom entièrement non-ASCII (« 中文.png ») ne laisse que l'extension :
  // dans ce cas on retombe sur un nom neutre.
  const stem = safeName(file.name)
    .replace(new RegExp(`\\.${ext}$`), "")
    .replace(/^[-.]+$/, "");
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${stem || "image"}.${ext}`;
  const path = `${prefix}/${name}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error } = await client.storage.from(BUCKET).upload(path, buffer, {
    contentType: file.type,
    cacheControl: "31536000", // 1 an : les images de catalogue changent peu
    upsert: false,
  });

  if (error) {
    console.error("[storage] échec d'envoi :", error.message);
    return { ok: false, error: `Envoi impossible : ${error.message}` };
  }

  const { data } = client.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl, path };
}