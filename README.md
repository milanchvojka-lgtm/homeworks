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
cp .env.example .env
# do .env doplň DATABASE_URL, DIRECT_URL z Supabase a vygeneruj CRON_SECRET
npm run db:push    # nahraje aktuální Prisma schéma do DB
npm run dev        # http://localhost:3000
```

> **Pozor:** soubor pojmenuj `.env`, ne `.env.local`. Prisma CLI načítá jen `.env`. Next.js dev server načítá oba; `.env.local` má přednost. Pro náš workflow stačí jeden soubor `.env` (je v `.gitignore`).

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
- `CRON_SECRET` — sdílený secret s GitHub Actions
- `RESEND_API_KEY` — pro admin e-mail digest
- `ADMIN_NOTIFICATION_EMAILS` — čárkou oddělené adresy

> **`TZ` na Vercelu nenastavujeme** — Vercel ji rezervuje a runtime je vždy UTC. Kód si timezone (`Europe/Prague`) předává explicitně přes `lib/time.ts`. Lokálně v `.env.local` můžeš mít `TZ=Europe/Prague` pro pohodlí.

## Cron joby

Cron joby běží přes **GitHub Actions**, ne Vercel Cron (viz `DECISIONS.md` D1).
Workflow ve `.github/workflows/cron.yml` volá `https://<deploy>/api/cron/<job>` s autorizací přes `CRON_SECRET` header.
