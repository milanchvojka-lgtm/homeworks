# SKILL.md — Homeworks

> Operating manual pro Claude Code. Přečti tento dokument jako první v každé session.

---

## Co je tento projekt

Webová aplikace pro řízení domácích povinností a odměn v jedné konkrétní rodině. **Není to SaaS.** Není to produkt pro veřejnost. Je to interní nástroj pro 5 lidí (2 rodiče + 3 dcery).

**Důsledek:** preferuj jednoduchost před flexibilitou. Když máš na výběr mezi „obecné a konfigurovatelné" a „natvrdo a jednoduché", jdi do toho druhého. Generalizace přijde, až (a jestli) bude potřeba.

---

## Klíčové dokumenty

V repu jsou tři dokumenty, čti je v tomto pořadí:

1. **`SKILL.md`** (tento soubor) — *jak* pracovat
2. **`PRD.md`** — *co* a *proč* — produktové rozhodnutí, feature spec, datový model, edge cases
3. **`IMPLEMENTATION_PLAN.md`** — *jak* a *v jakém pořadí* — milestony, úkoly, acceptance criteria

**Když je v PRD a v plánu rozpor:** PRD má prioritu pro produkční rozhodnutí, plán má prioritu pro technická rozhodnutí. Když si nejsi jistý, **zeptej se uživatele** dřív, než začneš kódit nesprávnou věc.

---

## Tech stack (závazný)

- **Next.js 15** (App Router) + **TypeScript** (strict mode)
- **Tailwind CSS** pro styling
- **Prisma** + **Postgres** (Neon nebo Supabase free tier)
- **Vercel** pro hosting + cron
- **Vlastní auth** (profile + PIN, bcrypt nebo argon2, httpOnly cookie session)
- **`date-fns`** pro datetime, vše v `Europe/Prague` timezone
- **PWA** (manifest + případně service worker)

**Co nepoužívat bez explicitního schválení:**
- ❌ Žádný auth provider (NextAuth, Clerk, Supabase Auth, ...) — máme vlastní jednoduchý PIN login
- ❌ Žádný state management library (Redux, Zustand, ...) — server actions + React state stačí
- ❌ Žádný design system framework (MUI, Chakra, Mantine) — jen Tailwind, případně shadcn/ui sporadicky pro komplexní komponenty
- ❌ Žádný analytics / tracking
- ❌ Žádný error tracking service (Sentry, ...) — pro v1 stačí Vercel logs
- ❌ Žádný real-time / WebSocket — vystačíme s page refresh + server actions

---

## Workflow

### Milestone-based přístup
Postupuj **milestone po milestonu** podle `IMPLEMENTATION_PLAN.md`. Nepřeskakuj. Nedělej M3, dokud není M2 hotový a otestovaný.

**Před začátkem milestone:**
1. Přečti si daný milestone v plánu.
2. Vytvoř TODO list úkolů.
3. Pokud je něco nejasné, zeptej se uživatele dřív, než začneš.

**Během milestone:**
1. Implementuj úkoly v pořadí podle plánu.
2. Po každém větším úkolu commit s jasnou zprávou (`feat(m2): add daily check submission flow`).
3. Pokud objevíš, že úkol vyžaduje rozhodnutí, které není v PRD/plánu → zeptej se, nehádej.

**Na konci milestone:**
1. Projdi acceptance criteria a ověř, že každé je splněno.
2. Otestuj happy path lokálně.
3. Deploy na Vercel a otestuj na produkční URL.
4. Napiš krátké shrnutí uživateli: co je hotové, co je k otestování, co případně vyžaduje rozhodnutí.

### Branch strategie
- Pracuj v `main` (jednoduchý projekt, 1 vývojář, žádné PR review).
- Každý milestone může být v samostatné větvi (`milestone-2-competencies`), ale není to nutné.

---

## Konvence kódu

### Struktura projektu
```
/app
  /(auth)           — login screen
  /admin            — admin layout + pages
  /child            — child layout + pages
  /api/cron/*       — cron endpoints
/components         — sdílené komponenty
/lib                — business logika, helpers (auth.ts, week.ts, rotation.ts, ...)
/prisma             — schema.prisma + seed.ts + migrations
/public             — static assets, manifest.json, ikony
```

### Pojmenování
- **Soubory komponent:** PascalCase (`TaskCard.tsx`)
- **Helpers a utilities:** camelCase (`getCurrentWeekStart.ts` nebo `week.ts`)
- **Server actions:** sloveso + entita (`approveCheck`, `claimTask`, `submitTask`)
- **DB modely:** PascalCase v Prisma (`User`, `TaskInstance`)
- **DB pole:** camelCase (`weekStart`, `claimedAt`)
- **Enums:** UPPER_SNAKE_CASE (`PENDING`, `TASK_REWARD`)

### TypeScript
- **Strict mode ON.** Žádné `any` bez velmi dobrého důvodu (a komentáře proč).
- Typy entit z Prisma (`import type { User } from '@prisma/client'`).
- Pro server actions vrací `{ success: true; data: ... } | { success: false; error: string }`.

### Server actions vs API routes
- **Server actions** pro všechny mutace z UI (form submits, button clicks).
- **API routes** jen pro cron endpoints (`/api/cron/*`).
- Žádné REST API pro vlastní frontend — používej server actions.

### Validace
- Validuj inputy na **server side** (server actions). Nikdy nedůvěřuj client-side validaci jako bezpečnostnímu mechanismu.
- Pro složitější validace použij `zod`.

---

## Datum a čas — důležité

**Vše v `Europe/Prague`.** Timezone bug = celá aplikace nefunguje (rotace v sobotu místo neděle, denní reset ve špatný čas).

