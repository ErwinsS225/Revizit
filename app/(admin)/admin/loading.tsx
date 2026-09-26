// app/(admin)/admin/loading.tsx — squelette affiché pendant le rendu des
// pages admin (streaming SSR).
export default function AdminLoading() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Chargement de l'administration">
      <div className="h-8 w-56 rounded-md bg-muted" />
      <div className="mt-4 h-4 w-80 max-w-full rounded-md bg-muted" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border bg-card p-5">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="mt-4 h-7 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
      <div className="mt-6 h-72 rounded-xl border bg-card" />
    </div>
  );
}
