import { redirect } from "next/navigation";

// app/(admin)/admin/page.tsx — /admin pointe vers le tableau de bord.
// (l'accès non-admin est déjà bloqué par le middleware + le layout admin)
export default function AdminIndexPage() {
  redirect("/admin/dashboard");
}

