# Dětská část (varianta B): co měníme, co ne

**Datum:** 2026-09-26 · **Stav:** schváleno 2026-09-26 (smlouva i šest nových komponent), Milan: „kresli" · **Podle:** scénáře 1–4 (`2026-09-26-scenare.md`), tok varianta B + §5 (`2026-09-26-struktura-a-tok.md`), brief `2026-09-26-design-system-mobil.md`

Jedna smlouva pro celou dětskou část, po obrazovkách. Podklad je dnešní kód (`app/child/*`, `app/_components/*`, `components/streak/*`).

---

## Co VZNIKÁ

### K · Kostra (layout dítěte)

- **Spodní lišta se 4 záložkami:** Dnes (`/child`) · Vydělat (`/child/vydelat`) · Obrazovka (`/child/obrazovka`) · Já (`/child/ja`). Lucide ikony (sun, list-checks, monitor-play, user), popisek 12 px, aktivní má růžovou čárku nad ikonou. Odznak počtu (CountBadge) u Vydělat = úkoly, které teď můžu vzít, plus moje rozdělané (dnešní `getChildPoolCount` + `getChildMyTasksCount`). Výška 56 px nad safe area.
- **Pruh s penězi** nahoře na všech čtyřech záložkách: „Tento týden **{k výplatě} Kč** · odehráno {minuty obrazovky tento týden}". Data: `getWeekTotals`, `getAppSettings`. Ťuknutí otevře Týdenní výpis (V). Jediné místo na záložkách, kde žije kredit a odehraný čas; výpis je jejich rozpad.
- **Hlavička:** H1 s názvem záložky + avatar vpravo (odkaz do Já). Pryč jsou textová tlačítka Nastavení a Odhlásit.

### D · Dnes (`/child`)

