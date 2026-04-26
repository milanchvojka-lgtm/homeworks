# Homeworks — Implementation Plan

> Doprovodný dokument k [`PRD.md`](./PRD.md). Slouží jako přírůstkový plán pro Claude Code. Každý milestone produkuje **funkční, deployovatelný stav**, který lze otestovat dřív, než se pustíme do dalšího.

> ⚠️ **Tento plán byl po sepsání upraven o rozhodnutí D1–D4 v [`DECISIONS.md`](./DECISIONS.md).** Hlavní změny: cron přes GitHub Actions (ne Vercel Cron), eager generování `DailyCheckInstance` (ne lazy), e-mail digest pro adminy přes Resend, Supabase jako DB.

---

## Obecné principy

1. **Vertical slices, ne horizontal layers.** Každý milestone přináší funkční end-to-end kus, ne jen „založíme schémata". Po každém milestone máš co vyzkoušet.
2. **Deploy early, deploy often.** Vercel deploy se zapíná hned v Milestone 0. Každý merge do `main` rovnou na produkci. Žádné dlouhé development větve.
3. **Seed data.** Po každém milestone je v DB několik testovacích záznamů (rodina, úkoly, …), aby se dalo hned klikat a testovat. Seed script průběžně rozšiřujeme.
4. **Test data ≠ produkční data.** Před skutečným spuštěním (po Milestone 6) DB resetneme a zavedeme reálné profily holek.
5. **Žádné zbytečné abstrakce.** Pište kód pro tuhle konkrétní rodinu. Generalizace přijde, až bude potřeba (pokud vůbec).
6. **Mobile first.** Každá obrazovka se musí dát ovládat na iPhone v jedné ruce. Desktop je vedlejší.

---

## Stack — finální shrnutí

- **Framework:** Next.js 16 (App Router) + TypeScript
- **Styling:** Tailwind CSS 4
- **DB:** Postgres přes **Supabase** (free tier) — D4
- **ORM:** Prisma 6
- **Auth:** vlastní implementace (profile + PIN), session přes httpOnly cookie
- **Hosting:** Vercel (free tier)
- **Cron:** **GitHub Actions** workflow → volá `/api/cron/*` na Vercelu s `CRON_SECRET` headerem — D1
- **E-mail:** Resend (free tier) pro admin digest — D3
- **PWA:** manuální manifest + service worker
- **Datetime:** `date-fns` + `date-fns-tz`, všechno v `Europe/Prague` timezone
- **Forms / UI:** vlastní jednoduché komponenty, žádný design system framework. (Případně shadcn/ui, ale jen sporadicky.)

---

## Milestone 0 — Bootstrap

**Cíl:** Funkční prázdný projekt na Vercelu, napojená DB, deployment pipeline.

### Úkoly
1. Vytvořit Next.js 16 projekt s TypeScriptem a Tailwindem 4.
2. Nastavit Prisma + **Supabase** (D4), pushnout prázdné schéma. Použít split `DATABASE_URL` (pooler 6543) + `DIRECT_URL` (5432) pro Prisma migrace.
3. Vytvořit GitHub repo, propojit s Vercelem.
4. Konfigurace ENV proměnných na Vercelu: `DATABASE_URL`, `DIRECT_URL`, `TZ=Europe/Prague`, `CRON_SECRET`, `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAILS`.
5. Vytvořit jednoduchou home page s textem „Homeworks — v1".
6. Nastavit `Europe/Prague` jako default timezone v aplikaci (přes `TZ` env var na Vercelu i lokálně).
7. Nastavit ESLint + Prettier (volitelné, ale doporučené).
8. README.md s instrukcemi pro lokální vývoj.
9. Připravit `.github/workflows/cron.yml` skeleton (zatím bez jobů, přidávají se v M2+ podle D1).

### Acceptance criteria
- ✅ Live URL na Vercelu funguje (např. `homeworks.vercel.app`).
- ✅ Push do `main` automaticky deployuje.
- ✅ Lokálně `npm run dev` startuje aplikaci.
- ✅ Prisma se umí připojit k DB (`npx prisma db push` projde).

### Out of scope
- Žádná auth, žádná logika, žádné UI.

---

## Milestone 1 — Profily, PIN auth, layout

**Cíl:** Login screen funguje, po přihlášení vidím prázdné rozhraní podle své role.

### Úkoly

#### 1.1 Datový model — User
```prisma
model User {
  id              String   @id @default(cuid())
  name            String
  role            Role     // ADMIN | CHILD
  pinHash         String
  avatarColor     String   @default("#888")
  rotationOrder   Int?     // jen pro CHILD
  monthlyAllowanceCzk Int  @default(0)  // jen pro CHILD
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  sessions        Session[]
}

enum Role {
  ADMIN
  CHILD
}

model Session {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())
}
```

