# Launch Checklist — co musí Milan udělat před ostrým spuštěním v1

> v1 je technicky kompletní (M0–M6). Tento dokument shrnuje to, co Claude
> nemůže udělat za tebe — vyžaduje to tvé rozhodnutí, reálná data nebo přístup
> ke službám.
>
> Pořadí je doporučené, ne závazné.

---

## 1. PWA ikony

**Co:** SVG placeholder v `public/icon.svg` zafunguje na většině zařízení, ale iOS Safari pro „Add to Home Screen" oficiálně chce PNG. Před ostrým launchem nahraď reálnými.

**Jak:**
1. Vyber/nakresli logo (jednoduchý znak v 1024×1024).
2. Nahraj na <https://realfavicongenerator.net/> → vygeneruje set PNG (192, 512, apple-touch).
3. Nahraj `icon-192.png` a `icon-512.png` do `public/`.
4. Uprav `public/manifest.json`:
   ```json
   "icons": [
     { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
     { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" }
   ]
   ```
5. Uprav `app/layout.tsx`:
   ```ts
   icons: { icon: "/icon-192.png", apple: "/icon-192.png" }
   ```

---

## 2. Vercel — production ENV

V Vercel projektu → Settings → Environment Variables (Production):

- `DATABASE_URL` — Supabase pooler URL (port 6543, `?pgbouncer=true&connection_limit=1`)
- `DIRECT_URL` — Supabase direct URL (port 5432) — pro Prisma migrace
- `CRON_SECRET` — `openssl rand -hex 32`, nový pro produkci
- `RESEND_API_KEY` — z <https://resend.com/api-keys>
- `ADMIN_NOTIFICATION_EMAILS` — comma-separated, např. `milan@x.cz,teri@x.cz`
- `APP_URL` — `https://homeworks-xxx.vercel.app` (kořen produkčního deploye)
- `NOTIFICATION_FROM_EMAIL` — volitelné, default `Homeworks <onboarding@resend.dev>`. Pro vlastní doménu nastav v Resend a sem doplň `Homeworks <noreply@tvoje-domena.cz>`.

**NE** nastavovat `TZ` — Vercel ji rezervuje (viz D5).

---

## 3. GitHub Actions — repo secrets

V GitHubu → Settings → Secrets and variables → Actions:

- `DEPLOY_URL` — kořen produkčního deploye (stejné jako `APP_URL`)
- `CRON_SECRET` — **stejný** jako na Vercelu

Po deploy ověř workflow:
```
gh workflow run cron.yml -f endpoint=health
gh run watch
```

---

## 4. Reálná data v DB

Default seed obsahuje testovací data (Milan, Teri, Ani, Emi, Neli, default PIN `1234`, ukázkové kompetence). Před spuštěním:

**Volba A — full reset (čistší):**
```
npx prisma db push --force-reset
# pak ručně přes /admin/* UI:
#  - vytvoř 5 reálných profilů (musíš upravit seed nebo přidat /admin/uzivatele
#    s create — zatím jen reset PINu existujících)
#  - vytvoř kompetence + denní checky (Milan + manželka definuje obsah)
#  - vytvoř první úkoly do poolu
#  - v /admin/nastaveni zkontroluj sazby (default 150 Kč/h, screen 200 Kč/h, bonus 200 Kč)
```

**Volba B — postupná úprava (rychlejší):**
1. Nech v DB Milan, Teri, Ani, Emi, Neli (jména už sedí).
2. V `/admin/uzivatele` resetni každému PIN (`Reset PINu` → dočasný `0000`).
3. Předej rodinným členům `0000`, ať si v `/child/nastaveni` (nebo po loginu) nastaví vlastní.
4. V `/admin/kompetence` uprav popisky checků.
5. V `/admin/ukoly` přidej první ad-hoc + opakující se úkoly.
6. V `/admin/nastaveni` finalizuj sazby.

**Pozor:** I po reset PINu zůstává seed funkce idempotentní — když omylem spustíš `npm run db:seed` na produkci, **přepíše PINy zpátky na `1234`**. Buď ji v `prisma/seed.ts` zakomentuj před deploy, nebo prostě nikdy neneskočil `db:seed` na produkci.

---

## 5. Smoke test produkčního deploye

Po deploy + nastavení secrets:

1. `https://<app>.vercel.app` → vidíš login screen s 5 profily ✓
2. Login jako admin → otevři `/admin` (Inbox) ✓
3. Login jako dítě → otevři `/child` (Dnes) — pokud ještě neproběhl daily-rollover, pole bude prázdné, to je OK ✓
4. Manuální cron triggers v GitHub Actions (`gh workflow run cron.yml -f endpoint=daily-rollover`) → ověř, že vznikly `DailyCheckInstance` ✓
5. End-to-end: dítě klikne Hotovo → admin vidí v Inboxu → schválí → kredit se připíše ✓

---

## 6. Nainstaluj na home screen iPhonu

1. Otevři produkční URL v **Safari** (ne Chrome — iOS PWA jde jen přes Safari).
2. Share button → „Add to Home Screen".
3. Otevři ikonu z home screen → měla by se otevřít fullscreen, bez Safari toolbaru.
4. Ověř, že login flow funguje a session přežije zavření/otevření appky.

Udělej totéž na všech relevantních zařízeních (Milan, Teri, holky).

---

## 7. První 2 týdny v provozu

Pravidelně koukej:

- **Resend dashboard** — chodí admin digesty? Spam folder?
- **Supabase logs** — žádné error spikes?
- **Vercel deployment logs** — chyby v cron handlerech?
- **Family feedback** — kde se zasekávají, co matou jména/UI texty?

Drobné úpravy texty/defaultní hodnoty dělej průběžně. Větší změny si schovej do v2 retrospektivy (po ~3 měsících).

---

## 7.5 Supabase RLS (v1.1 — viz DECISIONS D13)

**Status:** ✅ Hotovo (2026-05-03).

**Co:** Před production deployem je potřeba zapnout Row-Level Security na všech 17 aplikačních tabulkách v Supabase. Bez RLS je každá tabulka veřejně čitelná přes PostgREST anon API — Supabase Advisor to flag-ne jako critical (`rls_disabled_in_public`, `sensitive_columns_exposed`).

**Jak:**
1. Supabase Dashboard → SQL Editor → New query.
2. Copy-paste obsah `prisma/security/enable-rls.sql` (idempotentní, bezpečně re-runnable).
3. Run.
4. Skript spustí sanity-check query — všechny tabulky musí mít `rowsecurity = true`.
5. Re-run Supabase Advisor — kritické issues musí zmizet.

**Co se může pokazit:** App by neměla přestat fungovat (Prisma jde přes service_role / pooler, který má `BYPASSRLS`). Pokud přesto, rollback je `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` per tabulka.

**Pokud v budoucnu přidáš `@supabase/supabase-js` přímo do frontendu** (např. realtime subscriptions): musíš dopsat policies pro `authenticated` role per tabulka. RLS skript je intentionally restrictive.

---

## 8. v2 kandidáti (pro retrospektivu)

Z plánu (mimo v1 scope):

- Pause režim (nemoc, výlet)
- Web Push notifikace
- `lastSeenAt` tracker pro badges (viz D7)
- Bonus za perfektní týden
- Admin „Obrazovka" historie (PENDING + APPROVED + REJECTED, mimo Inbox)
- Undo schválení
- Auto-approve obrazovky pod limit
- PNG export ikon (po D7)
