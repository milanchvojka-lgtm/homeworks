# Rodič udělá povinnost nebo úkol sám — co měníme, co ne

**Datum:** 2026-10-04 · **Stav:** návrh · **Podle:** scénáře `2026-10-04-scenare-rodic-udela-sam.md` 1–3; tok `2026-10-04-struktura-a-tok-rodic-udela-sam.md` 1A + 2A; text „Hotovo (Milan)“ (Milan 2026-10-04); D31

## Co VZNIKÁ

### 1 · Povinnost v detailu dítěte (tok 1A)
- `DayRow` (`app/admin/_components/day-row.tsx`): **dnešek je rozbalený rovnou** (ostatní dny jako dnes, ručně).
- U dnešní povinnosti ve stavu k splnění nebo vráceno (`PENDING`, `REJECTED`) vpravo místo čipu **„Udělám já“** (`Button` `variant="outline"` `size="sm"`).
- Klepnutí → pod řádkem text „{Jméno} se to započítá jako splněné.“ a dvě tlačítka **Zrušit** / **Ano, hotovo** (vzor „Uznat den“). Chyba: „Nepovedlo se, zkus to znovu.“ / „Už to mezitím nahlásila.“ (když stav mezitím není `PENDING`/`REJECTED`).
- Po potvrzení řádek: čip Hotovo, podtitul **„hotovo (Milan)“**.
- Server action `doCheckForChildAction(instanceId)` (`app/actions/checks.ts`): jen admin, jen dnešní instance ve stavu `PENDING`/`REJECTED` (podmíněný update proti souběhu) → `APPROVED`, `reviewerId` = rodič, `reviewedAt`, `note` = značka „udělal rodič“ (konstanta, stejný vzor jako „Uznáno zpětně“). Bez push.
- `child-days.ts`: meta „hotovo ({rodič})“ pro tuto značku; příznak „dá se udělat za dítě“ jen u dneška.

### 2 · Dítě vidí „Hotovo (Milan)“
- `CheckCard`: schválená povinnost se značkou → stav posuvníku **„Hotovo (Milan)“** (zelený jako schváleno), vpravo nahoře nic (jméno by bylo dvakrát).
- Postup na Dnes (`DayProgress`) ji počítá jako hotovou (už dnes, je `APPROVED`).

### 3 · Úkoly: sekce „Teď visí“ (tok 2A)
- `/admin/ukoly`: nad „Nový úkol“ sekce **„TEĎ VISÍ“** — řádek na každou instanci ve stavu `AVAILABLE` nebo `CLAIMED`: název, částka, stav („v nabídce“ / „má Emi“), vpravo „Udělám já“ → v řádku „Nikdo za něj nedostane peníze.“ + **Zrušit** / **Ano, hotovo**. Bez instancí se sekce neukazuje.
- Server action `doTaskForChildAction(instanceId)` (`app/actions/tasks.ts`): jen admin, jen `AVAILABLE`/`CLAIMED` (podmíněný update) → `DONE`, `reviewerId`, `reviewedAt`, **`claimedById` = null** (úkol nepatří dítěti, ve Vydělat se neukáže jako schválený s částkou), bez `CreditTransaction`, bez záznamu v rotaci úkolů. Opakovaný úkol: další instanci založí `recurring-tasks` po `frequencyDays` jako po dokončení (beze změny cronu).
- Když byl `CLAIMED`: push dítěti **„Úkol {název} je hotový“ · „Dodělal ho rodič, odměna se nepřipíše.“** (`lib/reminders-pure.ts`, tag `task`, odkaz `/child/vydelat`). Chyba pushe neshodí akci.

### 4 · Simulace (D22)
- Jeden den: Ani nahlásí jen myčku, Milan označí linku a stůl → řada Ani se nepřeruší, bonus beze změny.
- Jeden den: Teri označí Půdičku z nabídky → žádná odměna, další instance za `frequencyDays`.
- Jednou: Emi má rozdělaný úkol, Milan ho označí → push Emi, žádná odměna.
- Testy textu pushe v `reminders`.

## Co NEMĚNÍME
- Datový model (značka v `note`, žádné nové pole).
- Nahlášené povinnosti a úkoly (`SUBMITTED`, `PENDING_REVIEW`) — ty rodič normálně schválí v Schválit.
- Vrácený úkol (`REJECTED`) — je ukončený, nikdo ho nedrží.
- Starší dny (zpětně jen „Uznat den“, D20), Schválit, Děti, šablony úkolů a jejich formulář.
- Žádný „zpět“ po potvrzení.

## Nové složené komponenty (rozhoduje Milan)
- Žádná. Řádek „Teď visí“ se skládá z existujících prvků (karta řádku jako v seznamu úkolů, `Button` outline sm). Potvrzení v řádku je stejný vzor jako „Uznat den“.

## Návrh v penu
Skládá se z existujících prvků, navrhuju bez kreslení předem: po implementaci dorovnám pen (`DayRow · rozbalený` se stavem „Udělám já“, seznam Úkoly). Kdybys chtěl nejdřív vidět skicu, řekni „kresli“.

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 1 Táta a kuchyň | Děti → Ani | dnešek rozbalený → Udělám já ×2 → Ano ×2 | Ani má Hotovo (Milan), řada v pořádku | — |
| 2 Máma a Půdička | Víc → Úkoly | Teď visí → Udělám já → Ano | z nabídky zmizí, nikdo nic nedostal | — |
| 3 Táta a Eminy okna | Víc → Úkoly | „má Emi“ → Udělám já → Ano | Emi push, úkol jí zmizí | — |

## Ověření
`npm test`, `npm run test:sim`, typecheck, lint; dev server na 390 px jako rodič (detail dítěte, Úkoly) a dítě (Dnes, Vydělat).

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