#### 1.2 Auth logika
- `lib/auth.ts`:
  - `hashPin(pin: string): Promise<string>` (bcrypt nebo argon2)
  - `verifyPin(pin: string, hash: string): Promise<boolean>`
  - `createSession(userId: string): Promise<string>` (vrací token, nastavuje cookie httpOnly, 30 dní)
  - `getSession(): Promise<User | null>` (čte cookie, lookup v DB)
  - `destroySession(): Promise<void>`
- Server actions:
  - `loginAction(userId, pin)` — ověří PIN, vytvoří session, redirect na `/admin` nebo `/child`.
  - `logoutAction()` — destroy session, redirect na `/`.
- Rate limiting: 5 chybných pokusů per profil → 5min lockout (in-memory mapa nebo přes DB).

#### 1.3 Login UI
- `/` (login screen):
  - Velké dlaždice s profily (jméno + iniciála + barva).
  - Po klepnutí → modal nebo nový view s 4místnou číselnou klávesnicí.
  - PIN se zadává, po 4. číslici se odešle.
  - Špatný PIN → vibrace (CSS animace) + chybová hláška.

#### 1.4 Layouty
- `app/admin/layout.tsx` — admin layout (sidebar nebo tab bar dole, sekce: Inbox / Kompetence / Úkoly / Výplaty / Obrazovka / Uživatelé / Nastavení).
- `app/child/layout.tsx` — child layout (tab bar dole, sekce: Dnes / Pool / Mé úkoly / Kredit / Historie).
- Middleware (`middleware.ts`): pokud uživatel není přihlášený, redirect na `/`. Pokud je `CHILD` a leze do `/admin`, redirect na `/child`.

#### 1.5 Tlačítko Odhlásit
- Viditelné v obou layoutech (např. v hlavičce).

#### 1.6 Seed script
- 5 uživatelů: 2 admini (otec, matka), 3 děti (Anička, Emma, třetí jméno).
- Defaultní PINy (např. `1234`) — dočasně, mění se po prvním loginu (pro v1 OK i bez force change).
- `prisma/seed.ts`, spouštět přes `npx prisma db seed`.

### Acceptance criteria
- ✅ Login screen ukazuje 5 dlaždic.
- ✅ Klepnutí na dlaždici → PIN keypad.
- ✅ Správný PIN → redirect podle role.
- ✅ Špatný PIN → chybová hláška, po 5× lockout 5 min.
- ✅ Session přežije refresh i zavření prohlížeče.
- ✅ Tlačítko Odhlásit funguje.
- ✅ Dítě nedostane do `/admin` (middleware blokuje).

### Out of scope
- Reset PINu adminem (přesunuto do M2 nebo později).
- Forgot PIN flow.

---

## Milestone 2 — Kompetence, denní checky, rotace

**Cíl:** Holka vidí svou týdenní kompetenci a denní checky. Plní je, admin schvaluje. Rotace funguje.

### Úkoly

#### 2.1 Datový model
```prisma
model Competency {
  id          String   @id @default(cuid())
  name        String   // "Kuchyň" | "Obývák" | "Koupelna"
  description String?
  order       Int      // pořadí v UI

  dailyChecks DailyCheck[]
  assignments CompetencyAssignment[]
}

model DailyCheck {
  id           String   @id @default(cuid())
  competencyId String
  competency   Competency @relation(fields: [competencyId], references: [id])
  name         String
  timeOfDay    TimeOfDay  // MORNING | EVENING | ANYTIME
  order        Int

  instances    DailyCheckInstance[]
}

enum TimeOfDay {
  MORNING
  EVENING
  ANYTIME
}

model CompetencyAssignment {
  id           String   @id @default(cuid())
  competencyId String
  competency   Competency @relation(fields: [competencyId], references: [id])
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  weekStart    DateTime // pondělí 00:00
  weekEnd      DateTime // neděle 23:59
}

model DailyCheckInstance {
  id           String   @id @default(cuid())
  dailyCheckId String
  dailyCheck   DailyCheck @relation(fields: [dailyCheckId], references: [id])
  userId       String
  date         DateTime  // datum (00:00 daného dne)
  status       CheckStatus  // PENDING | SUBMITTED | APPROVED | REJECTED | MISSED
  submittedAt  DateTime?
  reviewedAt   DateTime?
  reviewerId   String?
  note         String?
}

enum CheckStatus {
  PENDING
  SUBMITTED
  APPROVED
  REJECTED
  MISSED
}
```

#### 2.2 Admin: správa kompetencí a checků
- `/admin/competencies` — seznam 3 kompetencí.
- Detail kompetence: editor checků (name, time of day, drag-and-drop pro pořadí).
- CRUD operace přes server actions.

#### 2.3 Rotace
- Service `lib/rotation.ts`:
  - `getCurrentAssignment(date: Date, userId: string): Competency | null`
  - `assignCompetenciesForWeek(weekStart: Date)` — vytvoří 3 `CompetencyAssignment` podle pořadí.
