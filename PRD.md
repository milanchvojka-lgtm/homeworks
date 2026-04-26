# Domácí Úkoly — Product Requirements Document

> Pracovní název. Finální brand může mít rodinný "in-joke" charakter (např. „Holky v akci", „Naše dom(ác)nost") — řešíme později.

> ⚠️ **Tento dokument byl po sepsání upraven o rozhodnutí D1–D4 v [`DECISIONS.md`](./DECISIONS.md).** Při rozporu má `DECISIONS.md` prioritu. Hlavní upravené body: cron přes GitHub Actions (ne Vercel Cron), eager generování `DailyCheckInstance`, e-mail digest pro adminy, Supabase jako DB.

---

## 1. Overview

Webová aplikace pro řízení domácích povinností a odměn ve čtyřčlenné rodinné domácnosti se třemi dcerami (15, 14, 11 let). Aplikace eviduje plnění týdně rotujících kompetenčních oblastí (kuchyň, obývák, koupelna), spravuje pool extra placených úkolů s rotační frontou, a převádí vykonanou práci na peněžní kredit, který lze čerpat buď v hotovosti nebo směnou za čas u obrazovky.

Cílem je nahradit současný neformální (a nefunkční) systém transparentním nástrojem, který:
- vytváří jasná pravidla pro plnění základních domácích povinností,
- motivuje děti pozitivně i negativně (vidí, co vydělaly i co jim uteklo),
- učí je hospodaření (volba mezi hotovostí a obrazovkou),
- snižuje administrativní zátěž rodičů (jeden moment kontroly denně, jeden moment výplaty týdně/měsíčně).

Aplikace je primárně provozována jako PWA na mobilních zařízeních (iPhone, iPad), s možností použít ji i z desktopu.

---

## 2. User Roles

### Admin
- Rodič (otec, matka). V systému jsou typicky 2 admin účty.
- **Práva:**
  - Vytvářet a upravovat extra úkoly (jednorázové i opakující se).
  - Definovat denní checky pro každou kompetenci (kuchyň/obývák/koupelna).
  - Schvalovat nebo vracet hlášení o splnění úkolů a denních checků.
  - Označovat hotovostní výplaty jako provedené.
  - Konfigurovat ekonomické parametry (hodinová sazba, cena obrazovky, výše bonusu, granularita).
  - Spravovat uživatelské profily dětí (vytvořit, upravit jméno, výši kapesného, pořadí v rotaci).
  - Pauznout den/období holky (např. nemoc, výlet) — neplatí pro v1, viz Open Questions.

### Child (dítě)
- Tři dcery. Každá má vlastní profil a PIN.
- **Práva:**
  - Vidět své aktuální kompetence pro daný týden a denní checky.
  - Označovat denní checky jako splněné.
  - Vidět pool extra úkolů — dostupné, blokované (čekají na claim jiné holky), čekající na schválení, schválené.
  - Claimnout extra úkol (pokud jsou splněné kompetence dnešního dne).
  - Hlásit dokončení úkolu (= odeslání ke schválení adminem).
  - Vidět svůj aktuální týdenní/měsíční kredit, historii a stav „bonus stále ve hře".
  - Žádat o čerpání času u obrazovky (= odepsání kreditu adminem).

### Out of scope pro v1
- Prarodiče jako uživatelé (zůstávají mimo aplikaci).
- Super-admin role nad rámec běžného admina.

---

## 3. Sitemap

```
/ (login screen — výběr profilu + PIN)
│
├── /child (rozhraní pro dítě — root po loginu)
│   ├── /child/today              (dashboard: dnešní checky, status bonus, kredit)
│   ├── /child/pool               (pool extra úkolů)
│   ├── /child/my-tasks           (claimnuté + čekající na schválení)
│   ├── /child/credit             (přehled kreditu, historie, žádost o čerpání obrazovky)
│   └── /child/history            (přehled minulých týdnů/měsíců)
│
└── /admin (rozhraní pro rodiče — root po loginu)
    ├── /admin/inbox              (čekající ke schválení — denní checky + hlášené úkoly)
    ├── /admin/competencies       (správa kompetencí a denních checků)
    ├── /admin/tasks              (správa pool úkolů — katalog + ad hoc)
    ├── /admin/payouts            (týdenní/měsíční výplaty, odškrtávání hotovosti)
    ├── /admin/screen-time        (žádosti o čerpání obrazovky — odsouhlasení a odpočet)
    ├── /admin/users              (správa profilů dětí)
    └── /admin/settings           (ekonomické parametry, rotace, kapesné)
```

