# Nepřítomnost — co měníme, co ne

**Datum:** 2026-09-27 · **Stav:** návrh · **Podle:** scénáře 8–10; tok varianta B (`2026-09-27-struktura-a-tok-nepritomnost.md`); D24

## Co VZNIKÁ

### 1 · Víc → Nepřítomnost (`/admin/nepritomnost`, nová podstránka)
- Hlavička se šipkou zpět do Víc (`AdminSubpage`), položka **„Nepřítomnost“** v seznamu Víc (ikona lucide `plane`, podtitul „kdo je kdy pryč“ nebo „Neli do 10. 10.“, když někdo pryč je).
- Nahoře hlavní tlačítko **„Přidat nepřítomnost“**.
- **Seznam probíhajících a nadcházejících** (seřazeno podle začátku): řádek = kdo („Neli“, „Všichni“), kdy („4.–10. 10.“), poznámka („tábor“), stav (PROBÍHÁ / neutrální bez štítku u nadcházející). Akce na řádku: nadcházející **„Zrušit“**, probíhající **„Ukončit“** (smaže dnešek a dál, D24).
- Proběhlé nepřítomnosti se nezobrazují.
- Prázdný stav: „Nikdo není pryč. Tábor, dovolenou nebo nemoc zadáš tady.“

### 2 · Formulář „Přidat nepřítomnost“ (panel zdola, jako Zapsat screen time)
- **Kdo:** přepínací štítky dětí (Ani, Emi, Neli) + „Všichni“. Aspoň jedno dítě.
- **Od, Do:** dvě pole data (nativní výběr data na iPhonu, styl `Input`). Výchozí od = dnes, do = od.
- **Poznámka** (volitelná): „tábor“, „chalupa“, „nemoc“.
- **Uložit** (hlavní) / **Zrušit**.
- Hlášky: „Od může být nejdřív pondělí tohoto týdne.“ · „Do musí být stejně nebo později než od.“ · „Vyber aspoň jedno dítě.“
- Po uložení se panel zavře, seznam se obnoví.

### 3 · Detail dítěte (`/admin/deti/[id]`)
- Pod kartou Tento týden řádek **„Pryč 4.–10. 10. · tábor“**, když je nepřítomnost probíhající nebo nadcházející (jen zobrazení, odkaz na Víc → Nepřítomnost).
- **Dny týdne:** den nepřítomnosti má neutrální čip **PRYČ**; rozbalení ukáže, co dítě ten den stihlo (SUBMITTED/APPROVED), jinak nic.

### 4 · Dítě, Dnes
- V den nepřítomnosti místo povinností karta **„Máš volno do So 10. 10.“** + poznámka. Dnešní úkoly (když nějaké má) zůstávají pod ní.

### 5 · Logika (D24, bez vlivu na vzhled)
- Model `Absence`, akce `createAbsenceAction`, `endAbsenceAction`, úpravy `daily-rollover`, `claim-timeout`, `recurring-tasks`, `buildRotationQueue`, sdílený přepočet řady (z D20).
- Simulace (D22): tábor Neli 5.–11. 10., celá rodina 23.–25. 10., nemoc Emi zadaná zpětně.

## Co NEMĚNÍME
- Schválit, Výplaty, Děti (seznam), ostatní záložky dítěte.
- Pravidla kreditu, výplat, bonusu (bonus se změní sám, protože dny pryč nemají instance).
- Rotace kompetencí.

## Nové složené komponenty (rozhoduje Milan)
1. **AbsenceRow** — řádek seznamu nepřítomností.
2. **Panel Přidat nepřítomnost** — skládá se z existujících (Input, štítky jako výběr 30/60/90, tlačítka).
3. **Karta „Máš volno“** — nová karta na Dnes.
4. **StateChip · neutral „PRYČ“** — existující komponenta, nový text.

## Návrh v penu
| Frame | Id | Co ukazuje |
|---|---|---|
| HWN · 01 Nepřítomnost | — | seznam: Neli tábor (probíhá), Všichni chalupa (nadcházející) |
| HWN · 01b Přidat nepřítomnost | — | panel, vybraná Neli, od–do, poznámka |
| HWN · 02 Detail dítěte | — | řádek Pryč + dny týdne s PRYČ |
| HWN · 03 Dnes dítěte | — | karta Máš volno |

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 8 tábor | Víc | Nepřítomnost → Přidat → Neli, od–do, „tábor“ → Uložit | v seznamu „Neli · 4.–10. 10.“ | — |
| 9 rodina pryč | Víc | Nepřítomnost → Přidat → Všichni, od–do → Uložit | „Všichni · 23.–25. 10.“ | — |
| 10 nemoc | Víc | Nepřítomnost → Přidat → Emi, od = pondělí → Uložit | řada a bonus přepočítané | — |

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