- Logika rotace: 3 holky × 3 kompetence, posun každý týden.
  - Týden 1: A=kuchyň, B=obývák, C=koupelna
  - Týden 2: A=koupelna, B=kuchyň, C=obývák
  - Týden 3: A=obývák, B=koupelna, C=kuchyň
  - Týden 4: zpět na začátek
- `getCurrentAssignment` se počítá lazy — buď podle uložených assignments, nebo on-the-fly z `weekIndex % 3`. Doporučení: ukládat do DB pro jednoduchý lookup a auditovatelnost.

#### 2.4 Cron job — týdenní rotace
- `/app/api/cron/weekly-rotation/route.ts`
- Volá ho **GitHub Actions** workflow (D1), ne Vercel Cron. Cron expression v UTC, handler kontroluje že je teď neděle 23:55 Prague.
- Vytvoří `CompetencyAssignment` pro nadcházející týden.
- Generování `DailyCheckInstance` se NEDĚLÁ tady — řeší ho separátní daily cron (viz 2.5, eager).

#### 2.5 Generování `DailyCheckInstance` — eager (D2)
- **Přístup:** eager, ranní cron. (Lazy přístup byl zavrhnut — viz `DECISIONS.md` D2: díra v missed/bonus logice.)
- `/app/api/cron/daily-rollover/route.ts`
- Volá GitHub Actions (D1), cíleně na 00:05 Prague.
- Algoritmus:
  1. Pro každé aktivní dítě najdi jeho `CompetencyAssignment` pro tento týden.
  2. Pro každou `DailyCheck` šablonu té kompetence vytvoř `DailyCheckInstance(userId, date=today, status=PENDING)`.
  3. Idempotentní: pokud instance už existuje (např. cron běžel dvakrát), přeskoč.
- **Důsledek:** pokud admin upraví `DailyCheck` šablonu během dne, dnešní instance jsou už vytvořené se starou definicí — historie je tak zamrzlá k okamžiku vzniku. Změna se projeví od dalšího dne.
- Při čtení v `/child/today` se instance jen načítají, **nevytváří se** (kdyby chyběly, je to bug v rolloveru).

#### 2.6 Cron job — denní uzavření
- `/app/api/cron/daily-close/route.ts`
- Volá GitHub Actions (D1), 23:59 Prague.
- Díky eager generování (2.5) je logika triviální:
  - `UPDATE DailyCheckInstance SET status='MISSED' WHERE status='PENDING' AND date = today_prague`.
  - `SUBMITTED` zůstává (admin může schválit zpětně do 24h).

#### 2.7 Child UI
- `/child/today`:
  - Hlavička: „Tento týden: Kuchyň" + ikonka.
  - Sekce „Ráno" (morning checky), „Večer" (evening), „Kdykoliv" (anytime).
  - Každý check: název + tlačítko „Hotovo" (pokud `PENDING`), ikonka stavu (`SUBMITTED` = ⏳, `APPROVED` = ✅, `REJECTED` = ⚠️ + možnost re-submit).
  - Pokud check `MISSED` → zobrazit šedě, neaktivní.
- Optimistický update: po klepnutí „Hotovo" se hned zobrazí jako `SUBMITTED`.

#### 2.8 Admin UI
- `/admin/inbox`:
  - Seznam položek `SUBMITTED` (prozatím jen denní checky, později i úkoly).
  - Sdružené podle holky.
  - Každý: název checku, kdy odeslala, tlačítka „Schválit" / „Vrátit" (s volitelnou poznámkou).
  - Po akci se item odstraní ze seznamu.

#### 2.9 Seed
- 3 kompetence (Kuchyň, Obývák, Koupelna).
- Pro každou ~3 ukázkové denní checky (Milan a manželka pak nahradí reálnými).
- První `CompetencyAssignment` pro aktuální týden.

#### 2.10 NotificationQueue + admin e-mail digest (D3)

Bootstrap notifikační infrastruktury — používá se napříč M2–M4.

```prisma
model NotificationQueue {
  id        String   @id @default(cuid())
  eventType NotificationEventType
  payload   Json     // { userId, displayName, itemName, ... }
  createdAt DateTime @default(now())
  sentAt    DateTime?  // null = čeká na odeslání
}

enum NotificationEventType {
  CHECK_SUBMITTED
  TASK_PENDING_REVIEW    // přidá se v M3
  SCREEN_TIME_REQUESTED  // přidá se v M4
}

model NotificationLog {
  id        String   @id @default(cuid())
  sentAt    DateTime @default(now())
  itemCount Int      // kolik queue položek bylo zahrnuto
}
```

- `lib/notifications.ts`:
  - `enqueueNotification(eventType, payload)` — volá se při relevantní akci.
  - `sendAdminDigest()` — agreguje unsent items, pošle e-mail přes Resend, označí jako sent.
