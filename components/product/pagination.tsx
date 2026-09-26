import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

// components/product/pagination.tsx — pagination catalogue (liens, Server Component).
export function Pagination({ page, pageCount, baseQuery }: { page: number; pageCount: number; baseQuery: string }) {
  if (pageCount <= 1) return null;
  const href = (p: number) => {
    const params = new URLSearchParams(baseQuery);
    params.set("page", String(p));
    return `/products?${params.toString()}` as never;
  };
  return (
    <nav aria-label="Pagination catalogue" className="mt-8 flex items-center justify-center gap-2">
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        aria-label="Page précédente"
        className={`rounded-md border p-2 ${page <= 1 ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
      >
        <ChevronLeft className="h-4 w-4" />
      </Link>
      <p className="text-sm text-muted-foreground" role="status">
        Page {page} sur {pageCount}
      </p>
      <Link
        href={href(Math.min(pageCount, page + 1))}
        aria-disabled={page >= pageCount}
        aria-label="Page suivante"
        className={`rounded-md border p-2 ${page >= pageCount ? "pointer-events-none opacity-40" : "hover:bg-muted"}`}
      >
        <ChevronRight className="h-4 w-4" />
      </Link>
    </nav>
  );
}
