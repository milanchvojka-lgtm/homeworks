# Dnes: úkoly během dne · Týdenní výpis: za co — co měníme, co ne

**Datum:** 2026-09-27 · **Stav:** návrh · **Podle:** scénáře 2 (odpoledne, „kolik mám vyděláno“), 3 (vydělat navíc: vezme → udělá → nahlásí → čeká na schválení a připsání), 6 (holky si kontrolují výpis); Milan po vyzkoušení 27. 9.

## Co je dnes (kód)

- **Dnes** (`app/child/(tabs)/page.tsx`) ukazuje úkol z nabídky jen ve stavu `CLAIMED` (sekce „Rozdělaný úkol“ s odpočtem). Po nahlášení (`PENDING_REVIEW`) z Dnes zmizí a je vidět jen ve Vydělat → Moje úkoly. Schválený (`DONE`) úkol není vidět nikde kromě peněz v hlavičce.
- **Týdenní výpis** (`app/child/vypis/page.tsx`) má jen součty: vyděláno, screen time, k výplatě. Za co dítě peníze dostalo a za co utratilo, vidět není. Data jsou v `CreditTransaction` (typ, částka, `referenceId` na úkol nebo žádost o screen time).

## Co VZNIKÁ

### A · Dnes: úkoly, které dítě dnes vzalo, zůstávají do konce dne
- Sekce „Rozdělaný úkol“ se přejmenuje na **„Dnešní úkoly“** a ukazuje úkoly, které dítě dnes vzalo (`claimedAt` dnes), plus starší, které pořád běží nebo čekají:
  - **rozdělaný** (`CLAIMED`): jako dnes, odpočet a „Hotovo“,
  - **čeká na schválení** (`PENDING_REVIEW`): jako ve Vydělat, čip ČEKÁ,
  - **vrácený** (`REJECTED`): čip VRÁCENO + poznámka rodiče,
  - **schválený dnes** (`DONE`): nový stav karty, čip SCHVÁLENO a „+300 Kč“.
- Pořadí: rozdělaný, vrácený, čeká, schválený.
- Když dítě dnes žádný úkol nemá, sekce se neukazuje (jako dnes).
- Ve Vydělat se nic nemění. „Moje úkoly“ tam dál ukazují rozdělané, čekající a vrácené.

### B · Týdenní výpis: seznam „Za co“
- Pod kartou Tento týden nový seznam **„ZA CO“**: jeden řádek na transakci tohoto týdne, nejnovější nahoře.
  - úkol: „Umýt okna“ · den · **+300 Kč**
  - screen time: „Screen time 60 min“ · den · **−200 Kč**
  - měsíční bonus, trofej: název · den · **+150 Kč**
  - ruční úprava rodiče: „Úprava kreditu“ · den · **+300 Kč**
- Výplata (`PAYOUT`) v seznamu není, výplata je vidět u předchozích týdnů.
- Prázdný stav: „Tento týden zatím nic.“
- Předchozí týdny zůstávají jako dnes (jen součet a stav výplaty).

## Co NEMĚNÍME
- Datový model, server actions, pravidla schvalování a kreditu.
- Vydělat, Screen time, Já, rodičovskou část.
- Součty na kartě Tento týden.

## Nové složené komponenty (rozhoduje Milan)
1. **TaskCard · schváleno** — nový stav existující karty úkolu (ne nová komponenta).
2. **TransactionRow** — řádek seznamu Za co (název, den, částka).

## Návrh v penu
| Frame | Id | Co ukazuje |
|---|---|---|
| HW2 · 01 Dnes s úkoly | — | povinnosti hotové, Dnešní úkoly: čeká + schválený |
| HW2 · 05 Týdenní výpis s Za co | — | karta Tento týden + 4 řádky Za co |

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 3 vydělat navíc | Vydělat | vezme → Dnes: rozdělaný → Hotovo → Dnes: čeká → po schválení Dnes: schváleno +300 Kč | vidí připsané peníze | — |
| 2 / 6 kolik mám a za co | hlavička (dlaždice) → Týdenní výpis | součty + Za co | ví, za co dostala a utratila | — |

## Otevřené otázky
1. Zůstává schválený úkol na Dnes do konce dne (navrhuji), nebo jen do dalšího otevření appky?
2. Má „Za co“ být i u předchozích týdnů (rozbalením týdne), nebo stačí tento týden?
3. Ruční úprava kreditu se nepočítá do „vyděláno“. V seznamu ji ukázat (navrhuji, ať sedí kredit), nebo schovat?

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