- `/app/api/cron/admin-digest/route.ts`
- Volá GitHub Actions každých 15 min:
  - Pokud `NotificationQueue.sentAt IS NULL` count > 0 a poslední `NotificationLog.sentAt > 10 min ago` → pošli souhrnný e-mail na `ADMIN_NOTIFICATION_EMAILS` přes Resend.
  - Safety-net: i když není nic nového, pokud je 20:00 Prague a jsou unsent items → pošli.
- E-mail šablona: jednoduchý HTML se shrnutím („3 nové denní checky čekají na schválení", „1 hlášený úkol", …) + odkaz na `/admin/inbox`.

**Pro M2:** stačí enqueue při `submitCheckAction` (denní check) a digest cron. Další event types se přidají v M3 a M4.

### Acceptance criteria
- ✅ Admin vytvoří/upraví denní check.
- ✅ Holka vidí svou kompetenci pro tento týden.
- ✅ Holka odešle check ke schválení.
- ✅ Admin schválí — check zezelená.
- ✅ Admin vrátí — check je červený, holka může re-submit.
- ✅ Po neděli 23:55 se kompetence rotuje a holka má nové.
- ✅ Po 23:59 nesplněné checky → `MISSED`.

### Out of scope
- Pause / nemoc / výlet.
- Bonus za splněný měsíc (Milestone 5).
- Odemykání extra úkolů (Milestone 3).

---

## Milestone 3 — Pool úkolů, claim flow, rotační fronta

**Cíl:** Funkční pool extra úkolů. Holka si ho claimne, vykoná, hlásí, admin schvaluje. Rotační fronta funguje.

### Úkoly

#### 3.1 Datový model
```prisma
model Task {
  id                  String   @id @default(cuid())
  name                String
  description         String?
  valueCzk            Int
  timeEstimateMinutes Int?
  frequencyDays       Int?     // null = ad hoc, číslo = opakuje se
  claimTimeoutHours   Int      @default(24)
  executeTimeoutHours Int      @default(3)
  createdById         String
  createdAt           DateTime @default(now())
  isActive            Boolean  @default(true)

  instances           TaskInstance[]
  rotationLog         TaskRotationLog[]
}

model TaskInstance {
  id              String   @id @default(cuid())
  taskId          String
  task            Task     @relation(fields: [taskId], references: [id])
  createdAt       DateTime @default(now())
  expiresAt       DateTime  // celkový deadline (po projití všech v rotaci)
  status          TaskStatus  // AVAILABLE | CLAIMED | PENDING_REVIEW | DONE | EXPIRED | REJECTED

  // Rotační fronta
  unlockedForUserId String?  // momentálně odemčeno pro tuto holku, null = pro všechny po projití rotace
  unlockExpiresAt   DateTime?  // do kdy claim, pak posun na další

  // Claim
  claimedById     String?
  claimedAt       DateTime?
  executeDeadline DateTime?

  // Review
  submittedAt     DateTime?
  reviewedAt      DateTime?
  reviewerId      String?
  reviewNote      String?
}

enum TaskStatus {
  AVAILABLE
  CLAIMED
  PENDING_REVIEW
  DONE
  EXPIRED
  REJECTED
}

model TaskRotationLog {
  id        String   @id @default(cuid())
  taskId    String
  task      Task     @relation(fields: [taskId], references: [id])
  userId    String
  doneAt    DateTime
}
```

#### 3.2 Admin: CRUD úkolů
- `/admin/tasks`:
  - Seznam šablon úkolů (ad hoc i opakující se).
  - Tlačítko „Nový úkol".
- Formulář:
  - Název, popis
  - Hodnota Kč (přímo) **NEBO** odhad času v minutách → automatický výpočet z hodinové sazby
  - Frekvence: jednorázový / opakující se každých N dní
  - Timeout claim, timeout execute (defaulty z nastavení)
  - Tlačítko „Uložit" — vytvoří `Task`. Pro ad hoc rovnou vytvoří 1 `TaskInstance` ve stavu `AVAILABLE`. Pro opakující se: vytvoří první instanci hned a další generuje cron.

#### 3.3 Rotační fronta — algoritmus
- Při vytvoření nové `TaskInstance`:
  1. Najdi všechny aktivní děti, seřaď podle: kdo dělal tento `taskId` nejdéle naposledy (z `TaskRotationLog`). Pokud nikdo nikdy nedělal, použij `User.rotationOrder`.
  2. První v pořadí = `unlockedForUserId`. `unlockExpiresAt` = `now + claimTimeoutHours`.
- Cron job (každých 15 min nebo hodina): kontroluje `TaskInstance` ve stavu `AVAILABLE`:
  - Pokud `unlockExpiresAt` proběhlo a stále nikdo neclaimnul → posun na další v pořadí.
  - Pokud projeli všichni → `unlockedForUserId = null` (volné pro kohokoliv) a po dalším timeoutu → `EXPIRED`.

