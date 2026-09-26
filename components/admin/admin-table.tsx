import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// components/admin/admin-table.tsx — tableau générique de l'espace admin
// (livrable « AdminTable » de flow.md). Server Component : les pages admin
// fournissent des cellules rendues côté serveur.
export interface AdminColumn<T> {
  key: string;
  header: ReactNode;
  cell: (row: T) => ReactNode;
  className?: string;
}

interface AdminTableProps<T> {
  columns: AdminColumn<T>[];
  rows: T[];
  /** Rendu affiché quand `rows` est vide. */
  empty: ReactNode;
  caption?: string;
}

export function AdminTable<T extends { id: string }>({
  columns,
  rows,
  empty,
  caption,
}: AdminTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b bg-muted/50 text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn("px-4 py-3 font-medium text-muted-foreground", column.className)}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((row) => (
            <tr key={row.id} className="transition-colors hover:bg-accent/40">
              {columns.map((column) => (
                <td key={column.key} className={cn("px-4 py-3 align-middle", column.className)}>
                  {column.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
