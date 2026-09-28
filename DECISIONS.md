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
- DST: cron běží v UTC, handler ověřuje "je teď to správné okno v `Europe/Prague`?" *(nahrazeno D21: uzávěrky dohánějí ukončená období, nečtou „teď“)*
- Lokální debug: `curl localhost:3000/api/cron/X` = stejný flow jako produkce.

**Důsledky:**
- `.github/workflows/cron.yml` je load-bearing soubor.
- Endpoint hlavičky musí ověřit `CRON_SECRET` (defense in depth, endpointy jsou veřejné HTTPS).
- GitHub Actions cron má best-effort delay. *(Neplatí „typicky < 5 min“: 26.–27. 9. 2026 zpoždění přes 2 h, viz D21.)*

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

---

## D14 — Vercel function region: `fra1` (Frankfurt), pinnuto ve `vercel.json`

**Rozhodnutí:** Serverless funkce (RSC render, server actions, `/api/cron/*`) běží v regionu `fra1`. Nastaveno v `vercel.json` (`"regions": ["fra1"]`), ne v dashboardu — ať je to verzované a přežije případný re-import projektu.

**Důvod:**
- Vercel default je `iad1` (Washington). Supabase DB je v `eu-central-2` (Curych). Každý Prisma dotaz tak dělal round-trip přes Atlantik (~100 ms).
- Jedna interakce = server action + re-render (session lookup, badges v layoutu, page data) = 10–15 sekvenčních dotazů → 1–2 s latence na klik. Naměřeno při pilotu 2026-09-26 (`x-vercel-id: fra1::iad1::…`, TTFB 0,75–1,4 s i na login screenu).
- `fra1` je nejbližší Vercel region k Curychu (~5–10 ms RTT). Na Hobby plánu je volba jednoho regionu zdarma.

**Důsledky:**
- Nový soubor `vercel.json` v rootu repa (jen `regions`).
- Pokud se někdy DB přesune (jiný Supabase projekt/region), region funkcí musí jít s ní — vždy stejný nebo nejbližší region jako DB.
- Cron (D1) se nemění — GitHub Actions jen volá URL, region funkcí je mu jedno.

---

## D15 — Design systém: vlastní kopie 2FRESH design systému (Offer Buddy), jen světlý režim *(tmavý režim změněn v D17)*

**Rozhodnutí:** Homeworks přebírá design systém 2FRESH z Offer Buddyho (`offer-buddy/app/globals.css`, brief `2f-product/projects/offer-buddy/design/2026-08-31-design-system-brief.md`) jako **vlastní kopii**, nesdílenou a nesynchronizovanou s originálem. Nahrazuje vizuál z D12 (shadcn preset base-sera, fialová, Source Sans 3) a tmavý režim z D8.

- **Dvě vrstvy tokenů v `app/globals.css`:** (1) zdrojové tokeny `--hw-*` (hodnoty zkopírované z `--ob-*`: paper, card, hair, rule, ink, ink-60, ink-35, pink, pink-bg a čtyři stavové páry amber/blue/green/red); (2) sémantické aliasy, které čtou shadcn komponenty (`--background`, `--primary`, `--muted-foreground`, `--border`, …) a nové stavové aliasy (`--success`, `--warning`, `--info`, `--danger` + `-soft`), mapované do Tailwindu přes `@theme inline`.
- **shadcn komponenty zůstávají** (`components/ui/*`), přebarví se přes aliasy. Tvar komponent (radius, velikosti) se ladí v jejich zdrojovém souboru, ne na stránkách.
- **Písmo:** IBM Plex Sans (UI) + IBM Plex Mono (čísla, kickery).
- **Jen světlý režim.** Přepínač motivu a theme provider odcházejí.
- **Mobilní úprava** (škála písma, dotykové plochy, spodní navigace, safe area, PWA) se popíše v `docs/design/…-design-system-mobil.md` a schválí před redesignem obrazovek.

**Důvod:**
- Milan chce vycházet ze systému, který zná a používá v 2FRESH produktech, a mít ho v repu jako vlastní hřiště, které se může od originálu vzdálit.
- Dvě vrstvy tokenů = budoucí ladění na jednom místě (hodnota tokenu), bez přepisování komponent. Nahradit shadcn primitivy z Offer Buddyho by nic nepřidalo (jsou to taky Tailwind třídy nad tokeny) a ztratila by se přístupnost, kterou shadcn řeší (Dialog, focus).
- Tmavý režim je pro rodinnou appku volitelný; kdyby se vrátil, doplní se jen druhá sada hodnot aliasů.

