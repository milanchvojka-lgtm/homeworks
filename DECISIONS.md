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

**Out of scope pro v1:** ~~PWA Web Push (zvážit v M6)~~ — push je od D28 v rozsahu v1. Telegram, per-event okamžité e-maily.

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
- **Doplněk 2026-09-29:** skript měl napevno seznam 17 tabulek, takže `Absence` (D24, přidaná přes `db push`) zůstala bez RLS a s granty pro `anon`. Skript teď bere **všechny tabulky v `public`** a navíc nastavuje `ALTER DEFAULT PRIVILEGES FOR ROLE postgres … REVOKE ALL … FROM anon, authenticated`, takže nové tabulky nejsou přes PostgREST dostupné ani před dalším spuštěním. Po každém `db push`, který přidá tabulku, skript pusť znovu (jinak Advisor hlásí `rls_disabled_in_public`).

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
- **Rotace a ranní generování:** `daily-rollover` si před vytvořením instancí zajistí přiřazení kompetencí na běžící týden (`assignCompetenciesForWeek`, idempotentní). `weekly-rotation` přiřadí běžící i příští týden. *(D32: rotace po dnech, přiřazení dělá `daily-rollover`, `weekly-rotation` odchází.)*
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
- **Kompetence:** přiřazení se nemění, rotace běží dál. Kompetence dítěte, které je pryč, zůstane ten den neobsloužená (Milan: nikdo ji nepřebírá; od D32 se rotuje po dnech). Pro ostatní děti se nic nemění.
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
- **Jen světlý režim:** stránka má barevné plochy a fotky navržené pro světlo; tmavé tokeny se na ní nepoužijí (obal `.theme-light-only` v `app/globals.css` znovu deklaruje světlé tokeny a aliasy; `:has()` na `:root` sestavení CSS zahazuje).
- Ukázky z appky (telefony, karty) jsou **obrázky exportované z penu** do `public/landing/` (kopie skutečných obrazovek), fotky jsou AI fotky z penu. Neživé komponenty: appka potřebuje session a data.

**Důvod:** Milan 2026-09-28: stránku chce posílat odkazem hned; nasazení s appkou na Vercel je nejrychlejší cesta, sdílí tokeny a písmo. Ukládání zájemců do DB zatím nepotřebuje („pošli to e-mailem mně“).

**Důsledky:**
- Nové soubory `app/pro-rodice/*`, `public/landing/*`, server actions v `app/pro-rodice/actions.ts`.
- ENV `LANDING_LEADS_EMAIL` (volitelná) do `LAUNCH_CHECKLIST.md`.
- Homeworks zůstává pro jednu rodinu (PRD mimo v1): stránka sbírá zájemce, neregistruje.
- Reklama/analytics dál ne (SKILL deny-list).

---

## D27 — Druhá landing page pro děti `/pro-deti`, bez sběru údajů od dětí

**Rozhodnutí:**
- Vedle `/pro-rodice` (D26) vznikne veřejná **`/pro-deti`** pro děti 10–15 let. Obě stránky na sebe odkazují.
- **Výzva „Pošli to našim“:** dítě sdílí odkaz na `/pro-rodice` (sdílení v telefonu, jinak zkopírování odkazu). Na stránce pro děti **žádný formulář a žádné údaje** od dítěte.
- **Tón:** cool a střídmý, jazykem generace, tykání; žádný rodičovský tón. Týmovost (brief pro rodiče §2) platí i tady.
- Fotky ano (bez tváří, energičtější), výběr nechává Milan na Claudovi. Ukázková čísla smí být ze skutečného pilotu (týden holek).
- Technicky stejně jako D26: jen světlý režim, ukázky jako exporty z penu, tokeny D15.

**Důvod:** Milan 2026-09-28: „aby si to přečetli a řekli si: wow, to chci okamžitě začít používat.“ Dítě, které appku chce, je pro rodiče nejsilnější argument. Od dětí nechceme sbírat údaje (stejně jako appka, brief §3 Soukromí).

**Důsledky:**
- Brief `docs/design/2026-09-28-landing-deti-brief.md`; pen sekce „HW · Landing page děti · návrh 1“.
- Kód `app/pro-deti/*`, `public/landing/deti/*`; do hlavičky `/pro-rodice` odkaz „Pro děti“.

---

## D28 — Push připomínky dětem, push rodičům, číslo na ikoně appky a večerní e-mail o neodeslaném (před launchem)

