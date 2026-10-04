# Denní rotace, detail povinnosti, postup, role v upozornění a v Dětech — co měníme, co ne

**Datum:** 2026-10-04 · **Stav:** návrh · **Podle:** scénáře `2026-10-04-scenare-denni-rotace.md` 1–4; tok `2026-10-04-struktura-a-tok-denni-rotace.md` 1A + 2A; pen HWD · 01A, 02B; D32, D33

## Co VZNIKÁ

### 1 · Rotace po dnech (D32)
- Schéma: `CompetencyAssignment` dostane `date` (den, Europe/Prague) místo `weekStart`/`weekEnd`, unikát `(userId, date)`. Staré týdenní řádky se při přechodu smažou (historie výplat, řady a povinností na nich nezávisí, instance povinností nesou `dailyCheckId` a `date`).
- `rotation-pure`: `computeDayIndex(date)` od stejného epochu (round kvůli DST jako u týdne), `rotateAssignments` beze změny (dostane index dne). Testy: tři po sobě jdoucí dny = každá holka projde všemi třemi rolemi, přechod přes změnu času.
- `lib/rotation.ts`: `assignCompetenciesForDay(date)` (idempotentní), `getCurrentAssignment(userId, date)` podle dne.
- `openDay` (`lib/day-open.ts`) přiřazuje běžící den místo týdne.
- `weekly-rotation`: endpoint `app/api/cron/weekly-rotation/` a jeho řádky v `cron.yml` (rozvrh i `case`) pryč. `seed.ts` přiřazuje den. Simulace (`tests/simulation/month.sim.ts`) přestane volat `weekly-rotation`.
- Nepřítomnost (D24) beze změny v kódu: holce, která je pryč, se instance nevytvoří, role je ten den neobsloužená.

### 2 · Detail povinnosti (D33, pen HWD · 01A)
- Schéma: `DailyCheck.description String?`.
- Administrace kompetence (`app/admin/kompetence/[id]/_competency-editor.tsx`): u povinnosti pole „Co to znamená“ (víceřádkové, volitelné) při přidání i úpravě; server actions `createDailyCheckAction` / úprava povinnosti ho uloží.
- `CheckCard` (`app/child/_components/check-card.tsx`): pod názvem šedý řádek (sans 15, `text-muted-foreground`, řádkování 1,35), jen když popis existuje. Ve všech stavech karty.

### 3 · Dnes: role a postup (pen HWD · 02B)
- Řádek sekce: vlevo „DNES: {ROLE}“ (místo „KOMPETENCE: …“), vpravo „{n} Z {m} HOTOVO“, `text-muted-foreground`, stejný mono styl.
- Pod ním pruh: jeden úsek na povinnost, výška 6, mezera 4, zaoblení 3, v pořadí karet. Barva podle stavu: čeká `bg-warning` (amber), schváleno `bg-success`, k splnění a vráceno `bg-muted`. Hotovo = `SUBMITTED` nebo `APPROVED`.
- Extra úkoly se do postupu nepočítají.
- Prázdný stav „Tento týden nemáš přiřazenou povinnost.“ → „Dnes nemáš přiřazenou povinnost.“

### 4 · Dnes a Vydělat: kde žijí úkoly (tok, varianta 2)
- Dnes, „Dnešní úkoly“: jen `CLAIMED` (s odpočtem) a `REJECTED`. `PENDING_REVIEW` a dnešní `DONE` z Dnes odchází.
- Vydělat → Moje úkoly: k `CLAIMED`, `PENDING_REVIEW`, `REJECTED` přibudou **dnes schválené `DONE`** (karta SCHVÁLENO + částka, komponenta už existuje), aby schválený úkol nezmizel ze všech míst.
- Badge Vydělat beze změny.

