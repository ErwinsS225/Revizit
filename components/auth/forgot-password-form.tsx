"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/auth/forgot-password-form.tsx — demande de lien de réinitialisation.
export function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Impossible d'envoyer le lien. Veuillez réessayer.");
        setLoading(false);
        return;
      }

      setSent(true);
      setLoading(false);
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  // Message volontairement identique à celui d'un email inconnu : ne pas révéler
  // quels emails sont inscrits chez Revizit.
  if (sent) {
    return (
      <div
        role="status"
        className="w-full max-w-md mx-auto rounded-xl border bg-card p-6 text-center shadow-sm sm:p-8"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-terracotta" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl font-semibold">Vérifiez votre boîte mail</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Si un compte correspond à <span className="font-medium text-foreground">{email}</span>,
          vous allez recevoir un lien de réinitialisation dans quelques minutes.
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Le lien est valable 1 heure. Pensez à vérifier vos courriers indésirables.
        </p>
        <Button
          variant="terracotta"
          size="lg"
          className="mt-6 h-12 w-full text-base font-semibold"
          onClick={() => router.push("/login")}
        >
          Retour à la connexion <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 rounded-xl border bg-card p-6 shadow-sm sm:p-8"
      >
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="forgot-email" className="block text-sm font-medium">
            Adresse email
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="forgot-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ex: marie@example.com"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Vous recevrez un lien sécurisé pour choisir un nouveau mot de passe.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="terracotta"
          size="lg"
          className="h-12 w-full text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Envoi en cours…
            </>
          ) : (
            <>
              Envoyer le lien <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link
          href="/login"
          className="inline-flex items-center font-medium text-terracotta hover:underline"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}