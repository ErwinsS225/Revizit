import type { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Nouveau mot de passe",
  description: "Choisissez un nouveau mot de passe pour votre compte Revizit.",
  path: "/reset-password",
  // Une page à jeton unique n'a aucun intérêt dans un moteur de recherche.
  noIndex: true,
});

// app/(auth)/reset-password/page.tsx — définition du nouveau mot de passe.
export default function ResetPasswordPage() {
  return (
    <div className="container-shop py-12 sm:py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Nouveau mot de passe
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Choisissez un nouveau mot de passe pour sécuriser votre compte Revizit.
        </p>
      </div>

      <div className="mt-8">
        {/* Suspense obligatoire : useSearchParams force un rendu dynamique. */}
        <Suspense fallback={<div className="mx-auto h-64 max-w-md animate-pulse rounded-xl bg-muted/40" />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}