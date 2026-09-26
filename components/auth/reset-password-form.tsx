"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// components/auth/reset-password-form.tsx — définition du nouveau mot de passe.
export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (password !== confirm) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Ce lien est invalide ou a expiré.");
        setLoading(false);
        return;
      }

      setDone(true);
      setLoading(false);
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  // Lien sans token : inutile d'afficher un formulaire.
  if (!token) {
    return (
      <div
        role="alert"
        className="mx-auto w-full max-w-md rounded-xl border border-destructive/20 bg-destructive/10 p-6 text-center shadow-sm sm:p-8"
      >
        <AlertTriangle className="mx-auto h-10 w-10 text-destructive" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl font-semibold">Lien incomplet</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Ce lien est invalide. Demandez-en un nouveau depuis la page «&nbsp;Mot de passe
          oublié&nbsp;».
        </p>
        <Button
          variant="terracotta"
          size="lg"
          className="mt-6 h-12 w-full text-base font-semibold"
          onClick={() => router.push("/forgot-password")}
        >
          Demander un nouveau lien <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  if (done) {
    return (
      <div
        role="status"
        className="mx-auto w-full max-w-md rounded-xl border bg-card p-6 text-center shadow-sm sm:p-8"
      >
        <CheckCircle2 className="mx-auto h-10 w-10 text-terracotta" aria-hidden="true" />
        <h2 className="mt-4 font-serif text-xl font-semibold">Mot de passe mis à jour</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Votre nouveau mot de passe est actif. Vous pouvez vous connecter dès maintenant.
        </p>
        <Button
          variant="terracotta"
          size="lg"
          className="mt-6 h-12 w-full text-base font-semibold"
          onClick={() => router.push("/login")}
        >
          Se connecter <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md">
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
          <label htmlFor="new-password" className="block text-sm font-medium">
            Nouveau mot de passe
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="new-password"
              name="password"
              type={show ? "text" : "password"}
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-11 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              aria-label={show ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            8 caractères minimum, dont 1 majuscule et 1 chiffre.
          </p>
        </div>

        <div>
          <label htmlFor="confirm-password" className="block text-sm font-medium">
            Confirmer le mot de passe
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="confirm-password"
              name="confirm"
              type={show ? "text" : "password"}
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <p
            id="reset-match"
            role="status"
            className="mt-2 text-xs text-destructive"
            hidden={!(confirm && confirm !== password)}
          >
            Les mots de passe ne correspondent pas.
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
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Enregistrement…
            </>
          ) : (
            <>
              Enregistrer <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        <Link href="/login" className="font-medium text-terracotta hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}