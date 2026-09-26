"use client";

// app/error.tsx — page d'erreur globale (doit être un Client Component).
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="container-shop py-20 text-center">
      <h1 className="font-serif text-3xl">Oups, une erreur est survenue</h1>
      <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
      <button
        onClick={reset}
        className="mt-6 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Réessayer
      </button>
    </div>
  );
}