**Jak to bude vypadat:** teplé papírové pozadí `#F4F3F0`, bílé karty, téměř černý text a hlavní tlačítko, růžová `#FF77AA` pro aktivní stav a zvýraznění čísel (streak, kredit), stavy checků a úkolů v amber (čeká), zelené (schváleno), červené (vráceno) a modré (info).

**Co to neznamená:** nesdílíme kód ani pen s Offer Buddym, žádný kontrolní skript shody (`kontrola-design-systemu.py` sem nepatří). Tokeny se nasazují hned; redesign obrazovek (hierarchie, navigace) je samostatný krok podle D16.

**Důsledky:**
- `app/globals.css` přepsán, `app/layout.tsx` načítá IBM Plex, `components/theme-*` smazány, `dark:` třídy bez efektu (uklidí se při redesignu dané obrazovky).
- D8 (dark mode) a vizuální část D12 neplatí; struktura shadcn z D12 platí dál.
- Knihovna komponent v `_design/homeworks.pen` vznikne z `offer-buddy-design-system.pen` jako kopie.

---

## D16 — Postup návrhu rozhraní: scénáře → tok → smlouva rozsahu → pen → kód

**Rozhodnutí:** UI změny, které mění obsah nebo tok obrazovek, se dělají postupem 2FRESH (Goodwinová, Goal-Directed Design): **kontextové scénáře → struktura a tok bez obrazovek (dvě varianty) → smlouva rozsahu „co měníme / co ne" → návrh v penu (`_design/homeworks.pen`) + průchod scénáři → kód → ověření v appce proti framu → dorovnání penu.** Každý krok schvaluje Milan; do penu se kreslí až po jeho „kresli".

- Dokumenty žijí v `docs/design/` jako datované soubory: `RRRR-MM-DD-scenare.md`, `RRRR-MM-DD-struktura-a-tok.md`, `RRRR-MM-DD-<obrazovka>-co-menime-co-ne.md`, brief design systému.
- Vlastní skilly v `.claude/skills/`: `design-to-code` (disciplína implementace designu, mapa tokenů a komponent Homeworks) a `kontextove-scenare` (jak psát scénáře a tabulku potřeb). Jsou to upravené kopie z `2f-product`, nesynchronizované.

**Důvod:** Milan (2026-09-26): současné UI „nemá focus, všechno je naházené na jedné stránce" — rozložení informací neodpovídá tomu, jak appku rodina používá. Obrazovky se proto odvodí ze scénářů, ne z hlavy. Postup je ověřený v 2FRESH produktech.

**Jak to bude vypadat:** redesign začne 4–6 scénáři (dítě ráno / odpoledne / chce vydělat / chce obrazovku; rodič schvaluje během dne / nedělní výplata), z tabulek potřeb vznikne tok a obsah každé obrazovky.

**Co to neznamená:** drobné opravy (text, barva, bug) scénáře nepotřebují. Admin se redesignuje jen tam, kde to vyžadují rodičovské scénáře.

**Důsledky:**
- CLAUDE.md: okruh dokumentace rozšířen o `docs/` (design dokumenty); nové `.md` mimo `docs/` dál ne.
- IMPLEMENTATION_PLAN: milník M8 — Redesign.

---

## D17 — Tmavý režim: ano, podle nastavení telefonu (mění D15) *(přepínač doplněn 2026-09-26, viz Update D17)*

**Rozhodnutí:** Homeworks dostane tmavý režim. Přepíná se automaticky podle nastavení telefonu (`prefers-color-scheme`), bez přepínače v appce. Realizace přes druhou sadu hodnot zdrojových tokenů `--hw-*` v `app/globals.css` (aliasy a komponenty se nemění, D15 dvě vrstvy tokenů). Tmavá paleta je v penu jako proměnné `hw-*` s motivem `mode: dark` (návrh 2026-09-26, frame `HW1 · 01A4 · dark`).

**Důvod:** Milan (2026-09-26) po zkoušce v penu: „dark mode chci, vypadá to skvěle". Dvouvrstvé tokeny z D15 dělají tmavý režim levným: jedna sada hodnot navíc.