#### 3.4 Claim flow (child)
- `/child/pool`:
  - 3 sekce:
    - **„Můžu vzít teď"** — `AVAILABLE` & (`unlockedForUserId == me` || `unlockedForUserId == null`) & dnešní kompetence splněné.
    - **„Zamčeno (čeká na sourozenku)"** — `AVAILABLE` & `unlockedForUserId != me`. Zobrazit jméno toho, na koho se čeká, + zbývající čas.
    - **„Brzy dostupné"** — všechny ostatní `AVAILABLE` (ale po projití rotace ke mně).
- Karta úkolu: název, popis, hodnota Kč, časovač.
- Tlačítko „Vzít si" (jen v sekci 1):
  - Disabled, pokud nesplněné kompetence dnes → tooltip „Nejdřív dokonči dnešní {kompetence}".
  - Po klepnutí → konfirmace modal („Beru úkol — mám {executeTimeoutHours}h na dokončení").
  - Po potvrzení: `TaskInstance.status = CLAIMED`, `claimedById = me`, `claimedAt = now`, `executeDeadline = now + executeTimeoutHours`.

#### 3.5 Execute & report (child)
- `/child/my-tasks`:
  - Aktivní claimnuté úkoly.
  - Karta: timer „Zbývá 2h 14m do hlášení", tlačítko „Hotovo".
  - Po klepnutí „Hotovo" → `TaskInstance.status = PENDING_REVIEW`, `submittedAt = now`.

#### 3.6 Review flow (admin)
- `/admin/inbox`: rozšířit o `TaskInstance` ve stavu `PENDING_REVIEW`.
- Karta úkolu: kdo, co, kdy hlásila. Tlačítka „Schválit" / „Vrátit" (s notou).
- **Schválit:**
  - `TaskInstance.status = DONE`, `reviewedAt`, `reviewerId`.
  - Vytvoří `CreditTransaction` (Milestone 4) — do té doby si jen ulož, že má proběhnout. Pro M3 stačí logovat.
  - Vytvoří `TaskRotationLog` záznam.
- **Vrátit:**
  - `TaskInstance.status = REJECTED`. Vytvoří se nová `TaskInstance` se stejným `taskId`, ale rotace přeskočí Aničku → další v pořadí.

#### 3.7 Cron — opakující se úkoly
- `/app/api/cron/recurring-tasks/route.ts`, volá GitHub Actions (D1) v 06:00 Prague.
- Pro každý `Task` s `frequencyDays != null`:
  - Pokud poslední `TaskInstance` (DONE/EXPIRED) je starší než `frequencyDays` a žádná aktivní instance neexistuje → vytvoř novou.

#### 3.8 Cron — claim timeout
- `/app/api/cron/claim-timeout/route.ts`, GitHub Actions (D1), každých 15 min.
- Najde `TaskInstance` ve stavu `AVAILABLE` s prošlým `unlockExpiresAt` → posun rotace.
- Pokud `TaskInstance` ve stavu `CLAIMED` má prošlý `executeDeadline` → vrátí do poolu (status `AVAILABLE`, vyčistí claim fields, log).

#### 3.9 NotificationQueue rozšíření
Přidat enqueue volání:
- Při `reportTaskDoneAction` (child klikne „Hotovo") → `enqueueNotification('TASK_PENDING_REVIEW', {...})`.

#### 3.9 Edge cases
- **Holka má kompetenci splněnou jen částečně** → claim disabled. Vysvětlení v UI.
- **Admin zruší / smaže šablonu úkolu** → aktivní instance buď nech doběhnout, nebo nastav `task.isActive = false` a zamez vzniku nových.

### Acceptance criteria
- ✅ Admin vytvoří jednorázový úkol → objeví se v poolu jedné z holek.
- ✅ Admin vytvoří opakující se úkol → cron generuje instance v intervalu.
- ✅ Holka claimne → ostatní vidí, že je obsazený.
- ✅ Holka neclaimne v limitu → posun na další.
- ✅ Holka claimne, vykoná, nahlásí → admin v inboxu, schválí → úkol je `DONE`.
- ✅ Admin vrátí úkol → vytvoří se nová instance, rotace přeskočí.
- ✅ Když holka nemá splněné kompetence, claim je disabled.

### Out of scope
- Připisování kreditu (Milestone 4) — pro M3 stačí, že úkol je `DONE`.
- Notifikace nad rámec viditelného stavu v UI.

---

## Milestone 4 — Kredit, výplata, čerpání obrazovky

**Cíl:** Hodnota za schválený úkol se připisuje do kreditu. Týdenní uzávěrka. Hotovostní výplata. Žádosti o obrazovku.

### Úkoly

#### 4.1 Datový model
```prisma
model CreditTransaction {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  amountCzk     Int      // kladné = příjem, záporné = výdaj
  type          TransactionType
  referenceId   String?  // odkaz na TaskInstance, ScreenTimeRequest, atd.
  weekStart     DateTime  // do kterého týdne patří (= sedí na pondělí)
  note          String?
  createdAt     DateTime @default(now())
}

enum TransactionType {
  TASK_REWARD
  SCREEN_TIME
  MONTHLY_BONUS
  PAYOUT
  ADJUSTMENT
}

model ScreenTimeRequest {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  minutes     Int
  costCzk     Int
  status      RequestStatus  // PENDING | APPROVED | REJECTED
  createdAt   DateTime @default(now())
  reviewedAt  DateTime?
  reviewerId  String?
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

model WeeklyPayout {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id])
  weekStart         DateTime  // pondělí
  weekEnd           DateTime  // neděle
  totalEarnedCzk    Int      // suma TASK_REWARD
  totalScreenTimeCzk Int     // suma SCREEN_TIME (kladná hodnota = utraceno)
  bonusCzk          Int      @default(0)  // jen poslední týden měsíce
  totalPayoutCzk    Int      // earned - screen + bonus
  paidOutAt         DateTime?
  paidOutById       String?
  createdAt         DateTime @default(now())

  @@unique([userId, weekStart])
}

model AppSettings {
  id                       String  @id @default(cuid())
  hourlyRateCzk            Int     @default(150)
  screenTimeHourCostCzk    Int     @default(200)
  screenTimeMinGranularity Int     @default(30)
  monthlyBonusCzk          Int     @default(200)
  defaultClaimTimeoutHours Int     @default(24)
  defaultExecuteTimeoutHours Int   @default(3)
}
```

#### 4.2 Připisování kreditu
- Při schválení `TaskInstance` (Milestone 3 → rozšíření):
  - Vytvoř `CreditTransaction` s `type=TASK_REWARD`, `amountCzk = TaskInstance.task.valueCzk`, `weekStart = currentWeekStart()`.
- Helper `lib/week.ts`:
  - `getCurrentWeekStart(date: Date): Date` — vrací pondělí 00:00 daného týdne (Europe/Prague).
  - `getCurrentWeekEnd(date: Date): Date` — neděle 23:59:59.

#### 4.3 Child kredit view
- `/child/credit`:
  - **Aktuální týden:**
    - „Vyděláno: 380 Kč" (suma TASK_REWARD pro tento týden)
    - „Vyčerpáno na obrazovku: 100 Kč" (abs hodnota SCREEN_TIME)
    - „K výplatě: 280 Kč"
  - **Bonus:** „Bonus tento měsíc stále ve hře 🎯" / „Bonus už ne 😞" + datum, kdy padl
  - **Tlačítko „Chci obrazovku":**
    - Modal: výběr 30 / 60 / 90 min (násobky `screenTimeMinGranularity`).
    - Cena se počítá: `(minutes / 60) * screenTimeHourCostCzk`.
    - Disabled, pokud kredit < cena.
    - Po potvrzení vytvoří `ScreenTimeRequest` ve stavu `PENDING`.

#### 4.4 Žádosti o obrazovku — admin
- `/admin/screen-time` (nebo součást inboxu):
  - Seznam `PENDING` requestů.
  - Tlačítka „Schválit" / „Zamítnout".
  - **Schválit:** vytvoří `CreditTransaction` s `type=SCREEN_TIME`, `amountCzk = -costCzk`. `ScreenTimeRequest.status = APPROVED`.
  - **Zamítnout:** jen `status = REJECTED`. Žádný odpočet.

#### 4.5 Týdenní uzávěrka — cron
- `/app/api/cron/weekly-close/route.ts`, GitHub Actions (D1) neděle 23:59 Prague.
- Pro každé dítě:
  1. Spočítej `totalEarnedCzk` = suma `TASK_REWARD` za týden.
  2. Spočítej `totalScreenTimeCzk` = suma abs `SCREEN_TIME` za týden.
  3. `bonusCzk` = pro M4 zatím 0 (přijde v M5).
  4. `totalPayoutCzk = totalEarnedCzk - totalScreenTimeCzk + bonusCzk`. Pokud záporné → 0 (nemůže dlužit).
  5. Vytvoř `WeeklyPayout` s `paidOutAt = null`.

#### 4.6 Admin výplata
- `/admin/payouts`:
  - Seznam `WeeklyPayout` všech holek, seskupené podle týdne, nejnovější první.
  - Pro každý: jméno, týden, totaly, tlačítko „Vyplaceno".
  - Po klepnutí: `paidOutAt = now`, `paidOutById = currentAdmin`.
  - Vizuální oddělení vyplacených (šedé) a nevyplacených (zvýrazněné).

#### 4.7 Historie (child)
- `/child/history`:
  - Seznam minulých `WeeklyPayout` (od nejnovějšího).
  - Pro každý týden: kolik vydělala, kolik utratila za obrazovku, kolik dostala v hotovosti, status výplaty.
  - Drill-down: rozklik týdne → seznam jednotlivých `CreditTransaction`.

#### 4.8 Settings (admin)
- `/admin/settings`:
  - Formulář s hodnotami z `AppSettings`.
  - Save → update.

#### 4.9 NotificationQueue rozšíření
Přidat enqueue volání:
- Při vytvoření `ScreenTimeRequest` → `enqueueNotification('SCREEN_TIME_REQUESTED', {...})`.

### Acceptance criteria
- ✅ Schválený úkol připíše hodnotu do kreditu.
- ✅ Holka vidí aktuální balanci.
- ✅ Holka požádá o obrazovku, admin schválí, kredit se sníží.
- ✅ V neděli se uzavře týden, vznikne `WeeklyPayout`.
- ✅ Admin označí výplatu jako vyplacenou.
- ✅ Holka vidí historii minulých týdnů.
- ✅ Admin může změnit ekonomické parametry, projeví se okamžitě.

### Out of scope
- Měsíční bonus (M5).
- Auto-approve obrazovky.
- Undo schválení.

---

## Milestone 5 — Měsíční bonus, status „bonus ve hře"

**Cíl:** Holka, která zvládne celý měsíc bez prošvihnutého checku, dostane 200 Kč bonus. Aplikace v reálném čase ukazuje, jestli je bonus stále ve hře.

### Úkoly

#### 5.1 Helper
- `lib/bonus.ts`:
  - `isBonusStillAchievable(userId: string, month: Date): { stillInGame: boolean; lostOn?: Date }`
    - Vrátí `false`, pokud existuje `DailyCheckInstance` s `status=MISSED` nebo `status=REJECTED` (bez následného re-submit a approval) v daném měsíci pro danou holku.
    - Vrátí `true`, pokud zatím všechno OK.
  - `calculateBonus(userId: string, month: Date): number`
    - Pokud `isBonusStillAchievable` = true a měsíc skončil → vrátí `AppSettings.monthlyBonusCzk`.
    - Jinak 0.

#### 5.2 Cron — měsíční uzávěrka
- `/app/api/cron/monthly-close/route.ts`, GitHub Actions (D1), poslední den měsíce 23:58 Prague (před týdenní uzávěrkou).
- Pro každé dítě spočítej bonus.
- Pokud bonus > 0:
  - Vytvoř `CreditTransaction` s `type=MONTHLY_BONUS`, `amountCzk = bonus`, `weekStart = currentWeekStart()`.
  - Týdenní uzávěrka pak bonus zahrne do `WeeklyPayout.bonusCzk` a `totalPayoutCzk`.
- **Edge case:** Pokud poslední den měsíce ≠ neděle, bonus se počítá do týdne, do kterého patří poslední den měsíce. Týdenní uzávěrka v neděli ho zahrne automaticky (suma transakcí za týden).

#### 5.3 Status „bonus ve hře" v UI
- `/child/today`:
  - Banner: „🎯 Bonus tento měsíc stále ve hře (200 Kč)" / „😞 Bonus tento měsíc už ne — zaváhala jsi 12.7."
- `/child/credit`:
  - Stejný banner v sekci „aktuální týden".

#### 5.4 Reflexe v `WeeklyPayout`
- Při týdenní uzávěrce: `bonusCzk` = suma `MONTHLY_BONUS` transakcí v daném týdnu.

### Acceptance criteria
- ✅ Holka, která zvládne všechny checky v měsíci, dostane 200 Kč v posledním týdnu měsíce.
- ✅ Pokud zaváhá uprostřed měsíce, banner se změní a bonus se nepřipíše.
- ✅ Banner ukazuje datum, kdy bonus padl.
- ✅ V historii se bonus objeví jako samostatný řádek.

### Out of scope
- Bonus za perfektní týden.
- Konfigurovatelná „tolerance" (např. 1 missed povolen).

---

## Milestone 6 — PWA, badge notifikace, polish

**Cíl:** Aplikace je nainstalovatelná na home screen iPhonu, vizuální notifikace fungují, drobnosti jsou doladěné.

### Úkoly

#### 6.1 PWA setup
- Vytvořit `public/manifest.json`:
  - Name, short_name, theme_color, background_color, ikony 192/512.
- Service worker pro offline shell (volitelné — pro v1 stačí, že appka ukáže „Bez připojení" při ztrátě konektivity).
- iOS specifika: meta tagy `apple-mobile-web-app-capable`, `apple-touch-icon`.
- Test: na iPhonu otevřít v Safari → „Add to Home Screen" → ikona se objeví, app se otevírá fullscreen.

#### 6.2 Badge notifikace
- Komponenta `<Badge count={n} />`.
- Použít v navigaci (tab bar / sidebar):
  - **Child:**
    - „Mé úkoly" — počet `CLAIMED` + `PENDING_REVIEW` + nedávno `REJECTED` (od posledního zobrazení).
    - „Pool" — počet úkolů odemčených pro mě s timeoutem < X.
    - „Kredit" — pokud byly nové připsané transakce od posledního zobrazení.
  - **Admin:**
    - „Inbox" — počet `SUBMITTED` checků + `PENDING_REVIEW` úkolů.
    - „Obrazovka" — počet `PENDING` requestů.
- Badge resetuje na 0 při otevření dané sekce.
- Implementace: server-side query při každém renderu layoutu (jednoduché, nepotřebuje real-time push).

#### 6.3 Polish
- **Loading states** — skeletony pro seznamy.
- **Error handling** — toast notifikace.
- **Confirmation modaly** — pro destruktivní akce (vrátit úkol, zamítnout obrazovku).
- **Accessibility** — labels, focus management, keyboard nav (na desktop).
- **Responzivní fixy** — kontrola na iPhone SE (malá obrazovka) i iPad.
- **Prázdné stavy** — „Žádné úkoly k claim", „Pool je prázdný", „Žádná historie".
- **Drobnosti UX** — vibrace při chybě PINu, animace přechodů, atd.

#### 6.4 Reset PINu
- `/admin/users` → tlačítko „Reset PIN" u každého profilu.
- Generuje dočasný PIN (např. `0000`), který by holka měla po prvním přihlášení změnit.
- (Pro v1 nemusí být force change, stačí instrukce „přijď za mnou změnit".)
- Pro M6 doporučuji přidat i obrazovku „Změnit PIN" v `/child` settings.

#### 6.5 Závěrečný cleanup
- Vyčistit testovací data, nahrát reálná: 5 reálných uživatelů, reálné kompetence, reálné denní checky (Milan + manželka definuje), pár prvních úkolů.
- Smazat default PINy, nastavit reálné.
- Otestovat end-to-end happy path s rodinou (nejlépe simulovaně, např. test runem).
- Vytvořit krátký onboarding doc pro holky („Jak to funguje" — 1 stránka, screenshoty).

### Acceptance criteria
- ✅ Aplikace jde přidat na home screen iPhonu, otevírá se fullscreen.
- ✅ Badge notifikace fungují a aktualizují se po akcích.
- ✅ Všechny hlavní flows jsou bez chyb.
- ✅ Reálná data jsou v DB, defaultní PINy zrušeny.
- ✅ Rodina může začít používat.

---

## Po Milestone 6 — Provoz a iterace

**Po nasazení:**

1. **První 2 týdny** = observační fáze. Sleduj, co fakt funguje a co ne. Buď připravený na drobné úpravy (UI, formulace, defaultní hodnoty).
2. **Měsíc 1** = první uzávěrka, první vyplacený bonus. Vyhodnocení.
3. **Po 3 měsících** = retrospektiva. Co je z otevřených otázek (viz PRD §8) potřeba dořešit? Co dát do v2?

**Kandidáti na v2 (orientačně):**
- Pause režim (nemoc/výlet).
- Push notifikace.
- Prarodiče jako read-only role.
- Bonus za perfektní týden (vedle měsíčního).
- Statistiky a porovnání (s opatrností).
- Multi-tenant (pokud by to mělo zájem víc rodin).
- Undo schválení.
- Auto-approve obrazovky pod limit.

---

## Time estimates (orientační)

Pro někoho jako Claude Code (nebo zkušený dev) v plném tempu:

| Milestone | Hrubý odhad |
|---|---|
| M0 — Bootstrap | 2–3 hodiny |
| M1 — Auth + layout | 1 den |
| M2 — Kompetence + checky + rotace | 2 dny |
| M3 — Pool + claim flow | 2–3 dny |
| M4 — Kredit + výplata + obrazovka | 2 dny |
| M5 — Měsíční bonus | 0,5 dne |
| M6 — PWA + polish | 1–2 dny |
| **Celkem** | **9–12 dnů soustředěné práce** |

V realitě s testováním, iteracemi a překvapeními počítej **2–3 týdny kalendárně**.

---

## Co potřebuješ připravit jako vstup

Než pustíš Claude Code na M2, měj nachystané:

1. **Konkrétní denní checky pro každou kompetenci.**
   Příklad pro kuchyň:
   - Ráno: prázdná myčka
   - Ráno: čistá linka
   - Večer: nádobí v myčce / umyté
   - Večer: utřený sporák a linka
   - Večer: vyhozené odpadky
   (Doplň podle reality vaší kuchyně. Stejně pro obývák a koupelnu.)

2. **Pořadí rotace.**
   Kdo začíná v prvním týdnu s kterou kompetencí.

3. **Jména a měsíční kapesné** všech tří dcer.

4. **Prvotní seznam extra úkolů.**
   Pár opakujících se (sprchový kout, půdička) + pár ad hoc, na rozjezd.

Vše ostatní (sazby, bonus, timeouty) má v PRD/M0 sensible defaults a doladí se za provozu.

---

*Implementation Plan verze 1.0 — připraveno k handoff do Claude Code.*