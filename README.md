# Revizit

> L'élégance africaine, ta signature gravée.

Boutique en ligne : vêtements africains exclusifs (Wax, Bogolan, Kita) et
verrerie gravée personnalisée. Basée à Abidjan, Côte d'Ivoire.

## Stack

- **Next.js 14** (App Router) + React 18 + TypeScript
- **Tailwind CSS** + Framer Motion
- **Prisma** + **PostgreSQL (Supabase)**
- **Auth.js (NextAuth v5)** — email/mot de passe + Google OAuth, rôles `ADMIN` / `CUSTOMER`
- **Zod** (validation), **Vitest** (tests), **ESLint** / Prettier

## Démarrage local

```bash
npm install
cp .env.example .env.local   # puis renseigner DATABASE_URL et DIRECT_URL
npx prisma migrate dev
npm run prisma:seed          # SEED_DEMO_USERS=true en local uniquement
npm run dev
```

## Variables d'environnement

Voir `.env.example`. Les deux essential pour faire tourner l'app :

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Pooler transactionnel Supabase (port 6543), utilisé à l'exécution |
| `DIRECT_URL` | Connexion directe (port 5432), réservée aux migrations Prisma |

⚠️ Ces URLs contiennent le mot de passe de la base. **Ne jamais les committer.**

### `connection_limit` : local ou Vercel, pas les deux

La page d'accueil exécute 4 requêtes Prisma en parallèle (`Promise.all`). Avec
`connection_limit=1`, elles se mettent en file d'attente et la page échoue sur
`Timed out fetching a new connection`.

- **En local** : omettre `connection_limit` (pool Prisma par défaut)
- **Sur Vercel** : ajouter `connection_limit=1` — chaque invocation a son propre
  runtime, le pooler Supabase protège alors le quota de connexions

Le gabarit `.env.example` suit cette règle.

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production (local, sans migration) |
| `npm run build:vercel` | Build Vercel : applique les migrations **puis** compile |
| `npm test` | Tests Vitest |
| `npm run lint` | ESLint |
| `npx prisma migrate deploy` | Applique les migrations (production) |
| `npm run create-admin -- email` | Crée ou promeut un compte ADMIN |
| `npx prisma studio` | Interface d'exploration de la base |

## Déployer sur Vercel

### 1. Variables d'environnement

À saisir dans l'interface Vercel (*Project → Settings → Environment Variables*).
Vercel ne lit pas votre `.env.local` : rien n'est copié automatiquement.

| Variable | Rôle |
| --- | --- |
| `DATABASE_URL` | Pooler Supabase. **Ajouter `&connection_limit=1`** (voir ci-dessous) |
| `DIRECT_URL` | Connexion directe (port 5432), pour les migrations |
| `AUTH_SECRET` | 32 caractères aléatoires. `openssl rand -base64 32` |
| `AUTH_URL` | `https://votre-domaine` |
| `NEXT_PUBLIC_APP_URL` | `https://votre-domaine` |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SECRET_KEY` | Clé secrète régénérée (jamais exposée au client) |
| `SEED_DEMO_USERS` | `false` |

### 2. Ce que fait la configuration

`vercel.json` impose `buildCommand: npm run build:vercel`, qui enchaîne
`prisma generate` → `prisma migrate deploy` → `next build`. Les migrations sont
donc appliquées **avant** la compilation.

⚠️ Ne remplacez pas `migrate deploy` par `migrate dev` : cette commande est
interactive et ferait échouer le build.

### 3. Après le déploiement

```bash
# Vérifier que le site répond
curl -I https://votre-domaine

# Créer votre compte administrateur
npx tsx scripts/create-admin -- votre@email.com
```

Le script lit `DATABASE_URL` depuis `.env.local` : il agit sur la base de
production si c'est celle qui y est configurée.

### 4. Reordonner la base

La base est partagée entre le local et la production. Une commande créée en
local apparaît sur Vercel, et inversement. Pour isoler les deux environnements,
créez un second projet Supabase dédié à la production et changez `DATABASE_URL`
dans les variables Vercel.

## Sécurité du seed

Le script `prisma/seed.ts` **purge la base** avant insertion. En production
il est refusé (`purge()` lève une erreur si `NODE_ENV=production`). Aucun compte
de démonstration n'est créé : les utilisateurs s'inscrivent via `/register`, et un
administrateur via `npm run create-admin`.

## Licences / crédits

Photos produit : [Unsplash](https://unsplash.com).