**Jak to bude vypadat:** tmavé pozadí `#141518`, karty `#1E2024`, světlý text `#F2F1ED`, růžová beze změny, stavové barvy zesvětlené pro čitelnost na tmavém (amber `#E2AC45`, zelená `#5CC592`, červená `#F07A6F`, modrá `#7DA6EC`).

**Co to neznamená:** žádný přepínač v appce (to byl D8, zůstává zrušený) a žádná knihovna (`next-themes` ne). Zbylé `dark:` třídy ze shadcn se uklidí při redesignu obrazovek (M8.5), protože `dark` varianta se napojí na `prefers-color-scheme`.

**Důsledky:**
- D15 „jen světlý režim" neplatí; zbytek D15 platí.
- `@custom-variant dark` v `globals.css` se přepne z třídy `.dark` na `@media (prefers-color-scheme: dark)`, stavový řádek PWA dostane `theme-color` pro oba režimy.
- Brief `docs/design/2026-09-26-design-system-mobil.md` doplněn o tmavou paletu.

---

## D18 — Volitelný čas termínu u denní povinnosti (`DailyCheck.dueTime`)

**Rozhodnutí:** `DailyCheck` dostane volitelné pole `dueTime` (text `HH:mm`, Europe/Prague), které nastaví admin u každé povinnosti. Dítě vidí na kartě povinnosti „DO {dueTime}" a zbývající čas; bez `dueTime` se zobrazí „DO 23:59" a odpočet do půlnoci.

**Důvod:** Milan (2026-09-26, iterace 5 v penu): rodinný rytmus má dva checkpointy (kuchyň připravená na večeři v 17:00, kuchyň připravená na ráno do večera) a dítěti pomůže vidět, kolik mu zbývá. Dnes „17:00" existovalo jen jako text v názvu povinnosti, což vedlo k duplicitě na kartě.

**Jak to bude vypadat:** karta povinnosti „DO 17:00 · zbývá 25 min" (pod hodinu amber), název „Linka prázdná" bez času. V adminu u povinnosti volitelné pole „Termín (do kolika)".

**Co to neznamená:** termín **nemění pravidla**. Zmeškání (`MISSED`) je dál ve 23:59 (`daily-close`), streak, bonus a pravidlo „úkol z poolu až po všech dnešních povinnostech" se nemění. Po termínu karta ukáže, že termín prošel, ale povinnost jde splnit do půlnoci.

**Důsledky:**
- Prisma: `dueTime String?` na `DailyCheck`, `db push` (bez migrací, TD3).
- Admin formulář kompetencí: pole termín.
- `timeOfDay` zůstává kvůli řazení; v UI dítěte se už nezobrazuje.
- Názvy povinností v pilotní DB bez času v závorce („Linka prázdná", „Stůl čistý").

**Update D17 (2026-09-26, Milan po vyzkoušení na telefonu):** v appce bude i ruční přepínač **Vzhled: Automaticky / Světlý / Tmavý** v záložce Já (výchozí Automaticky = podle telefonu). Volba se ukládá do cookie `hw_theme` (bez knihovny, bez skriptu před hydratací), root layout podle ní nastaví `data-theme` na `<html>` už na serveru, takže nebliká. CSS: tmavé hodnoty platí pro `[data-theme=dark]` a pro systémový tmavý režim, pokud není `[data-theme=light]`. Věta „žádný přepínač v appce" výše tím neplatí; `next-themes` dál ne.

---

## D19 — Rodič zapíše obrazovku za dítě

**Rozhodnutí:** rodič může v detailu dítěte zapsat čas u obrazovky, o který dítě požádalo mimo appku (ústně, jinou appkou). Zápis vznikne rovnou jako schválený `ScreenTimeRequest` (`status APPROVED`, `reviewerId` = rodič, `reviewedAt` = teď) a transakce `SCREEN_TIME`, stejně jako po schválení žádosti dítěte. **Platí stejné pravidlo kreditu jako u žádosti dítěte:** když dítě nemá dost kreditu, zápis nejde (`insufficient_credit`), kredit nejde do mínusu.

**Důvod:** Milan (2026-09-26, scénář 5): o obrazovku se žádá „ústně nebo jinou appkou, ale chceme to evidovat tam". Varianta s mínusem (odečíst z příští výplaty) zamítnuta, aby platilo jedno pravidlo pro obě cesty.

