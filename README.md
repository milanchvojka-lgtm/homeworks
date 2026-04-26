# Homeworks

Rodinná webová aplikace pro řízení domácích povinností a odměn. PWA, deployed na Vercelu.

Pro detaily ke scope, datovému modelu a milestonům viz:

- [`SKILL.md`](./SKILL.md) — operating manual (čti první)
- [`PRD.md`](./PRD.md) — produktové rozhodnutí, feature spec
- [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) — milestony a úkoly
- [`DECISIONS.md`](./DECISIONS.md) — architektonická rozhodnutí (rozšiřují plán)

## Stack

Next.js 16 (App Router) + TypeScript + Tailwind 4 + Prisma + Postgres (Supabase) + Vercel.

## Lokální vývoj

### Předpoklady

- Node.js 20+ (vyvíjeno na 22).
- Supabase projekt s prázdným Postgres schématem.

### Setup

```bash
npm install
cp .env.example .env.local
# do .env.local doplň DATABASE_URL, DIRECT_URL z Supabase a vygeneruj CRON_SECRET
npm run db:push    # nahraje aktuální Prisma schéma do DB
npm run dev        # http://localhost:3000
```

### Užitečné skripty

| Skript | Co dělá |
|---|---|
| `npm run dev` | Dev server (Turbopack). |
| `npm run build` | Produkční build. |
| `npm run lint` | ESLint. |
| `npm run db:push` | Aplikuje Prisma schema do DB (bez migrací — pro dev). |
| `npm run db:studio` | Prisma Studio (browser DB UI). |
| `npm run db:seed` | Spustí `prisma/seed.ts`. |

## Deploy

Push do `main` → Vercel automaticky deployuje.

ENV proměnné na Vercelu (Production + Preview):

- `DATABASE_URL` — Supabase pooler URL (port 6543, `pgbouncer=true`)
- `DIRECT_URL` — Supabase direct URL (port 5432) pro Prisma migrace
- `TZ` — `Europe/Prague`
- `CRON_SECRET` — sdílený secret s GitHub Actions
- `RESEND_API_KEY` — pro admin e-mail digest
- `ADMIN_NOTIFICATION_EMAILS` — čárkou oddělené adresy

## Cron joby

Cron joby běží přes **GitHub Actions**, ne Vercel Cron (viz `DECISIONS.md` D1).
Workflow ve `.github/workflows/cron.yml` volá `https://<deploy>/api/cron/<job>` s autorizací přes `CRON_SECRET` header.