**Rozhodnutí (Milan 2026-09-29, analýza `docs/2026-09-29-analyza-pripominky.md`):**
- **Web Push** (VAPID) pro děti i rodiče, v rozsahu v1, **před ostrým launchem**. Nová závislost **`web-push`** schválena. Push funguje jen v appce přidané na plochu (iOS 16.4+). Povolení ťuká uživatel sám.
- **Připomínky dítěti jen tehdy, když mu ještě něco zbývá** (dnešní povinnost `PENDING` nebo `REJECTED`, dítě není nepřítomné, D24):
  - 60 min před termínem povinnosti (`DailyCheck.dueTime`, D18), pro každou neodeslanou povinnost s termínem,
  - 19:30 souhrn všeho, co zbývá,
  - 21:30 poslední šance,
  - vrácená povinnost (`REJECTED`) hned při vrácení.
  Každá připomínka nejvýš jednou (log odeslaných, odolné vůči zpožděnému a dvojímu běhu cronu, D21).
- **Push rodičům** při každé události, která dnes jde do e-mailového souhrnu (odeslaná povinnost, nahlášený úkol, žádost o screen time), hned při akci. Notifikace se slévají (stejný `tag`), aby rodiče nezahltily.
- **Číslo na ikoně appky:** dítě = počet dnešních neodeslaných povinností, rodič = počet položek ke schválení. Nastaví se v každé push notifikaci a při každém otevření appky.
- **Večerní e-mail rodičům ve 20:00 o neodeslaném:** které dítě má co z dneška ještě neodeslané. Jen když něco zbývá. Běží na dnešní Resend infrastruktuře.
- E-mailový souhrn podle D3 zůstává beze změny.

**Důvod:** Milan: „považuju to za klíčovou funkci, bez který ten launch může selhat = děti budou zapomínat, že mají odškrtávat.“ Neodeslaná povinnost o půlnoci propadne a stojí řadu i bonus. Badge v navigaci ani číslo na ikoně bez push to neřeší: iOS ho bez push obnoví jen při otevření appky a web appka si nemůže sama naplánovat připomínku. Posílat ji tedy musí server. Večerní e-mail je pojistka pro dítě, které notifikace odmítne nebo mu odběr odumře.

**Rizika a jak s nimi:**
- Holky mají zapnuté „Omezit weby pro dospělé“ a existuje hlášení, že s ním web appky se service workerem na iOS nefungují. **Jako první krok se service worker a testovací push nasadí a vyzkouší na telefonu holky.** Když nefunguje, rozhodne Milan dál (povolit doménu, vypnout omezení, nebo jen e-mail + připomínka v appce Připomínky). **Ověřeno 2026-09-29 na Milanově iPhonu: push funguje i se zapnutým omezením.**
- Odběry na iOS občas samy odumřou: odběr se obnoví při každém otevření appky, odběr s odpovědí 404/410 se smaže. Při odhlášení se odběr v prohlížeči neruší, jen se deaktivuje na serveru.
- Klidový režim v Čase u obrazovky notifikace zadrží. Časy připomínek se dolaďují ve zkušebním týdnu (D25).
- iOS nedovolí tichý push: každý push zobrazí notifikaci, proto se číslo na ikoně mění jen spolu s ní.

**Důsledky:**
- Prisma: `PushSubscription` (uživatel, endpoint, klíče, poslední úspěch, deaktivace) a `ReminderLog` (dítě, den, druh připomínky, klíč, unikátní), `db push` (TD3).
- `public/sw.js` (push, `notificationclick`, `setAppBadge`), hlavička `no-cache`. Registrace service workeru a obnova odběru při otevření appky.
- `lib/push.ts` (odeslání, úklid mrtvých odběrů) a `lib/reminders.ts` (co a komu připomenout). Čistá logika v `lib/reminders-pure.ts` s testy.
- Cron: připomínky jako nový krok v 15minutovém běhu v `.github/workflows/cron.yml`, e-mail o neodeslaném v běhu ve 20:00.
- UI podle D16: krok „Zapnout připomínky“ na konci uvítání (D25), přepínač v Já (dítě) a ve Víc (rodič), včetně stavu „zablokováno v Nastavení iOS“.
- ENV: `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` (do `LAUNCH_CHECKLIST.md`). Rotace klíčů zneplatní všechny odběry.
- Simulace měsíce (D22): připomínky se odesílají přes mock a kontroluje se, že dítěti s ničím nezbývajícím nepřijde nic a že nic nepřijde dvakrát.
- **D3 „Out of scope pro v1: PWA Web Push“ tímto padá.**

