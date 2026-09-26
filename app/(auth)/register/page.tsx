import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Créer un compte",
  description: "Créez votre compte pour suivre vos commandes et sauvegarder vos adresses de livraison.",
};

// app/(auth)/register/page.tsx — page de création de compte client.
export default function RegisterPage() {
  return (
    <div className="container-shop py-12 sm:py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">Créer un compte</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Rejoignez-nous et gérez facilement vos commandes et vos adresses.
        </p>
      </div>

      <div className="mt-8">
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-muted/40" />}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
