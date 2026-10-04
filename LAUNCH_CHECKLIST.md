# Launch Checklist — co musí Milan udělat před ostrým spuštěním v1

> v1 je technicky kompletní (M0–M6). Tento dokument shrnuje to, co Claude
> nemůže udělat za tebe — vyžaduje to tvé rozhodnutí, reálná data nebo přístup
> ke službám.
>
> Pořadí je doporučené, ne závazné.

---

## 1. PWA ikony

**Status:** ✅ Hotovo (2026-09-26) — ikona „domeček s fajfkou" (růžové pozadí), návrh v `_design/homeworks.pen` (sekce „HW · Ikona appky"). `app/icon.png` + `app/apple-icon.png` (Next file convention), v manifestu `icon-192/512.png` + `icon-maskable-512.png` (motiv v bezpečné zóně). Na telefonu appku z plochy smazat a přidat znovu, iOS si jinak ikonu nepřenačte.

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

> Region funkcí je pinnutý na `fra1` ve `vercel.json` (D14) — v dashboardu nic nenastavuj. Ověření: hlavička `x-vercel-id` musí končit `…::fra1::…`, ne `iad1`.

V Vercel projektu → Settings → Environment Variables (Production):

- `DATABASE_URL` — Supabase pooler URL (port 6543, `?pgbouncer=true&connection_limit=1`)
- `DIRECT_URL` — Supabase direct URL (port 5432) — pro Prisma migrace
- `CRON_SECRET` — `openssl rand -hex 32`, nový pro produkci
- `RESEND_API_KEY` — z <https://resend.com/api-keys>
- `ADMIN_NOTIFICATION_EMAILS` — comma-separated, např. `milan@x.cz,teri@x.cz`
- `APP_URL` — `https://homeworks-xxx.vercel.app` (kořen produkčního deploye)
- `NOTIFICATION_FROM_EMAIL` — volitelné, default `Homeworks <onboarding@resend.dev>`. Pro vlastní doménu nastav v Resend a sem doplň `Homeworks <noreply@tvoje-domena.cz>`.

- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` — klíče pro push (D28), vygeneruj jednou `npx web-push generate-vapid-keys`. **Neměň je**, výměna zneplatní všechny odběry na telefonech.
- `VAPID_SUBJECT` — `mailto:` adresa správce, např. `mailto:milan@x.cz`.

**Pořadí nasazení D28 (push) — na pořadí záleží:**
1. VAPID klíče do Vercelu (Production). `NEXT_PUBLIC_` klíč se vkládá do kódu při buildu, takže musí být nastavený **před** nasazením, jinak telefony dostanou prázdný klíč a zapnutí tiše selže.
2. `npx prisma db push` na produkci (přidá `PushSubscription` a `ReminderLog`, na stávající data nesahá). Kód bez tabulek by shazoval cron `reminders` každých 15 min.
3. Znovu `prisma/security/enable-rls.sql` (§7.5).
4. `npm test` + `npm run test:sim`.
5. Push do `main` (nový build se správným klíčem).
6. `gh workflow run cron.yml -f endpoint=reminders` → 200 a rozumné počty v odpovědi (500 = chybí proměnné nebo selhal e-mail).
7. Test na iPhonu (IMPLEMENTATION_PLAN 9.0).
8. Zjistit u holek, kdy jim začíná klidový režim v Čase u obrazovky.

- `LANDING_LEADS_EMAIL` — volitelné (D26): kam chodí zájemci a odpovědi z `/pro-rodice`. Když chybí, použije se `ADMIN_NOTIFICATION_EMAILS`.

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

**M11 (D32/D33) — nasazení na ostrou DB, v tomto pořadí (s Milanovým OK):**
1. Smazat staré týdenní přiřazení rolí (`DELETE FROM "CompetencyAssignment";`), jinak `db push` nepřidá povinný sloupec `date`. Historii výplat, řady ani povinností to nemaže.
2. `prisma db push` na ostré schéma (přidá `CompetencyAssignment.date`, `DailyCheck.description`).
3. Push do `main` (deploy). Ranní `daily-rollover` od té chvíle přiřazuje role na den; dnešní role doplní ruční spuštění `daily-rollover` (workflow_dispatch).
4. V `/admin/kompetence` nahradit staré kompetence katalogem (`docs/2026-10-04-katalog-ukolu.md`): Kuchyň a stůl (3 povinnosti, termín 17:00) · Obývák (3) · Prádlo a koupelna (2), s popisy „Co to znamená“. Pořadí kompetencí = pořadí rolí.
5. V `/admin/ukoly` založit týdenní extra úkoly: Obývák je vysátý 50 Kč · V obýváku není prach 50 Kč · Koupelna dole i nahoře je čistá 80 Kč.

**Pozor:** I po reset PINu zůstává seed funkce idempotentní — když omylem spustíš `npm run db:seed` na produkci, **přepíše PINy zpátky na `1234`**. Buď ji v `prisma/seed.ts` zakomentuj před deploy, nebo prostě nikdy neneskočil `db:seed` na produkci.

---

## 4.5 Demo routy — smazat nebo zamknout (blocker)

**Status:** ✅ Hotovo (2026-09-26) — smazáno z `main`, obsah zálohovaný v branchi `demo-archive`. Po příštím deployi ověř, že `/showcase` vrací 404.

**Co:** `app/lab`, `app/preview`, `app/showcase`, `app/mockup`, `app/slides`, `app/pitch` jsou veřejně dostupné (nejsou v matcheru `proxy.ts`) a showcase/slides obsahují jména dcer, reálné částky a interní pitch. Detail: IMPLEMENTATION_PLAN.md → Tech debt backlog TD1.

**Jak:**
1. Obsah, který chceš uchovat, přesuň do branche `demo-archive` (`git checkout -b demo-archive && git push`).
2. V `main` smaž všech 6 adresářů (M7 Phase 7 už počítá s `lab` + `mockup`).
3. Ověř build (`npm run build`) a že `/showcase` na preview deployi vrací 404.

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

**Spuštění naživo s holkami (D25, scénář 11)** — neděle večer, všichni u stolu:
1. Každá si přidá appku na plochu (kroky výše) a otevře ji.
2. Vybere profil, zadá dočasný PIN, projde uvítání a nastaví si vlastní PIN.
3. Na konci uvítání zapne připomínky (D28) a iOS se zeptá na povolení → **Povolit**. Ověř v Nastavení → Oznámení → Homeworks, že jsou zapnuté i odznaky. Zkontroluj, že klidový režim v Čase u obrazovky nezačíná před 21:30, jinak poslední připomínka nedorazí.
4. Na Dnes odškrtne první povinnost naostro; rodič ji hned schválí v Schválit → holka vidí celý koloběh a vstupní bonus 100 Kč.
5. První týden je na zkoušku: zmeškání nepřeruší řadu ani nesníží bonus.

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

**Status:** ✅ Hotovo (2026-05-03). Znovu spuštěno 2026-09-29 — `Absence` byla bez RLS; skript teď bere všechny tabulky v `public` (D13). Po každé nové tabulce pusť znovu.

**Co:** Před production deployem je potřeba zapnout Row-Level Security na všech 17 aplikačních tabulkách v Supabase. Bez RLS je každá tabulka veřejně čitelná přes PostgREST anon API — Supabase Advisor to flag-ne jako critical (`rls_disabled_in_public`, `sensitive_columns_exposed`).

**Jak:**
1. Supabase Dashboard → SQL Editor → New query.
2. Copy-paste obsah `prisma/security/enable-rls.sql` (idempotentní, bezpečně re-runnable).
3. Run.
4. Skript spustí sanity-check query — všechny tabulky musí mít `rowsecurity = true`.
5. Re-run Supabase Advisor — kritické issues musí zmizet.

**Co se může pokazit:** App by neměla přestat fungovat (Prisma jde přes service_role / pooler, který má `BYPASSRLS`). Pokud přesto, rollback je `ALTER TABLE ... DISABLE ROW LEVEL SECURITY` per tabulka.

**D28 (2026-09-29):** přibyly tabulky `PushSubscription` a `ReminderLog`. Po `db push` na produkci pusť `prisma/security/enable-rls.sql` znovu (nové tabulky startují s RLS vypnutým).

**Pokud v budoucnu přidáš `@supabase/supabase-js` přímo do frontendu** (např. realtime subscriptions): musíš dopsat policies pro `authenticated` role per tabulka. RLS skript je intentionally restrictive.

---

## 8. v2 kandidáti (pro retrospektivu)

Z plánu (mimo v1 scope):

- Pause režim (nemoc, výlet)
- ~~Web Push notifikace~~ — **přesunuto do v1 před launch (D28, 2026-09-29)**, včetně čísla na ikoně appky. Badge na ikoně na iPhonu umí jen web appka přidaná na plochu s povolenými notifikacemi a bez push se obnoví jen při otevření appky, takže je součástí push práce, ne samostatná položka. Milan to považuje za klíčové pro launch (děti zapomenou odškrtat), analýza v `docs/2026-09-29-analyza-pripominky.md`.
- `lastSeenAt` tracker pro badges (viz D7)
- Bonus za perfektní týden
- Admin „Obrazovka" historie (PENDING + APPROVED + REJECTED, mimo Inbox)
- Undo schválení
- Auto-approve obrazovky pod limit
- PNG export ikon (po D7)
- **Víc rodin v jedné appce (probráno 2026-09-28, vrátíme se po launchi, zatím nerozpracovávat).** Milan zvolil variantu B: tabulka `Family` + `familyId` na všech datech, každý dotaz omezený na rodinu (dnes 18 modelů, ~147 dotazů ve 48 souborech), přihlášení na adrese rodiny (dnešní `/` vypisuje všechny uživatele = únik jmen), nastavení / e-maily / crony po rodinách, super-admin `/super` na zakládání rodin, testy izolace + simulace se dvěma rodinami. Odhad ~6–8 pracovních dnů. Zamítnuto: klon nasazení na rodinu (náklady a údržba ×N), schéma na rodinu (Prisma + serverless). Až se k tomu vrátíme → nový záznam v DECISIONS a patch PRD („multi-tenant mimo v1“).