---

## D29 — Anglická verze rodičovské landing page `/en/for-parents`

**Rozhodnutí:**
- Anglická verze **jen rodičovské** stránky (D26) na **`/en/for-parents`**. Dětská stránka (D27) zatím jen česky (slang generace potřebuje vlastní kolo).
- Text se **nepřekládá doslova**, píše se pro anglicky mluvící publikum (přirozené idiomy, kratší věty, mezinárodní angličtina bez britsko-amerických specifik, kde to jde).
- **Ukázky z appky přeložené v penu** (kopie framu 3b → „návrh 3b EN“) a exportované do `public/landing/en/`. Appka sama anglicky neumí: stránka to přizná v FAQ („Is the app available in English?“).
- **Bez konkrétní měny v textu** („set your own rates“, „bought with what they've earned“). Čísla na ukázkách jsou skutečná z pilotu, **přepočtená na EUR kurzem 25 Kč = 1 € a zaokrouhlená na celá eura** (Milan 2026-10-02, původně CZK). Součty na ukázkách zůstávají konzistentní.
- Formuláře stejné jako D26 (Resend), hlášky anglicky, e-mail Milanovi označený `[EN]`.
- Přepínač jazyka: na `/pro-rodice` odkaz „EN“, na anglické stránce „Česky“. Obal stránky má `lang="en"`.

**Důvod:** Milan 2026-10-02: anglická verze „vhodná pro anglicky hovořící publikum“. Odpovědi na otázky: jen rodičovská, přeložit ukázky v penu, bez konkrétní měny.

**Důsledky:** `app/en/for-parents/page.tsx`, `app/pro-rodice/_forms.tsx` a `app/actions/landing.ts` dostanou jazyk; pen sekce „HW · Landing page · návrh 3b EN“.

---

## D30 — Screen time se žádá a schvaluje v iOS, rodič ho v appce jen rychle zapíše (mění D19)

**Rozhodnutí:**
- **Žádost a schválení žijí v iOS Čase u obrazovky** („Požádat o další čas“ → rodič schválí v iOS). Appka iOS žádosti nevidí a vytvořit je neumí (Apple pro ně nedává rozhraní, nativní appka s Family Controls je mimo stack), takže je **jen evidence**.
- **Dítě v appce o obrazovku nežádá.** Záložka Screen time u dítěte je **jen přehled**: kolik času si tento týden vzala a kolik to stálo, seznam zápisů. Tlačítko „Požádat“ a výběr 30/60/90 odchází.
- **Rodič zapíše čas rychle, ne v detailu dítěte:** **vlastní 5. záložka „Screen time“** v rodičovské liště (Schválit · Děti · Screen time · Výplaty · Víc; Milan 2026-10-03 vybral variantu B, pen HWS · 01B). Na záložce rovnou zápis: **15 min / 1 h**, **dlaždice Ani · Neli · Emi** (jméno + kredit), **Uložit**; nic není předvybrané. Pod tím zápisy všech dětí tento týden.
- **Omyl jde vrátit:** u dnešního zápisu je **„Zrušit“** — smaže zápis i odečet a dítěti přijde push „Zápis 15 min zrušen, +50 Kč zpět“. Starší zápisy se opravují úpravou kreditu.
- **Granularita jen 15 min a 60 min**, stejně jako iOS. iOS volbu „do konce dne“ appka nepodporuje. Cena dál `(minutes / 60) × screenTimeHourCostCzk` (200 Kč/h → 15 min = 50 Kč).
- **Zápis nikdy neselže na kreditu.** Čas už dítě v iOS dostalo, takže kredit **smí jít do mínusu** (mění D19, kde zápis bez kreditu nešel). Mínus se odečte z nejbližší nedělní výplaty; když výplata nestačí, **dluh se přenáší do dalšího týdne**, dokud se nesplatí. Výplata nikdy není záporná.
- **Dítěti hned přijde push**, např. „Táta ti zapsal 15 min, −50 Kč“. Tím ví, že čas stojí peníze, i když žádalo mimo appku.

**Důvod:** Milan 2026-10-03: holky žádají přes iOS, rodiči přijde SMS/push a skoro vždycky schválí. Žádat podruhé v appce je „trošku demence“ a 30/60/90 neodpovídá iOS (15 min / 1 h / do konce dne). Varianta „zapíše dítě samo“ zamítnuta: dvojí práce pro děti. Odpovědi na otázky 2026-10-03: mínus ano (z nedělní výplaty), vstup tlačítkem nebo záložkou v appce (ne zkratka přes Safari), 15/60 bez „do konce dne“, u dítěte jen přehled.

**Důsledky:**
- `recordScreenTimeAction` bez kontroly kreditu, minuty jen 15 nebo 60; nová rodičovská obrazovka zápisu. Zápis v detailu dítěte (D19) se nahradí.
- **Týdenní uzávěrka:** výplata = co dítě má k dobru včetně dluhu z minulých týdnů, ne jen součet daného týdne; `computeWeeklyPayout` přestane dluh tiše mazat. Výpis a Výplaty ukážou řádek „Dluh z minulého týdne“. Doplnit do simulace měsíce (D22) postavu s dluhem přes dva týdny. Sahá na peníze → před nasazením `npm run test:sim`.
- Dětská žádost (`requestScreenTimeAction`, výběr 30/60/90, schvalování žádostí v Schválit, push rodiči o žádosti) odchází. Rozpracované `PENDING` žádosti se při nasazení zamítnou bez odpočtu.
- Nastavení: granularita obrazovky (`screenTimeMinGranularity`) přestává být nastavitelná (pevně 15/60).
- Nový push dítěti při zápisu (`lib/push.ts`, text v `lib/reminders-pure.ts` nebo vlastní modul).
- UI podle D16: tok ve dvou variantách (tlačítko vs. záložka) → smlouva → pen → kód.
- PRD §4.7, §5 Nastavení a §7 („Auto-approve obrazovky“) se mění podle tohoto záznamu.

---

## D31 — Rodič může udělat povinnost nebo úkol za dítě

**Rozhodnutí:**
- Rodič (Milan, Teri) může ve svém profilu označit jako hotové, co udělal sám („myčku jsem dal já, holky nebyly doma“), bez přihlašování za dítě.
- **Povinnost dítěte (dnešní check):** rovnou `APPROVED` s poznámkou „Udělal(a) {rodič}“. **Dítěti se počítá jako splněná** (řada ani bonus neutrpí); dítě ji na Dnes vidí jako hotovou.
- **Extra úkol:** **nikdo za něj nedostane peníze**, z nabídky zmizí. Týká se úkolu v nabídce, který si **ještě nikdo nevzal**, i úkolu, který má dítě rozdělaný.
- **Kde:** povinnosti v detailu dítěte (Děti → dítě → dnešní povinnosti → „Udělám já“), extra úkoly v seznamu úkolů. Přesné umístění a vzhled podle D16 (tok → smlouva → pen), Milan souhlasí s oběma místy a chce pokrýt i dosud nevzaté úkoly z nabídky.

**Důvod:** Milan 2026-10-03: „Někdy myčku dělám já nebo Tereza… no hard feelings.“ Odpovědi: povinnost se dítěti počítá jako splněná, úkol bez odměny, obě místa + nevzaté úkoly z nabídky.

**Otevřené:** úkol, který má dítě rozdělaný (`CLAIMED`) — dostane dítě push „Úkol udělal táta“? Vyřeší tok.

**Důsledky:** nové server actions pro admina (check → APPROVED s poznámkou; úkol → DONE bez `TASK_REWARD`, u opakovaných úkolů pokračuje rotace jako po dokončení). Simulace (D22): den, kdy povinnost udělá rodič, nesmí přerušit řadu. Implementace až po M10 (D30).

---

## D32 — Kompetence se točí po dnech; tři role včetně kuchyně do 17:00 (mění PRD §4.1, §4.2)

**Rozhodnutí:**
- **Rotace kompetencí po dnech, ne po týdnech.** Každá holka má každý den **právě jednu** kompetenci. 3 kompetence × 3 holky, takže stejnou roli má každá jednou za tři dny. Pořadí určuje `rotationOrder` jako dnes.
- **Kompetence a jejich checky** (katalog `docs/2026-10-04-katalog-ukolu.md`, rodinná porada 2026-10-04):
  - **Obývák:** uklidit kanape · vyvětrat (1× denně, kdykoli) · udržovat čisté povrchy (piano, TV skříňka, komody).
  - **Prádlo a koupelna:** rozdělit a roznést prádlo · udržovat čisté obě koupelny, dole i nahoře (drobnosti do koše, popadané ručníky; ~10 min celkem).
  - **Kuchyň a stůl** — jedno odpolední kolo, **termín 17:00** (D18), aby se dalo vařit a jíst: vyndat a uklidit umyté nádobí (myčka prázdná) · utřít linku · vysypat koše · odnést skleničky a sklo na půdičku, tašky a suché potraviny · uklidit a utřít stůl.
  - Obývák a Prádlo a koupelna mají termín **do konce dne**.
- **Ostatní kola kuchyně dělají rodiče mimo appku:** ráno Milan vyndá myčku, přes den ji naplní a zapne, po večeři Teri naplní myčku a uklidí kuchyň na ráno. V appce se rodičovská kola nezobrazují a rodiče nic neodškrtávají. Když rodič udělá odpolední kolo místo holky, platí D31.
- **Povinnost visí celý den**, ne až od poledne. Holka ji udělá, až myčka doběhne. Případná push připomínka před 17:00 se řeší v toku (D28).
- **Týdenní mechanika se nemění:** týdenní uzávěrka, výplata (D23), kredit, řada a měsíční bonus. Ty se počítají po dnech už dnes. Mění se jen přiřazení kompetence.
- **Extra úkoly z katalogu (1× týdně):** vysát (20 min, 50 Kč) · utřít prach v obýváku (20 min, 50 Kč) · umýt koupelnu dole i nahoře (30 min, 80 Kč). Zakládá je rodič jako opakované úkoly (M3).
- **Názvy povinností i úkolů popisují cílový stav**, ne činnost („Na kanapi se dá sednout“, ne „Uklidit kanape“). Seznam je v katalogu.
- **Odměna extra úkolu = náročnost × 150 Kč/h**, zaokrouhleno na 10 Kč (Milan 2026-10-04). Je to vodítko pro rodiče při zakládání úkolu, appka ho nevynucuje.

**Důvod:** Rodinná porada 2026-10-04. Milan: „rotace … nebude po týdnech, ale po dnech“ a „kuchyň … potřebujeme, abychom se do toho mohli zapojit i já se svojí ženou“. Kuchyň se dělá 2–3× denně, takže kolečko po kolech mezi pěti lidmi by holkám dávalo nerovnou denní zátěž (obývák plus kolo kuchyně). Tři holky a tři role vychází přesně. Odpolední kolo (~25 min) je srovnatelné s ostatními rolemi (~20–23 min) a rodiče berou ostatní kola. Milan 2026-10-04: „jednička, holka dělá jen kolo do 17:00“.

**Zamítnuto:** kuchyň po kolech mezi všemi pěti (nerovná denní zátěž) · plánovač vyrovnávající minuty za týden (složitý, dětem nesrozumitelný) · kolo kuchyně jako placený extra úkol (kuchyň je nutnost, nesmí čekat, až si ji někdo vezme) · rodiče odškrtávají svá kola (nepřidá hodnotu; lze doplnit později, kdyby holky chtěly vidět i rodičovská kola).

- **Nepřítomnost (D24):** role dítěte, které je pryč, zůstane ten den neobsloužená. U kuchyně odpolední kolo udělají rodiče (Milan 2026-10-04: ano).

**Důsledky:**
- `CompetencyAssignment` se váže na den místo `weekStart`. `rotateAssignments` dostane index dne (epoch zůstává). `daily-rollover` přiřadí běžící den (idempotentně) a `weekly-rotation` odchází (D21 věta o rotaci se tím mění). Přechod nesmí rozbít historii minulých týdnů.
- UI podle D16: dítě na Dnes „Dnes máš Kuchyň a stůl“ + náhled „Zítra: Obývák“. Rodič vidí rozpis po dnech. Uvítání (D25) mluví o roli na den, ne na týden.
- D24: „zůstane ten týden neobsloužená“ → „zůstane ten den neobsloužená“.
- Obsah: kompetence a checky podle katalogu se zadají v administraci (nebo jednorázovým skriptem), staré oddíly Obývák / Stůl / Kuchyň se nahradí.
- Simulace (D22): denní rotace, ověřit řadu a bonus přes přechod z týdenní rotace.
