import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Mot de passe oublié",
  description: "Réinitialisation de mot de passe.",
};

// app/(auth)/forgot-password/page.tsx — information réinitialisation mot de passe.
export default function ForgotPasswordPage() {
  return (
    <div className="container-shop max-w-md py-12 sm:py-16 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
        <Mail className="h-6 w-6" />
      </div>
      <h1 className="mt-4 font-serif text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pour des raisons de sécurité, veuillez contacter le support de la boutique ou vous reconnecter avec vos identifiants existants.
      </p>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/login"
          className={cn(buttonVariants({ variant: "terracotta" }), "h-11 w-full font-semibold")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour à la connexion
        </Link>
      </div>
    </div>
  );
}
