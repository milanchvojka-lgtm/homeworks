# Architectural Decisions

> Záznam zásadních rozhodnutí, která rozšiřují / upřesňují PRD a IMPLEMENTATION_PLAN.
> Číslováno chronologicky. Při rozporu s plánem má DECISIONS prioritu (novější).

---

## D1 — Cron strategy: GitHub Actions → Vercel endpoint

**Rozhodnutí:** Cron joby NEspouští Vercel Cron. Místo toho GitHub Actions workflow volá HTTPS endpointy na Vercelu (`/api/cron/*`) přes `curl` s autorizací přes `CRON_SECRET` header.

**Důvod:**
- Vercel Hobby cron je omezený na 2 entries × 1×/den. Plán potřebuje 4+ jobů různé frekvence.
- Vercel Pro ($20/měs) porušuje "0 Kč/měsíc" cíl PRD.
- GitHub Actions cron je free (2000 min/měs pro private repo), bez limitů na frekvenci/počet jobů.
- DST: cron běží v UTC, handler ověřuje "je teď to správné okno v `Europe/Prague`?"
- Lokální debug: `curl localhost:3000/api/cron/X` = stejný flow jako produkce.

**Důsledky:**
- `.github/workflows/cron.yml` je load-bearing soubor.
- Endpoint hlavičky musí ověřit `CRON_SECRET` (defense in depth, endpointy jsou veřejné HTTPS).
- GitHub Actions cron má best-effort delay (typicky < 5 min). Pro tuto appku zanedbatelné.

---

## D2 — DailyCheckInstance: eager generování ráno

**Rozhodnutí:** `DailyCheckInstance` se generuje **eager** ranním cronem (00:05 Prague), NE lazy při otevření `/child/today`.

**Důvod:**
- Lazy přístup z plánu M2.5 má díru: pokud holka appku ten den neotevře, instance neexistují → missed cron je nemá co označit jako MISSED → měsíční bonus se připíše neoprávněně.
- Optimalizace nemá hodnotu: 3 holky × ~5 checků = 15 řádků/den, ~5500/rok. Triviální velikost.
- Eager dává jediný zdroj pravdy a zjednodušuje logiku missed/bonus.

**Důsledky:**
- Nový cron job: `daily-rollover` (každé ráno generuje instance pro dnešní den podle `CompetencyAssignment` daného týdne).
- Pokud admin upraví `DailyCheck` šablonu během dne, **existující instance pro dnešek se NEMĚNÍ** (historie zamrzá k okamžiku vzniku). Změna se projeví od dalšího dne.
- `MISSED` cron se zjednoduší: `UPDATE DailyCheckInstance SET status='MISSED' WHERE status='PENDING' AND date < today`.

---

## D3 — Admin notifikace: e-mail digest přes Resend

**Rozhodnutí:** Pro v1 admini dostávají souhrnný e-mail (digest), když mají něco k odbavení (čekající checky, hlášené úkoly, žádosti o obrazovku). Žádné PWA push, žádný Telegram pro v1.

**Důvod:**
- Pouze badge (per PRD) je #1 riziko: rodič si nepamatuje otevřít appku → holka čeká → systém se opotřebí.
- E-mail je nejrobustnější (na telefonu admini už mají e-mail notifikace zapnuté), zero uživatelský setup.
- Resend free tier (3000 e-mailů/měs, 100/den) bohatě stačí.

**Implementace:**
- Tabulka `NotificationQueue` (event log: typ, payload, createdAt, sentAt).
- Při relevantní akci (`SUBMITTED` check, `PENDING_REVIEW` úkol, `PENDING` screen-time request) → enqueue záznam.
- Cron každých 15 min: pokud jsou unsent items A poslední odeslaný digest šel před >10 min → pošli souhrn na admin e-mail(y).
- Safety-net "evening digest" v 20:00 Prague (pokud by se cron job zasekl).

**Out of scope pro v1:** PWA Web Push (zvážit v M6), Telegram, per-event okamžité notifikace.

---

## D5 — Vercel runtime TZ není použitelná, timezone výhradně přes `lib/time.ts`

**Rozhodnutí:** Žádný kód, ani cron handler, **se nesmí spoléhat na `process.env.TZ`** ani na to, že je hostitelský proces v `Europe/Prague`. Veškeré timezone-aware operace (start of day/week, formátování, DST kontroly) se dělají **explicitně přes `PRAGUE_TZ` konstantu z `lib/time.ts`** předanou do `date-fns-tz`.

