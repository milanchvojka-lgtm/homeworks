# Dětská část (varianta B): co měníme, co ne

**Datum:** 2026-09-26 · **Stav:** návrh, čeká na Milana · **Podle:** scénáře 1–4 (`2026-09-26-scenare.md`), tok varianta B + §5 (`2026-09-26-struktura-a-tok.md`), brief `2026-09-26-design-system-mobil.md`

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

## Návrh v penu

Sekce „HW · Redesign · návrh 1 (2026-09-26) · tok varianta B". Framy 390 px, skutečná data z pilotu (Test, Myčka, Kuchyň připravená na ráno, Půdička 75 Kč · ~30 min, Umýt okna 300 Kč · ~120 min, Umýt auto 450 Kč · ~180 min).

| Frame | Co ukazuje |
|---|---|
| HW1 · 01 | Dnes: zbývá povinnost, řádek ve hře |
| HW1 · 01b | Dnes: vrácená povinnost s poznámkou nahoře |
| HW1 · 01c | Dnes: rozdělaný úkol s odpočtem |
| HW1 · 01d | Dnes: hotovo na dnešek |
| HW1 · 02 | Vydělat: nabídka + zamčený úkol s důvodem |
| HW1 · 02b | Vydělat: moje rozdělané a čekající nahoře |
| HW1 · 03 | Obrazovka: na kolik mám, volba, požádat |
| HW1 · 03b | Obrazovka: žádost čeká |
| HW1 · 04 | Já |
| HW1 · 05 | Týdenní výpis |

Nové složené komponenty se nejdřív přidají do „HW · Knihovna", obrazovky z nich vzniknou jako instance.

---

## Průchod scénáři

*(vyplní se nad framy před schválením návrhu)*

| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 1 · večer kuchyň na ráno | | | | |
| 2 · odpoledne | | | | |
| 3 · vydělat navíc | | | | |
| 4 · obrazovka | | | | |

---

## Pravidlo

Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
