import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre espace personnel pour suivre vos commandes et gérer vos adresses.",
};

// app/(auth)/login/page.tsx — page de connexion client.
export default function LoginPage() {
  return (
    <div className="container-shop py-12 sm:py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Bon retour</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Accédez à vos commandes, vos favoris et vos adresses de livraison.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/40" />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}

