"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Lock, Mail, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// components/auth/register-form.tsx — inscription avec validation directe.
export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/account";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = (await res.json()) as { ok: boolean; error?: string };

      if (!res.ok || !data.ok) {
        setError(data.error ?? "Erreur lors de la création du compte.");
        setLoading(false);
        return;
      }

      // Connexion automatique après inscription réussie
      const loginRes = await signIn("credentials", {
        redirect: false,
        email,
        password,
        callbackUrl,
      });

      if (!loginRes || loginRes.error) {
        router.push("/login");
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setError("Une erreur inattendue est survenue.");
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
          <label htmlFor="reg-name" className="block text-sm font-medium">
            Nom complet
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <User className="h-4 w-4" />
            </span>
            <input
              id="reg-name"
              name="name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Marie Dupont"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium">
            Adresse email
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Mail className="h-4 w-4" />
            </span>
            <input
              id="reg-email"
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
          <label htmlFor="reg-password" className="block text-sm font-medium">
            Mot de passe
          </label>
          <div className="relative mt-1.5">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              <Lock className="h-4 w-4" />
            </span>
            <input
              id="reg-password"
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Min. 8 car. (1 majuscule + 1 chiffre)"
              className="h-11 w-full rounded-md border border-input bg-background pl-10 pr-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
            />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Au moins 8 caractères, 1 majuscule et 1 chiffre.
          </p>
        </div>

        <Button
          type="submit"
          disabled={loading}
          variant="terracotta"
          size="lg"
          className="mt-4 h-12 w-full text-base font-semibold"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Inscription en cours…
            </>
          ) : (
            <>
              Créer mon compte <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link
          href={`/login${callbackUrl !== "/account" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
          className="font-medium text-terracotta hover:underline"
        >
          Se connecter
        </Link>
      </p>
    </div>
  );
}
