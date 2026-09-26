"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/auth/login-form.tsx — formulaire de connexion avec Touch Targets & sans auto-zoom iOS.
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (!res || res.error) {
        setError("Identifiants incorrects. Veuillez vérifier votre adresse email et votre mot de passe.");
        setLoading(false);
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur inattendue est survenue. Veuillez réessayer.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-card p-6 shadow-sm sm:p-8">
        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div>
          <label htmlFor="login-email" className="block text-sm font-medium">
            Adresse email
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="login-email"
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
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="login-password" className="block text-sm font-medium">
              Mot de passe
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-muted-foreground hover:text-terracotta hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="login-password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="terracotta"
          size="lg"
          className="mt-2 h-12 w-full text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Connexion en cours…
            </>
          ) : (
            <>
              Se connecter <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>

        <div className="mt-6 rounded-lg bg-muted/50 p-3.5 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Comptes de test (seed) :</p>
          <ul className="mt-1 space-y-0.5">
            <li>
              Client : <code className="text-foreground">marie@example.com</code> /{" "}
              <code className="text-foreground">Client123!</code>
            </li>
            <li>
              Admin : <code className="text-foreground">admin@shop.com</code> /{" "}
              <code className="text-foreground">Admin123!</code>
            </li>
          </ul>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link
          href={`/register${callbackUrl !== "/account" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-terracotta hover:underline"
        >
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
