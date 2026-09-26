import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { type Role } from "@/types";
import { AdminTable, type AdminColumn } from "@/components/admin/admin-table";
import { UserRoleSelect } from "@/components/admin/user-role-select";

export const metadata: Metadata = { title: "Utilisateurs" };

export const dynamic = "force-dynamic";

const ROLE_LABELS: Record<Role, string> = {
  CUSTOMER: "Client",
  ADMIN: "Admin",
};

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  createdAt: Date;
  _count: { orders: number };
};

// Type EXACT de la requête findMany ci-dessous (dérivé de Prisma, jamais any).
type RawUser = Prisma.UserGetPayload<{
  select: {
    id: true;
    name: true;
    email: true;
    role: true;
    createdAt: true;
    _count: { select: { orders: true } };
  };
}>;

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
}

// app/(admin)/admin/users/page.tsx — liste des utilisateurs et gestion des rôles.
export default async function AdminUsersPage() {
  // SQLite : les rôles sont stockés en String → réalignement sur l'union.
  const rawUsers: RawUser[] = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
  const users: UserRow[] = rawUsers.map((user: RawUser) => ({ ...user, role: user.role as Role }));

  const columns: AdminColumn<UserRow>[] = [
    {
      key: "user",
      header: "Utilisateur",
      cell: (row) => (
        <div className="min-w-0">
          <p className="truncate font-medium">{row.name ?? "—"}</p>
          <p className="truncate text-xs text-muted-foreground">{row.email}</p>
        </div>
      ),
    },
    { key: "orders", header: "Commandes", cell: (row) => `${row._count.orders}` },
    { key: "since", header: "Inscrit le", cell: (row) => formatDate(row.createdAt) },
    {
      key: "role",
      header: "Rôle",
      cell: (row) => <UserRoleSelect userId={row.id} role={row.role} />,
    },
  ];

  return (
    <div className="min-w-0">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight sm:text-3xl">Utilisateurs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {users.length} compte{users.length > 1 ? "s" : ""} · {users.filter((u) => u.role === "ADMIN").length}{" "}
          admin{users.filter((u) => u.role === "ADMIN").length > 1 ? "s" : ""} ({ROLE_LABELS.ADMIN}).
        </p>
      </div>

      <div className="mt-5">
        <AdminTable
          caption="Liste des utilisateurs"
          columns={columns}
          rows={users}
          empty="Aucun utilisateur."
        />
      </div>
    </div>
  );
}