Po přihlášení se uživatel směruje automaticky do `/admin` nebo `/child` podle své role.

---

## 4. Feature Specification

### 4.1 Týdenní kompetence + denní checky

- **Priorita:** Must-have

- **Description:**
  Každá kompetence (kuchyň, obývák, koupelna) je v daném týdnu přiřazená právě jedné holce. Každá kompetence obsahuje sadu **denních checků** definovaných adminem. Holka každý den odškrtává splněné checky a hlásí je ke schválení.

- **User flow (dítě):**
  1. Holka otevře `/child/today`. Vidí: „Tento týden máš na starosti **Kuchyň**." + checklist denních checků pro daný den.
  2. Po splnění klikne u každého checku „Hotovo" → check přejde do stavu *čeká na schválení*.
  3. Když všechny dnešní checky odeslala (nebo i průběžně), čeká na adminovo schválení.
  4. Po schválení se check zobrazí jako ✅. Pokud admin vrátí, zobrazí se jako ⚠️ s důvodem (volitelně) a holka může opravit a znovu odeslat.
  5. Pokud má holka **všechny dnešní checky schválené** → odemyká se claim na extra úkoly pro daný den.

- **User flow (admin):**
  1. Admin otevře `/admin/inbox` → vidí seznam čekajících checků seřazených chronologicky, sdružených podle holky.
  2. U každého klikne „Schválit" nebo „Vrátit" (s volitelnou poznámkou).

- **Data:**
  - **Read:** denní checky podle aktuální kompetence holky a aktuálního dne, jejich stav.
  - **Write:** stav checku (`pending` → `submitted` → `approved`/`rejected`).

- **UI notes:**
  - Děti vidí dnešní den jako primární view, ne celý týden.
  - Admin inbox má badge s počtem čekajících položek viditelný globálně.
  - Vizuálně oddělit „checky pro dnešek" (akční) a „checky včerejší/budoucí" (historie/plán).

- **Edge cases:**
  - Den přechází po půlnoci. Nesplněné checky předchozího dne se uzavírají s výsledkem `missed`.
  - Pokud admin nestihne schválit do konce dne, check zůstává v `submitted` — neblokuje to claim extra úkolů (viz 4.4).
  - Vrácený check (`rejected`) vrací holku do `pending` a lze znovu odeslat.
  - **`DailyCheckInstance` se generuje eager** ranním cronem v 00:05 Prague (viz `DECISIONS.md` D2). Holka, která appku ten den neotevře, má instance vytvořené tak jako tak — `MISSED` cron je o 23:59 označí, čímž zůstává integritní výpočet měsíčního bonusu.

---

### 4.2 Týdenní rotace kompetencí

- **Priorita:** Must-have

- **Description:**
  Každou neděli o 23:59 se kompetence automaticky rotují podle adminem nastaveného pořadí. Standardní rotace: 3 kompetence × 3 holky → každá projde každou jednou za 3 týdny.

- **User flow:**
  - Žádný interaktivní flow — automatika.
  - Admin v `/admin/settings` vidí aktuální rozložení a pořadí, může rotaci ručně přepnout (např. po výletu).

- **Data:**
  - **Read:** aktuální mapování kompetence → holka.
  - **Write:** týdně automaticky, ručně adminem na vyžádání.

- **UI notes:**
  - V `/child/today` vidí holka v hlavičce „Tento týden: Kuchyň" + případný náhled „Příští týden: Obývák".

- **Edge cases:**
  - Pokud admin změní rotaci uprostřed týdne, předchozí rozdělané checky se uzavírají, nové se otevírají od dalšího dne.

---

### 4.3 Pool extra úkolů (katalog + ad hoc)

- **Priorita:** Must-have