**Důsledky:**
- Nová server action `recordScreenTimeAction(userId, minutes)` jen pro admina, validace granularity a kreditu jako `requestScreenTimeAction`.
- Bez změny schématu, bez notifikace (rodič ji zapisuje sám).
- UI: tlačítko „Zapsat obrazovku" v detailu dítěte (`/admin/deti/[id]`), viz `docs/design/2026-09-26-rodicovska-cast-co-menime-co-ne.md`.

---

## D20 — Zpětné uznání zmeškaného dne

**Rozhodnutí:** rodič může v detailu dítěte zpětně uznat povinnost, která den uzavřela jako neúspěšný (`MISSED`, nebo `REJECTED`, která zůstala vrácená do půlnoci). Uznání převede instanci na `APPROVED` (`reviewerId` = rodič, `reviewedAt` = teď, `note` „Uznáno zpětně"). Den se pak počítá, jako by nikdy nebyl zmeškaný.

- **Jak daleko zpátky:** jen dny **běžícího týdne** (od pondělí do včerejška), dokud neproběhl `weekly-close`. Den z měsíce, který už uzavřel `monthly-close`, uznat nejde.
- **Řada a trofeje:** po uznání se `currentStreak` přepočítá z historie dnů (zpětně od posledního uzavřeného dne po první neúspěšný den), `longestStreak` se případně zvýší, `brokenStreaksCount` se sníží, pokud uznání spojilo přerušenou řadu. Trofeje, na které nová řada dosáhne, se udělí stejnou logikou jako v `daily-close` (cycle-aware dedup).
- **Měsíční bonus:** srážka se vrátí sama, protože `getBonusStatus` / `monthly-close` počítají neúspěšné dny z instancí.

**Důvod:** Milan (2026-09-26, scénář 7) „zní jako fajn nápad"; hranice podle Claudových návrhů, které Milan odsouhlasil. Architecture review 7. 7. označil ztrátu řady za největší UX riziko. Omezení na běžící týden drží stranou výplaty, které už jsou uzavřené.

**Co to neznamená:** není to pauza (nemoc, výlet), ta zůstává mimo rozsah (PRD §7). Nelze uznat den mimo běžící týden. Dítě o uznání nežádá v appce, řeší se to ústně.

**Důsledky:**
- Nová server action `excuseDayAction(userId, date)` jen pro admina, v jedné transakci: přepnutí instancí dne + přepočet řady; trofeje jako v `daily-close`.
- Přepočet řady jako čistá funkce v `lib/streak.ts` (testovatelná), sdílená s `daily-close`.
- Bez změny schématu.
- UI: „Uznat den" u neúspěšného dne v detailu dítěte.

---

## D21 — Uzávěrky dohánějí ukončená období, nezávisle na čase běhu

**Rozhodnutí:** cron uzávěrky neberou „teď“ jako období, které zavírají. Každá zavře všechna období, která **už skončila** a ještě nejsou uzavřená, a dnešek (běžící týden, běžící měsíc) nezavře nikdy. Díky tomu je jedno, kdy a kolikrát GitHub úlohu spustí.

- **Denní uzávěrka** (`closePastDays` v `lib/day-close.ts`): všechny `PENDING` instance se dnem **před dneškem** → `MISSED`. Potom pro každé dítě projde uzavřené dny po `User.lastStreakDate` (od nejstaršího), aplikuje výsledek dne na řadu a trofeje jako dřív a posune `lastStreakDate` (nově i při přerušení řady, ne jen při posunu). Zmeškané je tedy až po půlnoci, jak říká pravidlo.
- **Týdenní uzávěrka:** zavírá **předchozí** (už skončený) týden. Nejdřív spustí `closePastDays`, aby byla neděle uzavřená. Trofeje vyplatí s `weekStart` zavíraného týdne a součty počítá podle `CreditTransaction.weekStart`, ne podle `createdAt`.
- **Měsíční uzávěrka:** zavírá **předchozí** měsíc. Nejdřív spustí `closePastDays`. Bonus připíše do **běžícího** týdne (`weekStart` teď), aby ho zahrnula příští týdenní výplata bez ohledu na pořadí úloh. Idempotence přes `referenceId = "RRRR-MM"` (starší kontrola podle `createdAt` v měsíci odpadá, bonus se teď připisuje až v dalším měsíci).
- **Rotace a ranní generování:** `daily-rollover` si před vytvořením instancí zajistí přiřazení kompetencí na běžící týden (`assignCompetenciesForWeek`, idempotentní). `weekly-rotation` přiřadí běžící i příští týden.
- **Rozvrh v `cron.yml`:** denní, týdenní a měsíční uzávěrka se posouvají **za půlnoc** (00:15 Prague v létě i v zimě, oba UTC spouštěče nechané). Rotace zůstává a je pojistkou.

**Důvod:** v noci 26.–27. 9. 2026 (pilot) GitHub zpozdil správný `daily-close` o 2 h, takže za „dnešek“ vzal 27. 9. a 26. 9. se neuzavřel. Zimní spouštěč `59 22 * * *` navíc proběhl v létě ve 3:14 a nově vytvořené povinnosti 27. 9. rovnou označil jako zmeškané. Dítě pak vidělo „Na dnešek máš hotovo“ a úkoly zamčené. Kontrola „správného okna“ z D1 nebyla v `daily-close` ani `weekly-close` implementovaná a při zpoždění by stejně selhala. U `weekly-close` a `monthly-close` hrozilo totéž (neuzavřený týden bez výplat, přeskočený měsíční bonus).

**Důsledky:**
- Nový `lib/day-close.ts` (sdílený daily/weekly/monthly-close) + čisté pomocné funkce s testy.
- Bonus za měsíc se objeví ve výplatě týdne, kdy byl připsán (začátek dalšího měsíce), ne v týdnu posledního dne měsíce.
- Oprava dat pilotu 27. 9.: dnešní instance dítěte Test vráceny z `MISSED` na `PENDING`.
- Dnešek nikdy není `MISSED`, takže stav „dnešní povinnost zmeškaná“ v UI dítěte nenastane (Dnes / Vydělat se neměnily).

---

## D22 — Testovací schéma `homeworks_test` a simulace měsíce

**Rozhodnutí:** testy proti databázi a lokální vývoj běží ve **schématu `homeworks_test`** ve stávajícím Supabase projektu, ne v `public` (ostrá data). Prisma se na něj přepíná parametrem `?schema=homeworks_test` v `DATABASE_URL` i `DIRECT_URL`.

- `.env.test.local` — pro simulaci (`npm run test:sim`), `.env.development.local` — pro `next dev` (Next.js ho načte přednostně před `.env`). Oba soubory jsou v `.gitignore` (`.env*.local`).
- `.env` se nemění: Prisma CLI (`db:push`, `db:seed`) a produkce (Vercel) dál míří na `public`. Změna schématu v testovacím schématu = `prisma db push` s URL z `.env.test.local`.
- **Simulace měsíce** (`tests/simulation/`, vlastní `vitest.sim.config.ts`): posouvá čas přes `vi.setSystemTime`, volá server actions a cron handlery přímo (session a `revalidatePath` mockované) a po každém dni kontroluje invarianty (kredit nejde do mínusu, nic se nepřipíše dvakrát, výplata = vyděláno − screen time + bonus, řada, trofeje, bonus, dnešek nikdy MISSED). Scénáře podle `docs/design/2026-09-26-scenare.md`, zlomyslné situace z D21 (zpožděné a dvojité crony, přechod času, konec měsíce, dva rodiče naráz).

**Důvod:** Milan 2026-09-27: „potřebuji, aby to bylo super spolehlivé“. Chyby D21 a dvojího připsání peněz by simulace chytila před nasazením. Třetí Supabase projekt na free tarifu nejde (Milan má dva), nový účet ani lokální Postgres nechtěl. Lokální vývoj dosud míril na produkční data.

**Důsledky:**
- Bez nové závislosti (vitest už je v projektu).
- Simulace na začátku testovací schéma vyprázdní; nikdy se nesmí pouštět s URL bez `schema=homeworks_test` (harness to kontroluje a jinak skončí).
- Lokální přihlášení do appky používá testovací uživatele ze seedu (výchozí PIN ze `prisma/seed.ts`), ne ostré PINy.

---

## D23 — Uzavřený týden je rezervovaný pro výplatu

**Rozhodnutí:** na screen time se dá utratit jen **volný kredit** = zůstatek všech transakcí **minus nevyplacené týdenní výplaty** (`WeeklyPayout` s `paidOutAt = null`). Jakmile se týden uzavře, jeho peníze patří výplatě a na screen time už nejdou. Platí pro žádost dítěte, schválení rodičem (kontroluje se znovu v transakci) i pro zapsání rodičem (D19).

**Důvod:** simulace měsíce (D22) našla, že dítě mohlo v pondělí za peníze z uzavřeného týdne koupit screen time a rodič pak vyplatil celou částku z uzávěrky: kredit spadl do mínusu (Neli −100 Kč) a dítě dostalo peníze i screen time. Týden s útratou větší než výdělkem pak nechal v kreditu „dluh“, protože výplata se zastaví na 0. Milan zvolil variantu A (rezervace) před B (vyplatit jen zbytek), protože částka k výplatě se po uzávěrce nemění a sedí s tím, co dítě vidí.

**Důsledky:**
- Nová `getSpendableCredit(userId)` v `lib/credit.ts`; `getCurrentBalance` zůstává pro celkový zůstatek.
- Screen time u dítěte ukazuje „na kolik mám“ z volného kreditu; detail dítěte u rodiče taky.
- V pondělí ráno před výplatou má dítě na screen time jen to, co mu zbylo mimo uzavřený týden (typicky 0).
- Simulace kontroluje, že kredit nikdy nejde do mínusu ani po výplatě.

---

## D24 — Nepřítomnost dítěte (tábor, dovolená, nemoc)

**Rozhodnutí:** rodič zadá dítěti (nebo víc dětem naráz) nepřítomnost **od–do** (celé dny, Europe/Prague). Dopředu bez omezení, zpětně jen do začátku **běžícího týdne** a běžícího měsíce (jako D20). Dny nepřítomnosti se pro dítě chovají, jako by neměly povinnosti:

- **Povinnosti:** `daily-rollover` dítěti v den nepřítomnosti instance nevytvoří. Při zadání zpětně (nebo na dnešek) se jeho `PENDING`, `REJECTED` a `MISSED` instance v rozsahu smažou; `SUBMITTED` a `APPROVED` zůstávají (co udělalo, platí).
- **Řada a trofeje se zmrazí:** den bez instancí se v řadě nepočítá ani ji nepřeruší (platí už dnes). Při zadání do už uzavřených dnů se řada přepočítá z historie stejně jako u D20 (sdílená funkce).
- **Měsíční bonus:** dny pryč nejsou zaváhání (bonus počítá jen `MISSED`/`REJECTED`), takže zůstává plný.
- **Kompetence:** přiřazení se nemění, rotace běží dál. Kompetence dítěte, které je pryč, zůstane ten týden neobsloužená (Milan: nikdo ji nepřebírá). Pro ostatní děti se nic nemění.
- **Úkoly z nabídky:** nová instance do fronty nezařadí dítě, které je dnes pryč. Když je nabídka odemčená pro dítě, které je pryč, `claim-timeout` ji posune dalšímu hned. Když jsou pryč všechny děti, `recurring-tasks` nové instance nevytváří.
- **Zrušení / zkrácení:** smaže jen dnešní a budoucí dny nepřítomnosti. Minulé dny zůstávají bez povinností (nelze je dodatečně vytvořit).
- **Dítě** na Dnes vidí „Máš volno do …“ místo povinností.

**Důvod:** Milan 2026-09-27 (scénáře 8–10): tábor jednoho dítěte, celá rodina pryč, nemoc. PRD §7 měl pauzu mimo v1; D20 umí uznat jen jeden den. Bez toho by dítě na táboře přišlo o řadu a bonus.

**Důsledky:**
- Prisma: nový model `Absence { userId, fromDate, toDate, createdById, note?, createdAt }`, `db push` do `homeworks_test` i produkce (bez migrací, TD3).
- Server actions `createAbsenceAction(userIds, from, to, note?)`, `endAbsenceAction(id)`; úpravy `daily-rollover`, `claim-timeout`, `recurring-tasks`, `buildRotationQueue`.
- Simulace (D22) dostane tábor jednoho dítěte, týden celé rodiny pryč a nemoc zadanou zpětně.
- UI podle D16 (tok → smlouva → pen → kód).

---

## D25 — První spuštění dítěte: uvítání, vlastní PIN, týden na zkoušku, vstupní bonus

**Rozhodnutí:**
- **Uvítání** při prvním přihlášení dítěte: 3–4 obrazovky (tvoje kompetence a jak se odškrtne · vydělat navíc · screen time a výplata · řada a bonus), dají se přeskočit, ukážou se **jen jednou**. Příznak `User.onboardedAt` v DB (přežije přeinstalování PWA).
- **Vlastní PIN povinně:** dokud má dítě dočasný PIN (`User.pinIsTemporary`, nastavuje se při resetu PINu a při zakládání uživatele), po uvítání musí zadat nový. Bez toho se do appky nedostane.
- **První odškrtnutí naostro:** uvítání končí na Dnes u první povinnosti, žádná cvičná karta.
- **Týden na zkoušku:** 7 dní od dokončení uvítání (`User.trialEndsOn`, poslední den zkoušky). Neúspěšný den ve zkoušce **nepřeruší řadu** (počítá se jako den bez povinností) a **nesníží měsíční bonus**. Úspěšný den se do řady počítá normálně.
- **Vstupní bonus:** po dokončení uvítání se připíše `CreditTransaction` typu `WELCOME_BONUS` ve výši `AppSettings.welcomeBonusCzk` (výchozí **100 Kč**, nastavitelné). Počítá se do týdenní výplaty jako bonus (spolu s měsíčním bonusem a trofejemi) a jde utratit za screen time. Jen jednou na dítě (idempotentní přes `onboardedAt` v transakci).

**Důvod:** Milan 2026-09-27 (scénář 11): „chci zvýšit pravděpodobnost, že první použití bude skvělej zážitek, a díky tomu pak děti u toho vydrží.“ Vstupní bonus je Milanův nápad („máš něco do hry, můžeš se o to starat“). Týden na zkoušku brání tomu, aby dítě přišlo o řadu a bonus dřív, než pravidla pochopí.

**Důsledky:**
- Prisma: `User.onboardedAt DateTime?`, `User.pinIsTemporary Boolean @default(false)`, `User.trialEndsOn DateTime?`, `AppSettings.welcomeBonusCzk Int @default(100)`, enum `TransactionType` + `WELCOME_BONUS`.
- `closePastDays` a `withStreakResync`: neúspěšný den ve zkoušce = přeskočený den. `countMissedDays` (bonus) dny zkoušky vynechá.
- `weekly-close`, výpis Za co, simulace: `WELCOME_BONUS` jako bonus.
- Ostrý provoz: při nahrání dat z tabulky dostanou děti dočasný PIN s `pinIsTemporary = true` a `onboardedAt = null`.
- UI podle D16 (tok → smlouva → pen → kód).


---

## D26 — Produktová landing page jako veřejná routa `/pro-rodice`

**Rozhodnutí:**
- Landing page žije **v tomhle Next.js projektu** jako veřejná routa **`/pro-rodice`** (bez přihlášení, mimo `proxy.ts` matcher). `/` zůstává přihlášení rodiny.
- Předloha: pen, návrh 3b · týmovost (`UYupj`), desktop. Mobilní verze se odvodí responzivně v kódu a pen se dorovná (frame `HWL3b · 02 Telefon 390`).
- **Formulář „Chci být mezi prvními“ a otázka zájmu o kvízy** posílají e-mail Milanovi přes **Resend** (server action, bez změny databáze, bez nové závislosti). Příjemce `LANDING_LEADS_EMAIL`, když chybí, `ADMIN_NOTIFICATION_EMAILS`. Ochrana proti botům: skryté pole (honeypot).
- **Jen světlý režim:** stránka má barevné plochy a fotky navržené pro světlo; tmavé tokeny se na ní nepoužijí (marker `.theme-light-only` v `app/globals.css` přes `:has()`).
- Ukázky z appky (telefony, karty) jsou **obrázky exportované z penu** do `public/landing/` (kopie skutečných obrazovek), fotky jsou AI fotky z penu. Neživé komponenty: appka potřebuje session a data.

**Důvod:** Milan 2026-09-28: stránku chce posílat odkazem hned; nasazení s appkou na Vercel je nejrychlejší cesta, sdílí tokeny a písmo. Ukládání zájemců do DB zatím nepotřebuje („pošli to e-mailem mně“).

**Důsledky:**
- Nové soubory `app/pro-rodice/*`, `public/landing/*`, server actions v `app/pro-rodice/actions.ts`.
- ENV `LANDING_LEADS_EMAIL` (volitelná) do `LAUNCH_CHECKLIST.md`.
- Homeworks zůstává pro jednu rodinu (PRD mimo v1): stránka sbírá zájemce, neregistruje.
- Reklama/analytics dál ne (SKILL deny-list).
