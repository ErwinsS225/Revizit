// lib/email.ts — envoi d'emails via Resend.
// Si RESEND_API_KEY est absent (dev local, CI), on journalise le lien en
// console au lieu d'échouer : le parcours reste testable de bout en bout.
import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

let client: Resend | null = null;

function resend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key || key.startsWith("re_...")) return null;
  client ??= new Resend(key);
  return client;
}

/** Adresse d'expédition, extraite de EMAIL_FROM ("Boutique <x@y.z>"). */
function fromAddress(): string {
  const raw = process.env.EMAIL_FROM;
  if (!raw) return `Revizit <onboarding@resend.dev>`;
  const match = raw.match(/<(.+)>/);
  return match?.[1] ?? raw;
}

const RESET_SUBJECT = `${BRAND.name} — réinitialisation de votre mot de passe`;

const RESET_TEXT = (link: string) => `Bonjour,

Vous avez demandé la réinitialisation de votre mot de passe ${BRAND.name}.

Cliquez sur le lien ci-dessous pour choisir un nouveau mot de passe :

${link}

Ce lien est valable 1 heure et ne peut être utilisé qu'une seule fois.

Si vous n'êtes pas à l'origine de cette demande, ignorez cet email :
votre mot de passe actuel reste inchangé.

${BRAND.name} — ${BRAND.signature}
${BRAND.domain}`;

const RESET_HTML = (link: string) => `
<div style="font-family:system-ui,-apple-system,sans-serif;max-width:520px;margin:0 auto;color:#1C1917">
  <p style="font-size:13px;letter-spacing:2px;color:#8A6A2F;text-transform:uppercase;margin:0 0 24px">${BRAND.name}</p>
  <h1 style="font-size:22px;margin:0 0 16px">Réinitialisation de votre mot de passe</h1>
  <p style="font-size:15px;line-height:1.6;margin:0 0 24px">Bonjour,</p>
  <p style="font-size:15px;line-height:1.6;margin:0 0 24px">
    Vous avez demandé la réinitialisation de votre mot de passe ${BRAND.name}.
  </p>
  <p style="margin:0 0 28px">
    <a href="${link}"
       style="display:inline-block;background:#8A6A2F;color:#F5F1E8;text-decoration:none;
              padding:13px 26px;border-radius:6px;font-size:15px;font-weight:600">
      Choisir un nouveau mot de passe
    </a>
  </p>
  <p style="font-size:13px;line-height:1.6;color:#6B6560;margin:0 0 8px">
    Ce lien est valable 1 heure et ne peut être utilisé qu'une seule fois.
  </p>
  <p style="font-size:13px;line-height:1.6;color:#6B6560;margin:0 0 24px">
    Si vous n'êtes pas à l'origine de cette demande, ignorez cet email :
    votre mot de passe actuel reste inchangé.
  </p>
  <hr style="border:none;border-top:1px solid #E5E0D8;margin:24px 0" />
  <p style="font-size:12px;color:#8B857D;margin:0">
    Si le bouton ne fonctionne pas, copiez ce lien :<br />${link}
  </p>
</div>`;

export interface SendResult {
  sent: boolean;
  /** Renseigné quand Resend refuse l'envoi (clé invalide, domaine non vérifié…). */
  error?: string;
}

/** Envoie l'email de réinitialisation. Ne lève jamais : un échec d'envoi ne doit pas 500. */
export async function sendPasswordResetEmail(
  to: string,
  link: string,
): Promise<SendResult> {
  const r = resend();

  if (!r) {
    console.info(
      `[email:dev] RESEND_API_KEY absent — email de réinitialisation NON envoyé pour ${to}.\n` +
        `          Lien (accessible uniquement en développement) : ${link}`,
    );
    return { sent: false, error: "RESEND_API_KEY non configuré" };
  }

  try {
    const { error } = await r.emails.send({
      from: fromAddress(),
      to,
      subject: RESET_SUBJECT,
      text: RESET_TEXT(link),
      html: RESET_HTML(link),
    });

    if (error) {
      console.error("[email] échec Resend :", error);
      return { sent: false, error: error.message };
    }
    return { sent: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    console.error("[email] exception Resend :", message);
    return { sent: false, error: message };
  }
}