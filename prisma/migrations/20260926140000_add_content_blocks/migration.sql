-- CreateTable : blocs de contenu éditorial de la page d'accueil
-- Clés d'édition depuis /admin/contenu. Le site retombe sur les valeurs par
-- défaut du code (lib/content.ts) si aucun bloc n'est enregistré.
CREATE TABLE "ContentBlock" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "eyebrow" TEXT,
    "subtitle" TEXT,
    "ctaLabel" TEXT,
    "ctaHref" TEXT,
    "image" TEXT,
    "imageAlt" TEXT,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContentBlock_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ContentBlock_key_key" ON "ContentBlock"("key");
CREATE INDEX "ContentBlock_isActive_position_idx" ON "ContentBlock"("isActive", "position");