- Při ukládání do DB: vždy v UTC (Postgres default).
- Při zobrazování: konvertuj na `Europe/Prague`.
- `getCurrentWeekStart()`: pondělí 00:00:00 v `Europe/Prague`, vrácené jako UTC Date.
- `getCurrentDayStart()`: 00:00:00 v `Europe/Prague`.

**Test:** napiš krátké unit testy pro week/day helpery se zaměřením na hraniční případy (přechod ze soboty na neděli, přechod letní/zimní čas).

---

## Bezpečnost a autorizace

### Každá server action / API route musí:
1. Načíst session (`getSession()`)
2. Ověřit, že uživatel je přihlášený
3. Ověřit, že má **roli a oprávnění** pro danou akci

### Konkrétní pravidla:
- Pouze `ADMIN` může: vytvářet/editovat úkoly, schvalovat/vracet, vyplácet, měnit settings, spravovat uživatele.
- `CHILD` může jen akce týkající se sebe sama (nemůže schválit vlastní úkol, nemůže claimnout úkol za jinou holku, nemůže vidět cizí kredit).
- **Cron endpoints** chraň přes Vercel Cron secret (`CRON_SECRET` env var, kontrola v handleru).

### PIN
- 4 číslice, bcrypt nebo argon2 hash.
- 5 chybných pokusů per profil → 5min lockout (in-memory mapa stačí, na Vercelu se to resetuje při cold start, což je OK pro v1).

---

## Co když narazíš na nejednoznačnost

Existují tři typy nejednoznačnosti:

### 1. Implementační detail (např. „použít modal nebo separátní stránku?")
**Rozhodni sám.** Vyber jednodušší variantu, krátce vysvětli volbu v commit message nebo summary.

### 2. UX rozhodnutí, které ovlivní chování (např. „má vrácený check zablokovat celý den, nebo jen ten check?")
**Zkontroluj PRD `Open Questions`.** Pokud tam je → použij doporučenou variantu z PRD. Pokud není → **zeptej se uživatele**.

### 3. Produktové rozhodnutí mimo scope (např. „mohli bychom přidat i komentáře k úkolům?")
**Nedělej.** Drž se PRD. Když opravdu si myslíš, že je to lepší, **zmiň to v summary po milestonu** jako návrh pro v2.

---

## Testování

### Pro v1 nepotřebujeme:
- ❌ Plné test coverage
- ❌ E2E testy (Playwright apod.)
- ❌ CI pipeline s testy

### Co bys ale měl mít:
- ✅ **Unit testy pro datum/čas helpery** (`lib/week.ts`, `lib/rotation.ts`) — kritická logika, drahé chyby
- ✅ **Unit testy pro výpočty** (kredit, bonus, rotační algoritmus)
- ✅ **Manuální happy path test** po každém milestonu

### Test framework
Vitest. Jednoduchý setup, rychlý.

---

## Git commit messages

Použij konvenci `<type>(scope): <message>`:
- `feat(m2): add daily check submission`
- `fix(m3): claim timeout calculation off by one hour`
- `chore: update prisma schema`
- `refactor(auth): simplify session lookup`
- `docs: update README with deploy instructions`

---

## Čeho se cíleně vyvarovat

### Premature optimization
Aplikace má 5 uživatelů. **Žádné caching layers, žádné indexy navíc, žádné lazy loading "kvůli rychlosti".** Naivní řešení je v 99 % případů dost dobré.

### Over-engineering datového modelu
Když nevíš, jestli něco bude potřeba — **nedělej to**. Schéma se dá rozšířit migrací. Předčasné generalizace (multi-tenant tabulky, polymorphic associations) jsou drahé.

### "Vylepšování" mimo scope
PRD a plán definují v1. Pokud máš nápad navíc, **napiš ho do summary jako návrh pro v2**, neimplementuj.

### UI bling
Žádné výrazné animace, žádné gradient buttons, žádné dark/light theme switcher. Funkční, čisté UI. Vizuální polish ladí Milan.

---

## Mateřský jazyk aplikace

**UI je v češtině.** Všechny user-facing texty (labely, tlačítka, hlášky, error messages) v češtině.

**Kód je v angličtině.** Názvy proměnných, komentáře, commit messages, dokumentace.

**Příklad:**
```typescript
// Approve a daily check and trigger downstream effects
async function approveCheck(checkId: string) {
  // ...
}

// V UI:
<button>Schválit</button>
```

---

## Jak komunikovat s uživatelem (Milanem)

- **Stručně.** Milan je zaneprázdněný UX designer, ne vývojář. Nezahlcuj kódem v chatu, pokud o něj výslovně neřekne.
- **Po dokončení milestonu** napiš krátké shrnutí: co je hotové, jak to otestovat, co je k rozhodnutí.
- **Při otázce** dej max 3 možnosti s krátkou rekomendací, ne 7 alternativ.
- **Když narazíš na blokr** (chybějící informace, technická překážka), řekni to hned, nesnaž se to obejít.
- **Češtinu používej v komunikaci**, kód v angličtině.

---

## První kroky pro Claude Code

Když začínáš novou session, projdi tento checklist:

1. ✅ Přečti `SKILL.md` (tento soubor)
2. ✅ Přečti relevantní část `PRD.md` (Overview + sekce, na které pracuješ)
3. ✅ Přečti relevantní milestone v `IMPLEMENTATION_PLAN.md`
4. ✅ Zjisti aktuální stav repa (`git log`, `git status`, struktura souborů)
5. ✅ Pokud něco není jasné → zeptej se, nehádej
6. ✅ Začni kódit

---

*SKILL.md verze 1.0*