- **Description:**
  Extra úkoly žijí v poolu. Admin je vytváří jako:
  - **Jednorázové (ad hoc)** — „dnes posekat zahradu, 250 Kč".
  - **Opakující se** — admin definuje úkol a frekvenci (např. „mytí sprchového koutu, každých 14 dní, 80 Kč"). Systém ho automaticky pouští do poolu v daném intervalu.

  Každý úkol má:
  - **Název** + volitelný popis
  - **Hodnotu v Kč** (zadávanou přímo, nebo odvozenou z časového odhadu × hodinová sazba)
  - **Frekvenci** (jednorázový, nebo interval)
  - **Stav v poolu**: `available`, `locked_for_X` (rotace), `claimed_by_X`, `pending_review`, `done`, `expired`

- **User flow (admin — vytvoření):**
  1. `/admin/tasks` → tlačítko „Nový úkol".
  2. Vyplní formulář: název, popis, hodnota Kč, frekvence (nikdy / každých N dní).
  3. Pokud opakující se → systém ho přidá do katalogu a generuje instance v intervalu.

- **User flow (dítě — pool):**
  1. `/child/pool` ukazuje seznam úkolů s jejich aktuálním stavem.
  2. Pokud má holka splněné dnešní kompetence + je „na řadě" v rotační frontě → vidí tlačítko „Vzít si".
  3. Pokud není na řadě → vidí „Zamčeno do [datum/čas], na řadě je [Anička]".

- **Data:**
  - **Read:** seznam úkolů v poolu + jejich stav vůči přihlášené holce.
  - **Write:** vznik nových úkolů adminem, generování instancí opakujících se úkolů (cron).

- **UI notes:**
  - Pool je vizuálně rozdělený na: „Můžu vzít teď", „Čeká na někoho jiného", „Brzy dostupné".
  - Hodnota v Kč je dominantní vizuální prvek karty úkolu.

- **Edge cases:**
  - Co když je v poolu příliš mnoho úkolů a děti se nestíhají? → admin musí pravidelně čistit. Není to systémový problém pro v1.
  - Opakující se úkol, který nebyl claimnutý ani po expiraci → propadá, generuje se nová instance v dalším intervalu.

---

### 4.4 Rotační fronta extra úkolů

- **Priorita:** Must-have

- **Description:**
  Když se objeví nový úkol v poolu, systém určí, **která holka je na řadě** podle historie (kdo dělal podobný/poslední úkol naposledy). Ta má X hodin (default 24h, konfigurovatelné) na claim. Pokud neclaimne, úkol se odemyká **další** v pořadí. A tak dále, dokud někdo neclaimne nebo úkol neexpiruje úplně.

- **User flow:**
  1. Úkol se objeví → systém určí pořadí (nejjednodušší pravidlo: nejdéle nedělala = první na řadě).
  2. Holka A vidí v poolu „Můžeš vzít, propadne za 24h". Ostatní vidí „Zamčeno pro [Aničku] do [zítra 14:00]".
  3. Pokud A claimne → úkol přechází do `claimed_by_A` (viz 4.5).
  4. Pokud A neclaimne v limitu → úkol se odemyká holce B (další v pořadí). Atd.
  5. Pokud nikdo neclaimne ani po projití všech holek → úkol expiruje a vrátí se do dalšího cyklu (u opakujících se) nebo zmizí (u jednorázových).

- **Data:**
  - **Read:** pořadí holek vůči danému úkolu, časovač expirace.
  - **Write:** stavy úkolu, log claim události.

- **UI notes:**
  - Časovač („Propadne za 6h 23m") viditelný u úkolu.
  - Notifikace v badge: „Máš úkol k claimu, propadne za X".

- **Edge cases:**
  - **Holka nemá splněné dnešní kompetence** → vidí úkol, ale tlačítko „Vzít si" je disabled s vysvětlením „Nejdřív dokonči dnešní kuchyň/obývák/koupelnu."
  - **Žádná holka aktuálně nesplňuje kompetence** → úkol čeká, dokud někdo neodemkne, ale časovač běží. Toto je úmyslné — vytváří tlak na plnění.
  - **Holka, která je na řadě, je na výletě** → úkol jí propadne automaticky. Pro v1 to nechat, pro v2 řeší pause feature.

---

### 4.5 Claim → Execute → Review flow

- **Priorita:** Must-have

- **Description:**
  Když holka claimne úkol, znamená to „jdu ho dělat teď". Má časový limit na fyzické provedení a odeslání ke schválení.

- **User flow (dítě):**
  1. Holka klikne „Vzít si" → úkol přechází do `claimed_by_X`, spouští se timer (např. 3h, konfigurovatelné na úkol).
  2. Úkol se zobrazí v `/child/my-tasks` jako aktivní.
  3. Holka úkol fyzicky vykoná, pak klikne „Hotovo" → úkol přechází do `pending_review`.
  4. Čeká, až ji admin „pojde zkontrolovat" a schválí.

- **User flow (admin):**
  1. V `/admin/inbox` vidí položku „Anička hlásí: Mytí auta — hotovo".
  2. Admin fyzicky zkontroluje výsledek.
  3. Klikne „Schválit" → úkol → `done`, holce se připíše plná hodnota do kreditu.
  4. Klikne „Vrátit" → úkol se vrátí do poolu, holce se nepřipisuje nic. Volitelně lze přidat poznámku.

- **Data:**
  - **Read:** moje claimnuté úkoly, timer.
  - **Write:** stavy úkolu, kredit holky (při schválení).

- **UI notes:**
  - Vrácený úkol pokud možno **nedávat zpět stejné holce** v rotaci hned — drobná penalizace za nekvalitu.
  - Notifikace pro admina o čekajícím review skrz badge.

- **Edge cases:**
  - **Holka claimne, ale nestihne v limitu nahlásit hotovo** → úkol se vrací do poolu, holce se připisuje nic. Žádná další penalizace pro v1.
  - **Admin schválí dlouho po dokončení** → kredit se připíše s aktuálním datem schválení (= do týdne, kdy se schválilo). Holka by tedy neměla čekat příliš dlouho, ale praktická poznámka: admin schvaluje denně.
  - **Admin omylem schválí** → zatím není undo. V2 přidat. Pro v1: admin si musí dávat pozor.

---

### 4.6 Kreditní systém a týdenní výplata

- **Priorita:** Must-have

- **Description:**
  Schválené úkoly přidávají hodnotu (v Kč) do **týdenního kreditu** holky. V neděli o 23:59 (po rotaci) se týden uzavírá:
  - Vzniká **týdenní výpis**: vyděláno (Kč) – vyčerpáno na obrazovku (Kč) = k výplatě (Kč).
  - Hotovostní část čeká na to, až admin označí výplatu jako provedenou.
  - Týden přechází do historie (`/child/history`).

- **User flow (dítě):**
  1. V `/child/credit` vidí: „Tento týden: vyděláno 380 Kč, vyčerpáno 100 Kč na obrazovku, k výplatě 280 Kč."
  2. Vidí status „Bonus stále ve hře" (pokud měsíc běží perfektně) nebo „Bonus už ne" (pokud zaváhala).
  3. V `/child/history` vidí předchozí týdny.

- **User flow (admin):**
  1. V `/admin/payouts` vidí seznam holek + jejich aktuální výplaty (k vyplacení v hotovosti).
  2. Klikne „Vyplaceno" u holky → záznam se uzavře, kredit jde na 0 pro daný týden.

- **Data:**
  - **Read:** výpis za běžící týden + historie.
  - **Write:** uzavření týdne (cron), označení výplaty.

- **UI notes:**
  - Týdenní karta zvýrazňuje 3 čísla: vyděláno, vyčerpáno, k výplatě.
  - „Ušlo ti" jako sekundární řádek (úkoly, které propadly někomu jinému, nebo zamítnuté).

- **Edge cases:**
  - **Týden bez práce** → výplata 0 Kč, žádný záznam k výplatě, ale týden se i tak uzavírá s prázdnou bilancí.
  - **Admin nezmáčkl „Vyplaceno"** → výplata zůstává otevřená v historii jako „nevyplacené" (admin ji vždycky najde, peníze se neztrácí).

---

### 4.7 Čerpání času u obrazovky

- **Priorita:** Must-have

- **Description:**
  Holka může část svého kreditu směnit za čas u obrazovky. Aplikace **NEVYNUCUJE** čas (nemůže technicky), pouze eviduje směnu jako transakci a sníží kredit.

  - Defaultní kurz: **200 Kč = 1 hodina obrazovky** (konfigurovatelné).
  - Granularita: **30 minut** (= 100 Kč při defaultu).

- **User flow (dítě):**
  1. V `/child/credit` klikne „Chci obrazovku".
  2. Vybere množství (30 / 60 / 90 minut).
  3. Vidí, kolik Kč to stojí. Potvrdí žádost.
  4. Žádost přechází do stavu `pending` a čeká na admina.

- **User flow (admin):**
  1. V `/admin/screen-time` (nebo v inboxu) vidí žádost „Anička: 30 min za 100 Kč".
  2. Klikne „Schváleno" → kredit holky se sníží, transakce se zaeviduje.
  3. Volitelně klikne „Zamítnuto" (např. „máš dost obrazovky na dnešek") → bez odpočtu.

- **Data:**
  - **Read:** aktuální kredit, kurz.
  - **Write:** transakce „čerpání obrazovky", odpočet z kreditu.

- **UI notes:**
  - Žádost je rychlá — typicky jednou denně, nemusí být přes víc obrazovek.
  - V historii je vidět: kdy, kolik minut, kolik Kč.

- **Edge cases:**
  - **Holka nemá dost kreditu** → tlačítko disabled, vysvětlení „potřebuješ alespoň 100 Kč".
  - **Admin neschválí včas** → holka čeká. Není to ideální, ale pro v1 přijatelné. V2 zvážit auto-approve.
  - **Záporný kredit** se technicky nemůže stát, protože se odečítá až při schválení.

---

### 4.8 Měsíční bonus za perfektní výsledek

- **Priorita:** Must-have

- **Description:**
  Pokud holka splní **všechny denní checky všech dnů v kalendářním měsíci** (= žádný `missed`, žádný `rejected` bez následné opravy), získá fixní bonus na konci měsíce.
  - Default: **200 Kč** (konfigurovatelné).
  - Bonus se připíše do **posledního týdenního kreditu měsíce**.

- **User flow:**
  - Žádný interaktivní flow ze strany dítěte. Aplikace průběžně počítá.
  - V `/child/today` viditelný status: „Bonus tento měsíc stále ve hře 🎯" / „Bonus tento měsíc už nedosažitelný 😞".
  - Admin vidí na konci měsíce v `/admin/payouts` řádek „Bonus za červenec: Anička 200 Kč" automaticky připočtený.

- **Data:**
  - **Read:** počet missed/rejected checků za měsíc per holka.
  - **Write:** připsání bonusu do týdenní výplaty (cron na konci měsíce).

- **UI notes:**
  - Status bonusu prominentně v dashboardu dítěte.
  - V detailu „Bonus už nedosažitelný od 12.7." (kdy zaváhala).

- **Edge cases:**
  - **Holka neměla kompetenci v některém týdnu měsíce** (rotace) → ano, bonus se počítá z dnů, kdy kompetenci měla. Holka, která má rotaci 3× týdně, má víc příležitostí pochybit, ale i víc příležitostí zabodovat. Pro v1 to neřešíme komplikovaněji.
  - **Měsíc začíná uprostřed týdne** → bonus se počítá podle kalendářního měsíce (1. – poslední), nezávisle na týdnech.

---

### 4.9 Ekonomické nastavení (admin)

- **Priorita:** Must-have

- **Description:**
  Admin může v `/admin/settings` upravit:
  - Hodinová sazba práce (default 150 Kč/h) — používaná pro výpočet hodnoty úkolů z časového odhadu.
  - Cena hodiny obrazovky (default 200 Kč/h).
  - Granularita obrazovky (default 30 min).
  - Měsíční bonus (default 200 Kč).
  - Výchozí timeout claim fronty (default 24h).
  - Výchozí timeout execute (default 3h).
  - Pořadí holek v rotaci kompetencí.
  - Výše kapesného per holka (jen evidenční — kapesné chodí mimo aplikaci).

- **Data:**
  - Globální nastavení aplikace, plus per-holka konfigurace kapesného.

- **UI notes:**
  - Jeden přehledný formulář, ne mnoho podstránek.

---

### 4.10 Profily a přihlášení

- **Priorita:** Must-have

- **Description:**
  Login screen ukazuje seznam profilů (5 lidí). Uživatel klepne na svůj profil a zadá 4místný PIN. Po přihlášení směřuje do appropriate root podle role.

- **User flow:**
  1. `/` → seznam profilů.
  2. Klepnutí na profil → modal s číselnou klávesnicí pro PIN.
  3. Po správném PINu → redirect na `/child` nebo `/admin`.
  4. Session zůstává aktivní do explicitního odhlášení (nebo dlouhého timeoutu, např. 30 dní).

- **Data:**
  - **Read:** seznam profilů (jméno, avatar/iniciála, role).
  - **Write:** PIN hash při založení/změně, session token.

- **UI notes:**
  - Velké klikatelné dlaždice s iniciálou nebo emoji, optimalizované pro mobil.
  - PIN má 4 číslice, číselná klávesnice na obrazovce.
  - Po 5 špatných pokusech → 5min lockout.

- **Edge cases:**
  - **Holka zapomene PIN** → admin v `/admin/users` resetuje (nastaví nový dočasný).
  - **Sdílené zařízení (rodinný iPad)** → každý se musí explicitně odhlásit, jinak se otevře profil posledního přihlášeného. Tlačítko „Odhlásit" výrazné.

---

### 4.11 Vizuální badge notifikace + admin e-mail digest

- **Priorita:** Must-have

- **Description:**
  Aplikace upozorňuje na položky vyžadující pozornost dvěma kanály:

  **(a) Vizuální badge** v navigaci uvnitř appky:
  - **Pro dítě:** badge u „Můj kredit" (kolik mi přibylo), badge u „Pool" (nový úkol pro mě), badge u „Mé úkoly" (zamítnutý/schválený úkol).
  - **Pro admina:** badge u „Inbox" (čekající ke schválení), badge u „Žádosti o obrazovku".

  **(b) Admin e-mail digest** (viz `DECISIONS.md` D3):
  - Když holka odešle check / nahlásí úkol / požádá o obrazovku, vznikne event v `NotificationQueue`.
  - Cron každých 15 min: pokud jsou unsent items A poslední digest šel před >10 min → pošli souhrnný e-mail na adminy přes Resend.
  - Safety-net daily digest v 20:00 Prague (i kdyby se cron job zasekl).
  - Důvod: pouze badge má provozní díru — rodič si nepamatuje appku otevřít, holka čeká, systém se opotřebí.

- **UI notes:**
  - Klasický red dot s číslem.
  - Badge zmizí po otevření dané sekce.
  - E-mail obsahuje stručný souhrn („3 čekající checky, 1 hlášený úkol") + link do `/admin/inbox`.

- **Out of scope pro v1:**
  - PWA Web Push (zvážit v M6, jako bonus nad e-mailem).
  - Push pro děti (notifikace o schválení atd.).
  - Telegram / SMS / jiné kanály.

---

## 5. Data Model

Hlavní entity v plain language. Vztahy popsané, datové typy zjednodušené.

### User
- `id`, `name`, `role` (admin / child), `pin_hash`, `avatar_color`, `rotation_order` (pouze pro děti, určuje pořadí v rotaci kompetencí), `monthly_allowance_czk` (pouze evidenční).

### Competency
- `id`, `name` (Kuchyň / Obývák / Koupelna), `description`.

### CompetencyAssignment
- Týdenní mapování kompetence → dítě.
- `id`, `competency_id`, `user_id`, `week_start_date`, `week_end_date`.

### DailyCheck
- Šablona denního checku v rámci kompetence.
- `id`, `competency_id`, `name` (např. „Ráno: prázdná myčka"), `time_of_day` (morning / evening / anytime), `order`.

### DailyCheckInstance
- Konkrétní instance pro daný den + dítě.
- `id`, `daily_check_id`, `user_id`, `date`, `status` (pending / submitted / approved / rejected / missed), `submitted_at`, `reviewed_at`, `reviewer_id`, `note`.

### Task
- Šablona extra úkolu.
- `id`, `name`, `description`, `value_czk`, `time_estimate_minutes` (volitelné), `frequency_days` (null = ad hoc, číslo = opakuje se každých N dní), `claim_timeout_hours`, `execute_timeout_hours`, `created_by` (admin id).

### TaskInstance
- Konkrétní výskyt úkolu v poolu.
- `id`, `task_id`, `created_at`, `expires_at`, `status` (available / claimed / pending_review / done / expired / rejected), `claimed_by`, `claimed_at`, `submitted_at`, `reviewed_at`, `reviewer_id`, `current_unlock_for` (kdo má aktuálně právo claim — null = všichni v poolu).

### TaskRotationLog
- Per task_id eviduje pořadí, kdo dělal naposledy.
- Pomáhá určovat, kdo je „další na řadě" pro novou instanci.

### CreditTransaction
- Záznam o pohybu kreditu.
- `id`, `user_id`, `amount_czk` (kladné = příjem, záporné = výdaj), `type` (task_reward / screen_time / monthly_bonus / payout / adjustment), `reference_id` (volitelné — odkaz na task_instance, screen_time_request, atd.), `created_at`, `note`.

### ScreenTimeRequest
- Žádost o čerpání obrazovky.
- `id`, `user_id`, `minutes`, `cost_czk`, `status` (pending / approved / rejected), `created_at`, `reviewed_at`.

### WeeklyPayout
- Souhrnný záznam o výplatě hotovosti.
- `id`, `user_id`, `week_start_date`, `week_end_date`, `total_earned_czk`, `total_screen_time_czk`, `bonus_czk` (jen v posledním týdnu měsíce), `total_payout_czk`, `paid_out_at` (null = nevyplaceno), `paid_out_by`.

### AppSettings
- Klíč-hodnota pro globální parametry (hodinová sazba, cena obrazovky, výše bonusu, timeouty, …).

### NotificationQueue
- Event log pro admin e-mail digest (viz `DECISIONS.md` D3).
- `id`, `event_type` (check_submitted / task_pending_review / screen_time_requested), `payload` (JSON s metadaty pro vyrenderování e-mailu — kdo, co), `created_at`, `sent_at` (null = čeká na odeslání).

**Vztahy:**
- User 1:N CompetencyAssignment (přes čas)
- Competency 1:N DailyCheck
- DailyCheck 1:N DailyCheckInstance
- Task 1:N TaskInstance
- User 1:N CreditTransaction
- User 1:N ScreenTimeRequest
- User 1:N WeeklyPayout

---

## 6. Technical Notes

### Stack
- **Frontend + Backend:** Next.js (App Router) na Vercelu.
- **Databáze:** Postgres přes **Supabase** (free tier) — viz `DECISIONS.md` D4.
- **ORM:** Prisma.
- **Styling:** Tailwind CSS.
- **E-mail:** Resend (free tier, 100 e-mailů/den) pro admin digest.
- **PWA:** Manifest + service worker, aby si holky mohly přidat aplikaci na home screen iPhonu.

### Auth
- Vlastní jednoduchá implementace: profile + PIN.
- PIN hashován (bcrypt nebo argon2).
- Session přes httpOnly cookie s dlouhou dobou platnosti (30 dní).
- 5 chybných pokusů → 5min lockout pro daný profil.
- Žádné externí auth služby.

### Cron joby

Spouští se přes **GitHub Actions workflow** (`.github/workflows/cron.yml`), který volá HTTPS endpointy na Vercelu (`/api/cron/*`) s autorizací přes `CRON_SECRET` header. Důvod: Vercel Hobby Cron je omezený na 2 entries × 1×/den, což pro tuhle appku nestačí. GH Actions má free tier bez těchto limitů. Detail v `DECISIONS.md` D1.

Naplánované joby:
- **Každý den 00:05 Prague:** generování `DailyCheckInstance` pro dnešní den (viz D2 — eager).
- **Každý den 23:59 Prague:** uzavření denních checků (`PENDING` → `MISSED`).
- **Každou neděli 23:55 Prague:** rotace kompetencí.
- **Každou neděli 23:59 Prague:** uzavření týdenního výpisu.
- **Každý den 06:00 Prague:** generování nových instancí opakujících se úkolů.
- **Každých 15 min:** posun rotační fronty (claim timeout) + odeslání admin e-mail digestu (pokud je co a uplynulo aspoň 10 min od posledního).
- **Poslední den měsíce 23:58 Prague:** výpočet bonusu, připsání do posledního týdenního výpisu.

Cron handler vždy nejdřív ověří `CRON_SECRET` header a kontroluje, že je teď reálně to správné okno v `Europe/Prague` (DST safety).

### Responsive
- Primární cílovka: iPhone, iPad (PWA).
- Plně responzivní, mobile-first.
- Desktop přes prohlížeč funguje, ale není primární.

### Performance
- Žádné performance specifika nečekáme. Aplikace má 5 uživatelů, několik desítek záznamů týdně. Cokoliv funguje.

### Hosting & cena
- Vercel free tier (hosting + Cron) + Neon/Supabase free tier (Postgres) = **0 Kč/měsíc**.
- Volitelná vlastní doména: ~250–500 Kč/rok.

### Bezpečnost
- HTTPS všude (Vercel default).
- PIN hashován.
- Žádná citlivá data (nejsou tam platby, jen evidence Kč jako čísla).
- Rate limiting na login endpoint.

---

## 7. Out of Scope (v1)

Explicitně **NEzahrnuto** ve verzi 1, ať se neztrácí fokus:

- ❌ **Push notifikace.** Nahrazeno vizuálním badge. Pro v2 zvážit přes PWA.
- ❌ **E-mailové notifikace.**
- ❌ **Prarodiče jako uživatelé.** Stojí mimo systém. Pro v2 případně read-only role.
- ❌ **Automatické vynucování času u obrazovky.** Aplikace pouze eviduje, vynucování je manuální (Apple Screen Time mimo appku).
- ❌ **Bonus za perfektní týden.** Pouze měsíční bonus pro v1.
- ❌ **Pause / nemoc / výlet** režim. Admin v takovém případě jednoduše neeviduje a sám zařídí, co je potřeba doma.
- ❌ **Statistiky a grafy** nad rámec týdenní/měsíční historie. Žádné koláčové grafy, žádné srovnávání mezi sourozenci.
- ❌ **Multi-tenant / víc rodin v jedné aplikaci.** Jen vaše rodina. Pro v2 možné rozšíření, datový model na to ale myslí (nemá baked-in tenant_id, ale lze přidat).
- ❌ **Fotky úkolů pro verifikaci.** Schvaluje se důvěrou + fyzickou kontrolou.
- ❌ **Undo schválení adminem.** Schválení je finální. Pro v2 přidat.
- ❌ **Auto-approve obrazovky.** Vždy přes admina. V2 zvážit limit pro auto-approve.
- ❌ **Dvoufaktorové ověřování.** PIN stačí.
- ❌ **Export dat / CSV.** Není potřeba pro v1.

---

## 8. Open Questions

Body, které **nejsou rozhodnuté** a měly by se vyjasnit buď před implementací, nebo brzy během vývoje:

1. **Konkrétní denní checky pro každou kompetenci.**
   Máme strukturu, ale ne konkrétní obsah. Je to admin task — Milan + manželka definují prvotní seznam (např. 3–5 checků na kompetenci) před spuštěním v1.

2. **Default pořadí rotace kompetencí.**
   Které dítě začíná s kterou kompetencí v prvním týdnu? Triviální, ale je to volba.

3. **Vrácený úkol — jak chytře ho přesunout v rotaci.**
   Pokud admin vrátí (rejected) úkol u Aničky, automaticky přejde k další v pořadí, nebo se vrátí do poolu jako nový s plnou rotací? Návrh: vrátit do poolu jako nový, ale Anička jde na konec pořadí pro tento úkol. Otevřené.

4. **Bonus a rotace.**
   Měsíční bonus počítá s tím, že holka má kompetenci jen v některých týdnech. Je tedy bonus férový vůči holce, která měla v měsíci 2 týdny obývák (lehké) vs. 2 týdny kuchyň (těžké)? Pro v1 ignorujeme, ale stojí za pohled po prvním měsíci provozu.

5. **Zobrazení „kolik mi uteklo".**
   Návrh: ukazujeme jako sekundární informaci („tento týden ti uteklo 150 Kč na úkolech, které vzala Emma"). Otázka — chce to Milan opravdu zobrazovat dětem, nebo je to jen pro admina?

6. **Granularita vrácení u denních checků.**
   Když admin vrátí jednu položku z 5 denních checků, blokuje to celý den (= zámek extra úkolů), nebo se počítá „aspoň X z Y"? Návrh pro v1: blokuje celý den, ale dá se opravit (re-submit). Drsné, ale jasné.

---

## 9. Implementation Roadmap (návrh)

Pro Claude Code: doporučený přírůstkový postup.

### Milestone 1 — Skeleton + Auth
- Next.js setup, Prisma, Postgres, Tailwind.
- Profily + PIN login.
- Layout admin / child.

### Milestone 2 — Kompetence + denní checky
- CRUD kompetencí a checků (admin).
- Týdenní rotace (cron).
- Plnění + schvalování (child + admin).

### Milestone 3 — Pool úkolů + claim flow
- CRUD úkolů (admin).
- Pool view (child).
- Rotační fronta + claim timer.
- Claim → execute → review.

### Milestone 4 — Kredit, výplata, obrazovky
- Kreditní transakce.
- Týdenní uzávěrka (cron).
- Hotovostní výplata (admin).
- Žádosti o obrazovku.

### Milestone 5 — Bonus + historie
- Měsíční bonus (cron).
- Historie týdnů a měsíců.
- Status „bonus ve hře".

### Milestone 6 — PWA + polish
- Manifest, service worker.
- Badge notifikace.
- UX dolaďování.

Po každém milestone: real-world test (alespoň simulovaný), pak další.

---

*PRD verze 1.0 — připraveno k handoff do Claude Code.*