**Důvod:**
- Vercel rezervuje `TZ` jako systémovou env var. Při pokusu o `Add Environment Variable: TZ=Europe/Prague` Vercel UI vrátí *„Name is reserved"* a deploy zůstane v UTC. Toto **nelze obejít** ani na Pro tieru.
- Lokálně Node `TZ` respektuje, takže by docházelo k driftu mezi local dev a produkcí, kdybychom na ni spoléhali.

**Důsledky:**
- `app/api/cron/*` handlery musí pro „je teď to správné okno v Praze?" kontrolu vždy použít `nowInPrague()` / `startOfDayPrague()` apod., **ne** `new Date()` + lokální offset.
- Health endpoint v `/api/cron/health` schválně nereportuje `runtimeTz` jako warning — Prahy se dosahuje aplikačně, ne runtime nastavením.
- `.env.example` má `TZ=Europe/Prague` jen jako pohodlí pro lokální dev; na Vercelu se ignoruje.

---

## D6 — Vitest pro pure logiku, `-pure.ts` boundary

**Rozhodnutí:** Unit testy přes Vitest, jen pro čisté funkce (rotation, time, výpočty). DB-touching kód se netestuje, ten ověřuje manuální happy path + cron smoke testy. **Konvence:** `lib/foo.ts` (server-only, DB I/O) re-exportuje pure helpery z `lib/foo-pure.ts`. Testy importují vždy `-pure`.

**Důvod:**
- Server-only moduly nelze importovat do testů (`server-only` package házet při importu mimo RSC).
- Mockování Prisma client je upovídané a brittle. Extrakce pure logiky je rychlejší a stejně bezpečnější.
- DST bug v `computeWeekIndex` (spring-forward týden má 167 h, ne 168 h → `Math.floor` vrátí 0 místo 1) by se v UI testu nikdy nevyřešil — unit test ho najde okamžitě.

**Důsledky:**
- Kritická logika z M2/M3 přesunuta do `lib/rotation-pure.ts`, `lib/task-rotation-pure.ts`.
- `npm test` se spouští **po každém milestonu** (ne v CI — solo dev, žádná pipeline pro v1).
- Když přidáváš nové výpočty (M4 kredit, M5 bonus), čistou matematiku vždy do `-pure` modulu.

---

## D7 — Badges: server-side count při renderu layoutu, žádný `lastSeenAt` tracker

**Rozhodnutí:** Badge čísla v navigaci (`Inbox`, `Pool`, `Mé úkoly`) se počítají server-side při každém renderu layoutu jako `db.count` query. **Žádné** sledování „od posledního zobrazení" (které plán M6.2 zmiňoval pro `/child/kredit`).

**Důvod:**
- 5 uživatelů × 5 tabů = max 25 count queries/render. Trivial.
- `lastSeenAt` per uživatele × per sekce = nový sloupec/tabulka + invalidace při akcích + edge cases (admin schválí, ale dítě se zatím nepodívalo). Nevyplatí se na škále jedné rodiny.
- Reset badge na 0 jde sám: jakmile dítě otevře `/child/me-ukoly`, server akce změní stav (CLAIMED → PENDING_REVIEW = mizí z badge), `revalidatePath` přepočítá count.

**Důsledek:**
- `/child/kredit` a `/child/historie` **nemají badge**, ani když se připíše nová transakce. Plán to chtěl, ale bez `lastSeenAt` to není možné. Pokud Milan/holky budou v provozu chybět, doplní se v v2.
- Badges nejsou real-time — dítě musí refreshnout / přejít na jinou stránku, aby se aktualizovaly.

---

## D4 — DB provider: Supabase

**Rozhodnutí:** Postgres přes Supabase (free tier).

**Důvod:**
- Milan už má Supabase účet z jiného projektu = nula context-switchingu.
- Free tier (500 MB) bohatě stačí pro 5 uživatelů a desítky zápisů týdně.
- Používáme **jen Postgres connection** — ne Supabase Auth, Storage ani Realtime. Datový model je portable, případná migrace na Neon = změna `DATABASE_URL`.

---

## D8 — UI design system: shadcn/ui + dark mode přes next-themes

**Rozhodnutí:** Pro v1.1 design pass se přechází z čistého Tailwindu na **shadcn/ui** (Radix primitiva + Tailwind styling, copy-paste do repa, ne dependency). Dark mode přes `next-themes` provider, theme tokens jako CSS proměnné.

