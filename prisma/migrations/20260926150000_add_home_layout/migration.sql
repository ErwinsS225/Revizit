-- CreateTable : disposition de la page d'accueil (ordre + visibilité)
-- Gère l'ordre et l'affichage de chaque section, y compris celles qui
-- n'ont pas de bloc éditorial (promo, réassurance, avis, newsletter).
CREATE TABLE "HomeLayout" (
    "key" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeLayout_pkey" PRIMARY KEY ("key")
);