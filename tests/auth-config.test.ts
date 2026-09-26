import { describe, expect, it } from "vitest";
import { toRole } from "@/lib/auth.config";
import { buildMetadata, organizationJsonLd, productJsonLd } from "@/lib/seo";

describe("toRole", () => {
  it("reconnaît le rôle ADMIN", () => {
    expect(toRole("ADMIN")).toBe("ADMIN");
  });

  it("retombe sur CUSTOMER pour toute autre valeur", () => {
    expect(toRole("CUSTOMER")).toBe("CUSTOMER");
    expect(toRole("admin")).toBe("CUSTOMER");
    expect(toRole(undefined)).toBe("CUSTOMER");
    expect(toRole(null)).toBe("CUSTOMER");
    expect(toRole(42)).toBe("CUSTOMER");
  });
});

// Types OG acceptés par Next.js. "product" en fait partie ? NON : le build passe
// mais le rendu de la page produit renvoie une 500 ("Invalid OpenGraph type").
const VALID_OG_TYPES = ["website", "article", "book", "profile", "music", "video"] as const;

describe("buildMetadata", () => {
  it("pose un canonical propre à chaque page", () => {
    expect(buildMetadata({ title: "T", description: "D", path: "/livraison" }).alternates.canonical).toBe(
      "https://revizit.ci/livraison",
    );
    expect(buildMetadata({ title: "T", description: "D", path: "/products/robe-bogolan" }).alternates.canonical).toBe(
      "https://revizit.ci/products/robe-bogolan",
    );
  });

  it("canonical racine sans slash résiduel", () => {
    expect(buildMetadata({ title: "T", description: "D", path: "/" }).alternates.canonical).toBe(
      "https://revizit.ci",
    );
  });

  it("utilise uniquement des types OpenGraph valides", () => {
    for (const path of ["/", "/products", "/livraison", "/products/robe"]) {
      const meta = buildMetadata({ title: "T", description: "D", path });
      expect(VALID_OG_TYPES).toContain(meta.openGraph.type);
    }
  });

  it("noIndex met robots en noindex,nofollow", () => {
    const meta = buildMetadata({ title: "T", description: "D", path: "/x", noIndex: true });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});

describe("JSON-LD", () => {
  it("l'organisation référence une image OG existante", () => {
    const image = organizationJsonLd().image as string;
    // /og-image.jpg n'existe pas dans le dépôt : on pointe l'image générée.
    expect(image).not.toContain("og-image.jpg");
    expect(image).toContain("/opengraph-image");
  });

  it("le produit expose une offre en XOF", () => {
    const jsonLd = productJsonLd({
      name: "Coupe à vin gravée",
      description: "Verre gravé au laser",
      image: "https://revizit.ci/coupe.jpg",
      url: "https://revizit.ci/products/coupe-a-vin-gravee",
      price: 18000,
    }) as { offers: { priceCurrency: string; price: number } };
    expect(jsonLd.offers.priceCurrency).toBe("XOF");
    expect(jsonLd.offers.price).toBe(18000);
  });
});
