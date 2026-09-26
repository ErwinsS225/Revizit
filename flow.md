# Ecomm — Flow Produit & Technique
> SaaS E-commerce multi-boutiques (Shopify light) — Document de reference unique.

## 1. Vision & Objectifs
- Vendeur: creer boutique en ligne en < 5 min, sans code.
- Acheteur: decouvrir, commander, payer en < 3 clics.
- Modele SaaS: abonnement mensuel + commission (V2).
- MVP: 1 boutique fonctionnelle de bout en bout (catalogue -> panier -> paiement -> commande -> email).

## 2. Roles
- Visitor: decouvre (vitrine publique)
- Customer: achete, suit commandes
- Merchant: gere sa boutique (/dashboard)
- Admin (V2): gere la plateforme (/admin)

## 3. Parcours utilisateurs

### 3.1 Achat (Visitor -> Customer)
landing/boutique -> page produit -> ajout panier -> /panier -> login/signup si non connecte -> /checkout -> paiement Stripe -> /merci/:orderId -> email confirmation + facture.
Echec paiement -> retour checkout.

### 3.2 Creation boutique (Merchant)
signup vendeur -> onboarding (nom, slug, devise) -> creation boutique + theme defaut -> ajout produits -> config Stripe + livraison -> publish -> dashboard (commandes, CA, stock).

### 3.3 Gestion commande
Nouvelle commande (notif) -> voir detail -> statut: payee -> preparee -> expediee -> livree / remboursee -> client notifie par email.

## 4. Pages
Public: / (landing SaaS), /b/[slug], /b/[slug]/produits/:slug, /panier, /checkout, /merci/:orderId, /login, /signup
Merchant: /dashboard, /dashboard/produits, /dashboard/commandes, /dashboard/parametres
Admin V2: /admin

## 5. Scope MVP vs V2
MVP:
- Auth email/password + Google, roles Customer/Merchant
- 1 boutique/merchant, slug unique, custom light (logo, couleur, banniere)
- CRUD Produits (nom, slug, prix, stock, images, actif/inactif)
- Panier persistant (localStorage + DB), Checkout 1 page
- Stripe Checkout + webhook, Commandes + statuts, Emails
- Dashboard: CA, commandes, stock bas
V2: multi-boutiques, Stripe Connect split, promos, avis, multi-devises, abonnements SaaS, themes, domaine custom, admin, recherche/SEO.

## 6. Flow technique
Stack: Next.js 14 App Router + Tailwind + shadcn/ui, Supabase (Auth+Postgres+Storage) ou Prisma+Postgres, Stripe, Resend, Vercel.
Frontend Next.js -> Route Handlers / Server Actions -> Postgres + Stripe (webhooks) + Resend + Storage images.
Regles: prix en centimes (priceCents), total calcule serveur. Stock decremente en transaction au webhook checkout.session.completed. Idempotence via stripeEventId unique. Slug valide ^[a-z0-9-]{3,30}$.

## 7. Modele de donnees (MVP)
- User(id, email, name, role, image)
- Store(id, ownerId, name, slug UNIQUE, logo, banner, primaryColor, currency=EUR, isPublished, stripeAccountId?)
- Product(id, storeId, name, slug, description, priceCents, stock, images[], isActive, category?)
- Cart(id, userId?, sessionId?, storeId, items)
- Order(id, storeId, customerId, email, totalCents, status pending|paid|preparing|shipped|delivered|cancelled|refunded, stripeSessionId UNIQUE, stripeEventId UNIQUE?, address JSON)
- OrderItem(id, orderId, productId, nameSnapshot, priceCentsSnapshot, qty)

## 8. API MVP
- POST /api/stores, PATCH /api/stores/:id
- GET/POST /api/stores/:slug/products, PATCH/DELETE /api/products/:id
- GET/POST /api/cart, POST /api/checkout (verifie stock+prix serveur, cree session Stripe)
- POST /api/webhooks/stripe (cree Order, vide panier, decremente stock, envoie email)
- GET/PATCH /api/orders (liste + changement statut)

## 9. Paiement
Stripe Checkout mode payment -> success_url /merci/{orderId} -> webhook completed -> Order paid -> preparing -> shipped -> delivered. Refund -> refunded.

## 10. Securite / RGPD / Qualite
- Un merchant ne voit que ses storeId (RLS ou check serveur).
- Validation Zod, rate-limit checkout/webhook.
- Images 2Mo max, webp.
- RGPD: export/suppression compte, CGV, mentions legales.
- Perf: ISR vitrine 60s, next/image, pagination dashboard.

## 11. Roadmap
1. Setup Next+DB+Auth+Storage + schema
2. Onboarding boutique + CRUD produits + vitrine /b/[slug]
3. Panier + Checkout + Stripe + Webhook + merci
4. Dashboard commandes + statuts + emails
5. Polish responsive, toasts, SEO, test E2E achat complet
6. Prod Vercel + Stripe live + RGPD

## 12. Definition of Done MVP
- [ ] Boutique + 3 produits + publish en < 5 min
- [ ] Achat test 4242 passe, stock -1, email recu, visible dashboard
- [ ] Pas d'acces cross-boutique, totaux serveur = Stripe, webhook idempotent
- [ ] Lighthouse mobile > 85, 0 erreur console sur achat