### 5 · Upozornění s dnešní rolí (tok 1A)
- Nová připomínka ve `pickReminder` (`lib/reminders-pure.ts`): **od 14:00** (každý den, i o víkendu), jednou denně (klíč `role` v `ReminderLog`), jen když dítě má dnes nenahlášené povinnosti.
- Text: titulek „Dnes máš {Role}“, tělo „Do 17:00.“ (když má některá povinnost `dueTime`, nejdřívější) nebo „Do večera.“
- Okno končí, kde začíná další připomínka (D28 pravidlo): když už je čas na „Blíží se termín“, role se neposílá zvlášť.
- Testy v `reminders-pure`.

### 6 · Rodič, Děti: role v řádku dítěte (tok 2A)
- Podtitulek `ChildSummaryRow` (`app/admin/(tabs)/deti/page.tsx`): „{Role} · zbývají 2 z 3“ / „{Role} · hotovo“ / „dnes pryč“ (D24).
- Pod řádky dětí, když je role ten den bez holky: řádek textu „{Role} · dnes nikdo ({jméno} pryč)“, `text-subtle`, nad poznámkou o částce.

### 7 · Texty
- Uvítání (`app/uvitani/_welcome-flow.tsx`): „Tenhle týden máš {X}“ → „Dnes máš {X}“, a v textu kroku věta, že se role mění každý den.
- Administrace kompetencí (`app/admin/kompetence/page.tsx`): „Tento týden je přiřazené dle rotace.“ → „Role se střídají každý den podle pořadí dětí.“

### 8 · Obsah (provede se v ostré DB po nasazení, s Milanovým OK)
- Kompetence Obývák · Prádlo a koupelna · Kuchyň a stůl s povinnostmi a popisy podle katalogu (`docs/2026-10-04-katalog-ukolu.md`), kuchyň `dueTime` 17:00. Staré kompetence pryč.

## Co NEMĚNÍME
- Týdenní uzávěrka, výplata (D23), kredit, dluh (D30), řada, měsíční bonus, trofeje.
- Pravidla schvalování, vracení a odemčení nabídky (`daily_checks_pending`).
- Ostatní připomínky (16:00 termín, 19:30, 21:30) a push rodičům.
- Rodičovské záložky kromě Děti; detail dítěte.
- `CompetencyAssignment` pro rodiče neexistuje, kola kuchyně rodičů appka nezná.
- Výměna rolí mezi holkami, náhled na zítřek, rozpis dopředu (scénáře: neděláme).

## Nové složené komponenty (rozhoduje Milan)
- **Pruh postupu** (`DayProgress`, `app/child/_components/day-progress.tsx`) — jen na Dnes. V penu se doplní do knihovny jako komponenta.

## Návrh v penu
| Frame | Id | Co ukazuje |
|---|---|---|
| HWD · 01A | `xhC5j` | detail pod názvem (schváleno) |
| HWD · 02B | `AUTuJ` | řádek role + počet + pruh (schváleno) |
| HWD · 01B, 01B2, 02A | `Jkgnd`, `qy6pQ`, `Vd24q` | zamítnuto 2026-10-04 |

Upozornění a řádek v Dětech jsou jen textové změny existujících prvků, frame se nekreslí (podle potřeby po implementaci dorovnám pen HWR · 02).

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 1 Dítě zjistí roli | push ve 14:00 | otevře Dnes → „DNES: KUCHYŇ A STŮL · 0 Z 3“ | ví roli a termín | — |
| 2 Kuchyň po škole | Dnes | detail pod názvem → posuvník ×3 → pruh plný | 3 Z 3, pruh žlutý → zelený | — |
| 3 Máma v 16:40 | Děti | řádek „Kuchyň a stůl · zbývají 2 z 3“ u Ani | ví, koho zavolat | — |
| 4 Holka pryč | nepřítomnost (D24) | Děti: „Kuchyň a stůl · dnes nikdo (Ani pryč)“ | ví, že kuchyň je na ní/něm | — |

## Ověření
`npm test`, `npm run test:sim`, typecheck, lint; dev server na 390 px jako dítě (Dnes, Vydělat) a rodič (Děti, administrace kompetence); po změně schématu `prisma generate` + restart serveru.

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