**Důvod:**
- v1 child rozhraní bylo „minimal usable" (rámeček + text + emoji). Holky 11/14/15 jsou citlivé na vzhled, gamifikace bez polished UI ztratí účinek.
- shadcn vlastníme ve zdrojáku — žádný vendor lock-in, žádný runtime overhead krom konkrétně použitých komponent.
- Dark mode out of the box přes CSS proměnné. Přidat až dodatečně by vyžadovalo audit všech `bg-white` apod.
- Stack se nemění — pořád Next.js + Tailwind. Jen přidá konzistentní component layer.

**Důsledky:**
- Nová deps: `next-themes`, `lucide-react` (ikony, používá shadcn), `class-variance-authority`, `clsx`, `tailwind-merge`. Všechno zhruba 10 KB gzipped dohromady.
- Komponenty se přidávají selektivně přes `npx shadcn add <name>` — žádný blanket import.
- Theme tokeny v `app/globals.css` jako CSS proměnné, light/dark varianty.
- Admin rozhraní (M0–M6) zůstane funkčně beze změny, ale graficky se sjednotí do stejného design language při příležitostných úpravách (žádný explicit refactor pass na admin v rámci v1.1).
- Existující `app/child/_components/*` komponenty se postupně přepíší na shadcn ekvivalenty (Card, Button, Progress, Badge, Dialog, Switch atd.).

---

## D9 — Měsíční bonus: gradient místo binárního (varianta B)

**Rozhodnutí:** `getBonusStatus()` přechází z binárního `{ stillInGame: bool, lostOn? }` na gradient `{ misses, currentBonusCzk, fullBonusCzk, stepCzk, lostOn }`. Bonus klesá lineárně po každém zaváhání: 200 → 150 → 100 → 50 → 0 (default `monthlyBonusCzk=200`, `monthlyBonusStepCzk=50`).

**Důvod:**
- v1 binární bonus ("1 zaváhání = 0 Kč") byl pro děti příliš tvrdý — po prvním slipu už nebylo o co bojovat zbytek měsíce.
- Gradient zachovává motivaci: "ještě stále něco v sázce" platí až do 4. zaváhání.
- "Zaváhání" = kalendářní den se MISSED nebo REJECTED checkem. Víc selhání ten samý den = stále jedno zaváhání (jinak by se to stalo neprůhledným).

**Důsledky:**
- `lib/bonus-pure.ts::evaluateBonusStatus` nahrazeno za `countMissedDays` + `earliestMissDate`.
- Pure výpočet je v `lib/bonus-graduated.ts::computeMonthlyBonus({ misses, fullCzk, stepCzk })` s testy.
- `monthly-close` cron používá `currentBonusCzk` místo flat `settings.monthlyBonusCzk`.
- `BonusBanner` má 3 vizuální stavy (full / reduced / lost) — pak ho v Phase 4 nahradil `StreakBanner`.
- Plná částka i krok jsou editovatelné v `app/admin/nastaveni`.

---

## D10 — Konfigurace bonusu/milníků: extend AppSettings, ne nová tabulka

**Rozhodnutí:** Globální konfigurace pro v1.1 streak gamifikaci se přidává do existující tabulky `AppSettings` (rozšíření o `monthlyBonusStepCzk`), milníky do nové tabulky `StreakMilestone`. Žádný nový "Settings" model — `AppSettings` už je singleton se vším potřebným.

**Důvod:**
- `AppSettings` v M0 už drží `monthlyBonusCzk`, `hourlyRateCzk`, `screenTimeHourCostCzk` apod. — single source of truth pro globální parametry.
- Vytvořit paralelní "Settings" tabulku by znamenalo dva singletony, dva fetchy, riziko driftu.
- `StreakMilestone` je samostatná tabulka, protože je to **kolekce** záznamů (7d, 14d, 30d, ...), ne jeden řádek.

**Důsledky:**
- `lib/credit.ts::getAppSettings()` (existující helper) zůstává jediným vstupem do globální konfigurace.
- Per-uživatel `User.monthlyBonusCzk` v plánu zmiňovaný NEEXISTOVAL — bonus byl globální už v M5.
- Admin form v `app/admin/nastaveni` rozšířen o `monthlyBonusStepCzk` + sekce pro CRUD milníků.

---

## D11 — Streak gamifikace: hybrid (streak napříč měsíci + měsíční bonus paralelně)

**Rozhodnutí:** Místo nahrazení měsíčního bonusu klasickým Duolingo streakem zavádíme **dvě paralelní vrstvy** nad denními checks:
1. **Streak** — počet po sobě jdoucích APPROVED dnů, běží napříč kalendářem, padá na 0 při MISSED/REJECTED. Používá se pro tier rank (Bronze/Silver/Gold/Platinum/Diamond/Master) a opakovatelné milníkové trofeje.
2. **Měsíční bonus** — gradient (D9), vázaný na kalendářní měsíc, peněžní výplata.