Pořadí shora:
1. **Vrácené** (jen když existují): Callout s levým červeným proužkem, název povinnosti nebo úkolu, poznámka rodiče („na lince zůstal hrnek"), akce „Nahlásit znovu" (`submitCheckAction`, u úkolu podle dnešního chování).
2. **Povinnosti:** nadpis sekce = kompetence týdne („MYČKA · TENTO TÝDEN"). Řádky dnešních checků: název, u nesplněného ťuknutí na celý řádek = splnit (`submitCheckAction`, optimistický stav jako dnes), u ostatních StateChip (čeká / schváleno / zmeškáno). Nesplněné nahoře, pak čekající a schválené.
3. **Rozdělaný úkol** (jen když je `CLAIMED`): název, odměna, odpočet do termínu, akce „Hotovo" (`reportTaskDoneAction`).
4. **Hotovo na dnešek:** když nic nesplněného ani vráceného nezbývá, místo seznamu povinností jedna zpráva („Na dnešek máš hotovo") a pod ní sbalený seznam toho, co čeká nebo je schválené.
5. **Řádek ve hře:** „Řada **N dní** · bonus **X Kč**", ťuknutí vede do Já. Data: `currentStreak`, `getBonusStatus`.
- **Prázdný stav:** dítě nemá tento týden kompetenci: „Tento týden nemáš přiřazenou povinnost." (text jako dnes).
- **Chyba** při splnění: hláška u řádku, stav se vrátí (jako dnes v `today-checks`).

### E · Vydělat (`/child/vydelat`)

Spojuje dnešní `/child/pool` a `/child/me-ukoly`.
1. **Moje úkoly** (jen když nějaké jsou): rozdělané s odpočtem a akcí „Hotovo", čekající na schválení (StateChip čeká), vrácené s poznámkou.
2. **Nabídka:** řádky úkolů s **odměnou a odhadem času vedle sebe** (300 Kč · ~120 min), akce „Vzít" (`claimTaskAction`).
3. **Zamčené úkoly** se důvodem místo akce: „Nejdřív dokonči dnešní povinnosti", „Teď je na řadě sestra, tvůj bude {čas}" (texty dnes existují v `pool-sections`). Sekce „Brzy dostupné" a „Otevřeno všem / pro tebe" se sloučí do jednoho seznamu s tímhle důvodem.
- **Prázdný stav:** „Teď tu není nic k vydělání."
- **Chyba** při vzetí („Někdo to vzal dřív"): hláška u řádku jako dnes.

### O · Obrazovka (`/child/obrazovka`)

1. **Na kolik máš:** velké číslo v minutách („1 h 30 min") spočítané z aktuálního kreditu a ceny, pod tím malým písmem v Kč.
2. **Požádat:** volba 30 / 60 / 90 min s cenou, jedno hlavní tlačítko „Požádat" (`requestScreenTimeAction`). Nedostupné volby zašedlé s důvodem „potřebuješ aspoň 100 Kč".
3. **Stav žádosti:** čekající žádost (StateChip čeká) místo formuláře, dokud ji rodič nevyřídí.
- Odehraný čas tento týden tu není, žije v pruhu (žádná informace dvakrát).
- **Chyba:** hlášky z dnešního `screen-time-requester`.

### J · Já (`/child/ja`)

1. **Řada:** číslo, rekord, další trofej, měsíční bonus a jeho stav (obsah dnešního `StreakBanner`, jen tady).
2. **Odkazy:** Trofeje (`/child/trofeje`), Historie řady (`/child/streak`). Obě podstránky zůstávají, jen s novou kostrou.
3. **Účet:** Změnit PIN (dnešní `/child/nastaveni`), Odhlásit (`logoutAction`).

### V · Týdenní výpis (`/child/vypis`, otevírá se z pruhu)

Spojuje dnešní `/child/kredit` (část Tento týden) a `/child/historie`.
1. **Tento týden:** vyděláno, obrazovka, k výplatě.
2. **Předchozí týdny:** seznam s částkou a stavem (vyplaceno / čeká na výplatu).
- Zpět na předchozí záložku šipkou v hlavičce.

---

## Změny po iteracích v penu (2026-09-26, Milan)

> **Úklid penu 26. 9.:** sekce návrh 1 a iterace 2–4 a jejich komponenty jsou smazané (historie v gitu `f8599b7`). Platný vzor je sekce „HW · Redesign · návrh 2 (26. 9.) · schválený vzor" (`Lu7MG`) a knihovna `Dluso`, aktuální id komponent jsou ve skillu `design-to-code` §6. Id framů a komponent v tabulce „Návrh v penu" níže patří smazanému návrhu 1.

Iterace 2–5 v penu (sekce `u7Xdg`, `D0oFH`, `GKM6d`, `Lu7MG`) mění část „Co vzniká" takto. Platí přednostně před textem výše.

- **Stavová hlavička místo pruhu s penězi, nadpisu obrazovky a řádku ve hře** (frame `HW1 · 01A4`, komponenta `StatusHeader v2 · dlaždice` `hkONr`): pod stavovým řádkem iOS dvě dlaždice „Tento týden 380 Kč · odehráno 1 h" (→ týdenní výpis) a „Řada 12 dní · bonus 200 Kč" (→ Já). Bez avataru, jména, data a nadpisu záložky (ten opakoval spodní lištu). Hlavička je na všech čtyřech záložkách.
- **Řádek povinnosti E** (komponenty `W5oLN` k splnění, `zYhYo` termín blízko, `FAYbR` čeká, `ajGhI` schváleno; frame `HW1 · 01A6`): karta s monospace nadpisem „DO 23:59" / „DO 17:00" a zbývajícím časem vpravo („zbývá 3 h 12 min", pod 1 h amber), velký název bez času, posuvník „Přejeď, až bude hotovo". Čeká = posuvník v amber + „odesláno 16:52", schváleno = zelený + „schválil Milan". Nahrazuje CheckRow.
- **Nadpis sekce povinností:** „KOMPETENCE: {název}".
- **Tmavý režim** podle telefonu (D17), frame `HW1 · 01A6 · dark`.
- **Termín povinnosti (D18, schváleno 2026-09-26):** nové volitelné pole `DailyCheck.dueTime` + pole „Termín" v adminu kompetencí. **Výjimka z „Co neměníme"** (datový model a admin kompetencí) schválená Milanem.
- **D1 rozhodnuto (Milan):** úkol z poolu jde vzít až po všech dnešních povinnostech včetně večerní. Pravidlo zůstává.
- **D3 rozhodnuto (Milan):** po zamítnutí žádosti o obrazovku krátká hláška na záložce Obrazovka („Rodič žádost zamítl"). Potřebuje přečíst poslední vyřízenou žádost, akce se nemění.
- **D2 (Milan: „to tam chceme"):** stav Vydělat, když povinnosti nejsou odeslané = karta „Nejdřív povinnosti" nahoře (ikona zámku, postup „1 ze 2 hotovo", co zbývá, tlačítko „Dokončit na Dnes") a pod ní utlumené karty úkolů se zámkem; důvod se u úkolů neopakuje. Frame `HW1 · 02c2`, komponenty `PovinnostiBanner` `b9xTML`, `TaskCard · nabídka` `M9gF8J`, `TaskCard · zamčeno` `ZE6Iw` (karta úkolu ve stylu karty povinnosti: čas nahoře, název + odměna, „Vzít úkol" přes celou šířku). Frame `HW1 · 02-2` = odemčená nabídka. `02c` je historie.

## Co NEMĚNÍME

- **Datový model, Prisma schéma, migrace.**
- **Serverové akce** (`app/actions/*`) a jejich chování, včetně pravidla „úkol jde vzít až po dnešních povinnostech", rotační fronty, timeoutů a optimistických stavů.
- **Cron, výpočty kreditu, bonusu a streaku** (`lib/*`).
- **Přihlášení** (login screen, PIN) a **celý admin** (`app/admin/*`).
- **Obsah podstránek Trofeje a Historie řady:** mění se jen kostra (hlavička, lišta, pruh), ne jejich obsah.
- **Texty hlášek a chyb**, které dnes existují, pokud výše není uvedeno jinak.
- **Tokeny a primitivy** z kroku 8.1.

**Routy, které odcházejí** (nahradí je nové, přesměrování netřeba, PWA otevírá `/`): `/child/pool`, `/child/me-ukoly` → `/child/vydelat`; `/child/kredit`, `/child/historie` → `/child/vypis` + `/child/obrazovka`; `/child/nastaveni` → obsah do `/child/ja`.

---

## Nové složené komponenty (rozhoduje Milan)

Každá existuje v jednom souboru a v knihovně v penu. Znovupoužité místo duplikátů (design-to-code §6):

| Komponenta | Kde se používá | Z čeho vzniká | Soubor |
|---|---|---|---|
| **BottomNav** (4 záložky) | kostra | přepis `child-bottom-nav.tsx` | `app/_components/child-bottom-nav.tsx` |
| **MoneyBar** (pruh s penězi) | kostra, 4 záložky | nová | `app/child/_components/money-bar.tsx` |
| **CheckRow** (řádek povinnosti) | Dnes | vytažená z `today-checks.tsx` | `app/child/_components/check-row.tsx` |
| **TaskRow** (řádek úkolu, stavy: nabídka / zamčeno / rozdělaný s odpočtem / čeká / vráceno) | Dnes, Vydělat | sloučí řádky z `pool-sections` a `my-tasks-list` | `app/child/_components/task-row.tsx` |
| **Callout** (vrácené, s poznámkou) | Dnes, Vydělat | z briefu §5, zatím neexistuje | `components/ui/callout.tsx` |
| **DayDone** (hotovo na dnešek) | Dnes | nová | `app/child/_components/day-done.tsx` |

`StreakBanner` se nepřepisuje, jen se přesune z Dnes do Já.

---

## Návrh v penu (návrh 2, schválený vzor — Milan schválil 2026-09-26, jde se na kód)

Sekce „HW · Redesign · návrh 2 (26. 9.) · schválený vzor" (`Lu7MG`). Framy 390 px, data z pilotu, čísla konzistentní a ilustrativní (vyděláno 580 Kč, screen time 200 Kč = 1 h, k výplatě 380 Kč, zbývá 1 h 30 min obrazovky, řada 12 dní, bonus 200 Kč). Id komponent jsou ve skillu `design-to-code` §6.

| Frame | Co ukazuje |
|---|---|
| HW1 · 01A6 | Dnes večer: kuchyň na ráno k splnění (DO 23:59, zbývá 3 h 12 min), linka čeká |
| HW1 · 01A6b | Dnes odpoledne: termín 17:00 se blíží (amber), kuchyň na ráno až večer |
| HW1 · 01A6 · dark | 01A6 v tmavém režimu (D17) |
| HW1 · 01b | Dnes: vrácená povinnost s poznámkou rodiče, posuvník „Přejeď, až to napravíš" |
| HW1 · 01c | Dnes: obě povinnosti čekají, rozdělaná Půdička s odpočtem |
| HW1 · 01d | Dnes: „Na dnešek máš hotovo", povinnosti sbalené |
| HW1 · 02c2 | Vydělat: povinnosti neodeslané, karta „Nejdřív povinnosti", úkoly utlumené |
| HW1 · 02-2 | Vydělat: nabídka odemčená |
| HW1 · 02b | Vydělat: moje úkoly (rozdělaný, čeká) nahoře, nabídka pod nimi |
| HW1 · 03 | Obrazovka: můžeš si zahrát 1 h 30 min, volba 30/60/90, požádat |
| HW1 · 03b | Obrazovka: žádost čeká na rodiče |
| HW1 · 03c | Obrazovka: rodič žádost zamítl (D3), volba zpět |
| HW1 · 04 | Já: další trofej, měsíční bonus, trofeje, historie řady, PIN, odhlásit |
| HW1 · 05 | Týdenní výpis: tento týden + předchozí týdny, hlavička se šipkou zpět |

## Průchod scénáři (návrh 2)

| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 1 · večer kuchyň na ráno | 01A6 | přejede posuvník u „Kuchyň připravená na ráno" | 01d „Na dnešek máš hotovo" | žádné |
| 2 · odpoledne | 01b | přečte poznámku → napraví → přejede „Přejeď, až to napravíš" → přejede odpolední povinnost; peníze a řada v hlavičce | 01A6 / 01d | žádné |
| 3 · vydělat navíc | 02c2 → Dnes → 02-2 | (když povinnosti neodeslané: „Dokončit na Dnes") → porovná čas a odměnu → „Vzít úkol" → rozdělaný v 02b i 01c → přejede „hotovo" → čeká | 02b | žádné (D1 = pravidlo zůstává) |
| 4 · obrazovka | 03 | vybere 60 min → „Požádat o 60 min" → 03b čeká → schváleno (méně minut, víc screen time v hlavičce) / zamítnuto 03c | 03b / 03c | žádné |

Kontrola „žádná informace dvakrát" (26. 9.): na Já odstraněno „12 / 14 dní" (opakovalo řadu z hlavičky); výpis nemá dlaždice (opakoval by 380 Kč).

## Pravidlo

Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
