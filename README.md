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

## Commandes

| Commande | Effet |
| --- | --- |
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm test` | Tests Vitest |
| `npm run lint` | ESLint |
| `npx prisma studio` | Interface d'exploration de la base |

## Sécurité du seed

Le script `prisma/seed.ts` **purge la base** avant insertion. En production
il est refusé (`purge()` lève une erreur si `NODE_ENV=production`). Les comptes
de démonstration (`admin@shop.com`) ne sont créés que si `SEED_DEMO_USERS=true`.

## Licences / crédits

Photos produit : [Unsplash](https://unsplash.com).