# 🛍️ Prompt Complet — Plateforme E-commerce de Vêtements (Next.js + TypeScript + Tailwind + DB locale)

Copie-colle ce prompt tel quel dans ton assistant IA (Claude, ChatGPT, Cursor, etc.) :

---

## 🎯 CONTEXTE & OBJECTIF

Tu es un **développeur full-stack senior expert en Next.js 14+ (App Router), TypeScript, TailwindCSS et Prisma**. Tu dois concevoir et coder une **application e-commerce complète, production-ready**, de vente de vêtements pour **hommes et femmes**.

L'objectif est de générer une base de code complète, modulaire, typée, avec une **base de données locale (SQLite via Prisma)** pour le développement, facilement migrable vers PostgreSQL en production.

---

## 🧱 STACK TECHNIQUE IMPOSÉE

- **Framework** : Next.js 14+ (App Router, Server Components + Client Components)
- **Langage** : TypeScript (strict mode, pas de `any`)
- **Styling** : TailwindCSS + `tailwind-merge` + `clsx` + `class-variance-authority` (shadcn/ui autorisé)
- **UI Components** : shadcn/ui (Radix UI) pour boutons, modales, dropdowns, toasts, etc.
- **Icônes** : `lucide-react`
- **Base de données** : SQLite en local via **Prisma ORM** (`file:./dev.db`)
- **Authentification** : **Auth.js (NextAuth v5)** — credentials + OAuth Google, sessions JWT
- **State management** : **Zustand** pour le panier + React Context pour le thème
- **Formulaires** : `react-hook-form` + `zod`
- **Paiement** : intégration **Stripe** (mode test) — Checkout Session
- **Upload d'images** : stockage local `/public/uploads` ou UploadThing (optionnel)
- **Emails** : React Email + Resend (confirmation commande)
- **Animations** : Framer Motion
- **Notifications** : `sonner`
- **Qualité** : ESLint + Prettier + Husky (optionnel)

---

## 📂 STRUCTURE DU PROJET ATTENDUE

```
ecommerce-clothing/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   ├── (shop)/
│   │   ├── page.tsx                    # Home
│   │   ├── products/page.tsx           # Catalogue + filtres
│   │   ├── products/[slug]/page.tsx    # Détail produit
│   │   ├── categories/[slug]/page.tsx
│   │   ├── cart/page.tsx
│   │   ├── checkout/page.tsx
│   │   ├── orders/page.tsx
│   │   └── account/page.tsx
│   ├── (admin)/
│   │   └── admin/
│   │       ├── dashboard/page.tsx
│   │       ├── products/page.tsx
│   │       ├── orders/page.tsx
│   │       └── users/page.tsx
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── products/route.ts
│   │   ├── orders/route.ts
│   │   ├── checkout/route.ts
│   │   └── webhooks/stripe/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                             # shadcn
│   ├── layout/                         # Navbar, Footer, Sidebar
│   ├── product/                        # ProductCard, ProductGrid, Filters
│   ├── cart/                           # CartDrawer, CartItem
│   ├── checkout/                       # CheckoutForm, OrderSummary
│   └── admin/                          # AdminTable, ProductForm
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   ├── stripe.ts
│   ├── utils.ts
│   └── validators/                     # schémas zod
├── store/
│   └── cart-store.ts
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── types/
│   └── index.ts
├── middleware.ts
└── .env.local
```

---

## 🗄️ SCHÉMA DE BASE DE DONNÉES (Prisma)

Crée un `schema.prisma` avec les modèles suivants :

- **User** : id, email, name, passwordHash, role (`CUSTOMER | ADMIN`), image, createdAt
- **Account / Session / VerificationToken** : pour Auth.js
- **Address** : id, userId, fullName, street, city, postalCode, country, phone, isDefault
- **Category** : id, name, slug, description, image, parentId (pour sous-catégories)
- **Product** : id, name, slug, description, price, compareAtPrice, images (String[]), categoryId, brand, stock, sku, isFeatured, isActive, tags, gender (`MEN | WOMEN | UNISEX`), createdAt
- **ProductVariant** : id, productId, size (XS→XXL), color, stock, priceModifier
- **Review** : id, productId, userId, rating, comment, createdAt
- **Cart / CartItem** : pour utilisateurs connectés
- **Order** : id, userId, status (`PENDING | PAID | SHIPPED | DELIVERED | CANCELLED`), total, addressId, stripeSessionId, createdAt
- **OrderItem** : id, orderId, productId, variantId, quantity, unitPrice
- **Wishlist** : id, userId, productId

Ajoute un **fichier `seed.ts`** qui insère :

- 1 admin (`admin@shop.com` / `Admin123!`)
- 2 clients de test
- 6 catégories (Hommes, Femmes, Chemises, Robes, Chaussures, Accessoires)
- 30 produits réalistes (15 hommes / 15 femmes) avec images Unsplash, prix, tailles, couleurs
- 5 commandes de test

---

## ✨ FONCTIONNALITÉS À IMPLÉMENTER

