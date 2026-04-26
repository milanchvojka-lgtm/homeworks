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
