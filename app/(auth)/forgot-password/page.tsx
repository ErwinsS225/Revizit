import type { Metadata } from "next";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "Mot de passe oublié",
  description:
    "Réinitialisez le mot de passe de votre compte Revizit en recevant un lien sécurisé par email.",
  path: "/forgot-password",
  noIndex: true,
});

// app/(auth)/forgot-password/page.tsx — demande de réinitialisation du mot de passe.
export default function ForgotPasswordPage() {
  return (
    <div className="container-shop py-12 sm:py-16">
      <div className="mx-auto max-w-md text-center">
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Mot de passe oublié
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Indiquez l&apos;email de votre commande : nous vous enverrons un lien pour choisir un
          nouveau mot de passe.
        </p>
      </div>

      <div className="mt-8">
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