### 🏠 Côté Client

1. **Home page** : hero, catégories, produits vedettes, newsletter, footer complet
2. **Catalogue** : filtres (genre, catégorie, taille, couleur, prix, marque), tri (prix, nouveauté, popularité), pagination, recherche en temps réel
3. **Page produit** : galerie d'images (zoom), sélection taille/couleur, stock en direct, ajout au panier, avis clients, produits similaires
4. **Panier** : drawer latéral + page dédiée, persistance en localStorage (Zustand + persist), modification quantités
5. **Wishlist** : ajout/retrait, page dédiée
6. **Checkout** : formulaire adresse (zod), récapitulatif, intégration Stripe Checkout, page succès
7. **Compte utilisateur** : profil, historique commandes, adresses, wishlist
8. **Auth** : inscription, connexion, déconnexion, mot de passe oublié (UI), protection des routes via middleware
9. **Pages statiques** : À propos, Contact, CGV, Politique de confidentialité, FAQ

### 🔧 Côté Admin (`/admin`, protégé par rôle ADMIN)

1. **Dashboard** : KPIs (ventes, commandes, produits, utilisateurs), graphique simple (Recharts)
2. **CRUD Produits** : liste, création, édition, suppression, upload images, gestion stock/variants
3. **CRUD Catégories**
4. **Gestion commandes** : liste, détail, changement de statut
5. **Gestion utilisateurs** : liste, rôles

### 🔐 Sécurité & Bonnes pratiques

- Middleware protégeant `/admin/*` et `/account/*`
- Validation Zod côté serveur **et** client
- Hashage bcrypt des mots de passe
- Variables d'environnement typées dans `.env.local`
- Webhook Stripe pour confirmer les commandes
- Gestion d'erreurs centralisée (`error.tsx`, `not-found.tsx`, `loading.tsx`)

---

## 🎨 DESIGN & UX

- **Esthétique** : minimaliste, élégant, type Zara / COS / Everlane
- **Palette** : noir (#0A0A0A), blanc cassé (#FAFAF7), beige (#E8E1D5), accent terracotta (#C56A4E)
- **Typographie** : `Inter` (corps) + `Playfair Display` (titres) via `next/font`
- **Responsive** : mobile-first, breakpoints Tailwind standards
- **Dark mode** : support via `next-themes`
- **Accessibilité** : ARIA, focus visibles, contrastes AA
- **Micro-interactions** : hover sur cartes produits, transitions Framer Motion

---

## 📦 LIVRABLES ATTENDUS

Pour chaque fichier, fournis le **code complet, typé, commenté** :

1. `package.json` avec toutes les dépendances
2. `.env.example`
3. `prisma/schema.prisma` complet + `seed.ts`
4. `tailwind.config.ts` + `globals.css`
5. Toutes les pages listées dans la structure
6. Tous les composants réutilisables
7. `lib/` complet (prisma, auth, stripe, validators zod, utils)
8. `store/cart-store.ts` (Zustand + persist)
9. `middleware.ts`
10. `README.md` avec :
    - Instructions d'installation (`pnpm install`, `pnpm prisma migrate dev`, `pnpm prisma db seed`, `pnpm dev`)
    - Variables d'environnement à configurer
    - Comptes de test
    - Commandes utiles

---

## 🧭 MÉTHODE DE TRAVAIL DEMANDÉE

Procède **étape par étape** dans cet ordre :

1. **Étape 1** : Initialisation + `package.json` + config Tailwind + `schema.prisma`
2. **Étape 2** : Setup Prisma + seed + lib/prisma.ts + auth
3. **Étape 3** : Layout global (Navbar, Footer, thème)
4. **Étape 4** : Home + catalogue + page produit
5. **Étape 5** : Panier + wishlist + checkout Stripe
6. **Étape 6** : Compte utilisateur + historique commandes
7. **Étape 7** : Admin (dashboard + CRUD)
8. **Étape 8** : README + tests + polish

À chaque étape :

- Explique brièvement **ce que tu vas faire**
- Donne le **code complet des fichiers concernés** avec leur **chemin exact en en-tête** (ex : `// app/(shop)/products/page.tsx`)
- Termine par « ✅ Étape X terminée — prêt pour l'étape suivante ? »

---

## ⚠️ CONTRAINTES IMPORTANTES

- ❌ Pas de `any` en TypeScript
- ❌ Pas de données mockées en dur (utilise Prisma partout)
- ✅ Server Components par défaut, `"use client"` seulement si nécessaire
- ✅ Utilise `next/image` pour toutes les images
- ✅ Utilise `next/link` pour toute navigation
- ✅ Respecte les conventions de nommage (PascalCase composants, kebab-case fichiers)
- ✅ Code en **français** pour les libellés UI, mais **anglais** pour le code (variables, fonctions)

---

**Commence maintenant par l'Étape 1.**

---

💡 **Astuce** : si tu utilises Cursor / Windsurf / Claude, découpe ce prompt en plusieurs messages (un par étape) pour obtenir un code plus propre et éviter les coupures. Tu peux aussi demander à l'IA de te générer le projet fichier par fichier dans l'ordre.