**Důvod:**
- Ryze monthly bonus má díru: po prvním zaváhání 1. týden v měsíci nemáš denní motivaci, dokud nezačne nový měsíc.
- Ryze Duolingo streak by odpojil peníze od kalendáře a pro Milana/Teri to znamená nepředvídatelnou výplatu.
- Hybrid řeší obojí: streak motivuje **dnes**, bonus motivuje **měsíc**. Ten samý zaváhací den ovlivní obě vrstvy nezávisle.

**Důsledky:**
- Nový schema: `User.currentStreak/longestStreak/lastStreakDate/brokenStreaksCount`, modely `StreakMilestone` a `TrophyEarned`, enum `TransactionType.STREAK_MILESTONE`.
- `daily-close` cron updatuje streak po MISSED conversion + detekuje milníky (cycle-aware dedup — ten samý milník v jednom uninterrupted runu nesmí dostat dvě trofeje).
- `weekly-close` cron vyplácí pending trofejní bonusy přes `CreditTransaction(STREAK_MILESTONE)`, lumps do `WeeklyPayout.bonusCzk`.
- 6 default milníků seedovaných: Iron Will (7d, 0 Kč), Steady (14d, 0 Kč), Flawless Month (30d, 100 Kč), Unbreakable (60d, 200 Kč), Centurion (100d, 500 Kč), Legend (365d, 2000 Kč). Editovatelné v adminu.
- Trofeje jsou opakovatelné per cyklus — když streak padne a dítě postaví novou řadu přes 30 dnů, dostane Flawless Month znovu (a 100 Kč znovu).

---

## D12 — Design system: shadcn/ui base-sera preset (b3SlZvnfF)

**Rozhodnutí:** v1.1 dělá design pass napříč child appkou na shadcn/ui s presetem `b3SlZvnfF` (style "base-sera", base color "mauve", purple primary `oklch(0.496 0.265 301.924)`, lime chart-1 pro data, Source Sans 3 font, dark mode).

**Důvod:**
- v1 child screens byly "minimal usable UI" — funkční, ale 14/15letý uživatelky to demotivuje. Gamifikace bez polished UI ztratí účinek.
- shadcn = kopíruje zdroják do repa, žádný vendor lock-in, žádný runtime overhead.
- Preset má sharp aesthetic, který funguje napříč věkem (11/14/15) — Milan ho schválil v Design Labu (varianta D).

**Důsledky:**
- Nové deps: `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`. `next-themes` nahrazena custom impl (D8 update — viz níže).
- Theme tokens v `app/globals.css` jako CSS proměnné. Light mode `--chart-1` posunut z `oklch(0.897…)` na `oklch(0.55 0.17 131)` pro WCAG AA na bílém pozadí.
- Admin rozhraní zůstalo "lighter" — Phase 6 ho dodělá v dalším kroku.

**Update D8:** Custom theme provider (místo next-themes) — knihovna injectuje `<script>` uvnitř React komponenty, což React 19 / Next 16 flag-ují jako warning. Vlastní impl (`components/theme-provider.tsx`) používá `next/script` s `strategy="beforeInteractive"` v root layoutu pro FOUC prevention bez React warningu.

---

## D13 — Supabase RLS: enable přes SQL skript, Prisma jde přes service_role

**Rozhodnutí:** Před production deployem v1.1 zapnout Row-Level Security na všech 17 aplikačních tabulkách v Supabase. Jediná policy na každé tabulce: `service_role_all` (FOR ALL TO service_role USING (true)). `anon` a `authenticated` role mají odebrané všechny granty.

**Důvod:**
- Supabase advisor (2026-04-29) flagoval `rls_disabled_in_public` a `sensitive_columns_exposed` jako critical issues. Při leaknutí anon klíče by data (včetně `User.pinHash`) byla čitelná přes PostgREST.
- Prisma se připojuje přes pooler/service_role connection (D4) — RLS policy nezasahuje (service_role má `BYPASSRLS`). App nepřestane fungovat.
- Skript je idempotentní + má rollback note + sanity-check query.

**Důsledky:**
- Skript `prisma/security/enable-rls.sql` v repu, jednorázově spuštěn v Supabase SQL Editoru před production deployem.
- LAUNCH_CHECKLIST má RLS jako blocker.
- Pokud se v budoucnu přidá frontend přístup přes `@supabase/supabase-js` s anon klíčem (např. realtime subscriptions), RLS policies pro `authenticated` se musí dopsat per use case.
