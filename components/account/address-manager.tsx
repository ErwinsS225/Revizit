"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface AddressItem {
  id: string;
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

// components/account/address-manager.tsx — gestion des adresses (création/suppression).
export function AddressManager({ initialAddresses }: { initialAddresses: AddressItem[] }) {
  const router = useRouter();
  const [addresses, setAddresses] = useState<AddressItem[]>(initialAddresses);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleAddAddress(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    const form = new FormData(e.currentTarget);

    const payload = {
      fullName: String(form.get("fullName") || "").trim(),
      street: String(form.get("street") || "").trim(),
      city: String(form.get("city") || "").trim(),
      postalCode: String(form.get("postalCode") || "00225").trim(),
      country: String(form.get("country") || "Côte d'Ivoire").trim(),
      phone: String(form.get("phone") || "").trim(),
      isDefault: form.get("isDefault") === "on",
    };

    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as { ok: boolean; address?: { id: string }; error?: string };

      if (!res.ok || !data.ok || !data.address) {
        throw new Error(data.error ?? "Impossible d'ajouter l'adresse");
      }

      toast.success("Adresse enregistrée avec succès");
      setShowAddForm(false);
      setAddresses((prev) => [...prev, { id: data.address!.id, ...payload }]);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur inattendue");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Voulez-vous vraiment supprimer cette adresse ?")) return;
    setDeletingId(id);

    try {
      const res = await fetch(`/api/addresses/${id}`, { method: "DELETE" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Impossible de supprimer");

      toast.success("Adresse supprimée");
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur suppression");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold sm:text-2xl">Carnet d&apos;adresses</h2>
          <p className="text-sm text-muted-foreground">
            Gérez vos adresses pour faciliter vos commandes.
          </p>
        </div>
        {!showAddForm ? (
          <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Plus className="h-4 w-4" /> Ajouter
          </Button>
        ) : null}
      </div>

      {showAddForm ? (
        <form onSubmit={handleAddAddress} className="space-y-4 rounded-xl border bg-muted/20 p-5">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-semibold text-foreground">Nouvelle adresse</h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Annuler
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="addr-fullName" className="block text-sm font-medium">
                Nom complet *
              </label>
              <input
                id="addr-fullName"
                name="fullName"
                required
                minLength={2}
                maxLength={100}
                placeholder="Marie Dupont"
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="addr-street" className="block text-sm font-medium">
                Rue / quartier *
              </label>
              <input
                id="addr-street"
                name="street"
                required
                minLength={3}
                placeholder="12 rue des Jardins, Cocody"
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label htmlFor="addr-city" className="block text-sm font-medium">
                Ville *
              </label>
              <input
                id="addr-city"
                name="city"
                required
                defaultValue="Abidjan"
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div>
              <label htmlFor="addr-phone" className="block text-sm font-medium">
                Téléphone *
              </label>
              <input
                id="addr-phone"
                name="phone"
                type="tel"
                required
                placeholder="+225 07 00 00 00 00"
                className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-terracotta"
              />
            </div>

            <div className="flex items-center gap-2 pt-1 sm:col-span-2">
              <input id="addr-isDefault" name="isDefault" type="checkbox" className="h-4 w-4 rounded" />
              <label htmlFor="addr-isDefault" className="text-sm text-foreground">
                Définir par défaut
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting} variant="terracotta" size="sm">
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sauvegarder"}
            </Button>
          </div>
        </form>
      ) : null}
      {addresses.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <MapPin className="mx-auto h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-2 text-sm text-muted-foreground">Aucune adresse enregistrée.</p>
          <Button onClick={() => setShowAddForm(true)} variant="outline" size="sm" className="mt-4">
            Ajouter une adresse
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((addr) => (
            <div key={addr.id} className="flex flex-col justify-between rounded-xl border bg-card p-5 shadow-sm">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold text-foreground">{addr.fullName}</span>
                  {addr.isDefault ? (
                    <span className="rounded-full bg-terracotta/10 px-2 py-0.5 text-xs font-medium text-terracotta">
                      Par défaut
                    </span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{addr.street}</p>
                <p className="text-sm text-muted-foreground">
                  {addr.city}, {addr.country}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">Tél : {addr.phone}</p>
              </div>

              <div className="mt-4 flex items-center justify-end border-t pt-3">
                <Button
                  onClick={() => handleDelete(addr.id)}
                  disabled={deletingId === addr.id}
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  {deletingId === addr.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" /> Supprimer
                    </>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

