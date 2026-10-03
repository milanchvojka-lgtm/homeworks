# Screen time z iOS — co měníme, co ne

**Datum:** 2026-10-03 · **Stav:** návrh · **Podle:** D30; tok `2026-10-03-struktura-a-tok-screen-time.md` varianta B; pen sekce „HW · Screen time z iOS (3. 10.)“ (`QnbiT`)

## Co VZNIKÁ

### Rodič — záložka Screen time (HWS · 01B)
- **Lišta:** 5 záložek Schválit · Děti · **Screen time** (`monitor-play`) · Výplaty · Víc (`app/admin/layout.tsx`). Nová routa `app/admin/(tabs)/obrazovka/page.tsx`.
- **Zápis:** KOLIK = 2 volby **15 min · 50 Kč** / **1 h · 200 Kč** (cena z `screenTimeHourCostCzk`); KOMU = 3 dlaždice dětí v pořadí rotace (barva + iniciála, jméno, „kredit“, částka; mínus červeně); PrimaryButton „Zapsat Neli 15 min“, bez obou voleb neaktivní („Zapsat“). Nic předvybrané. Po uložení se formulář vyprázdní.
- **Tento týden:** zápisy všech dětí, poslední nahoře, řádek = „Emi · 1 h“, pod tím „So 3. 10. · 16:10“; vpravo „−200 Kč“ a u **dnešních** zápisů pod částkou červený text-button **„Zrušit“** (tap plocha 44 px). **Kdo zapsal se neukazuje** (Milan 2026-10-03). Prázdno: `EmptyState` neutral „Tento týden nic“.
- **Komponenta:** stávající `app/admin/_components/record-screen.tsx` se přepíše na formulář záložky (žádná paralelní). Řádek seznamu = `TransactionList`/řádek z `app/child/_components/transactions.tsx` rozšířený o volitelnou akci (pen `TransactionRow`).

### Dítě — záložka Screen time (HWS · 03, 03b, 03c)
- `app/child/(tabs)/obrazovka/page.tsx`: TENTO TÝDEN = seznam zápisů („Screen time 15 min“, „So 3. 10. · 18:20“, „−50 Kč“) + poznámka „O čas si řekneš v iPhonu. Tady vidíš, kolik tě stál.“
- V mínusu: upozornění `bg-danger-soft` „Jsi v mínusu“ + „Dluh se odečte z nedělní výplaty. Co nestačí, přejde do dalšího týdne.“ Částka jen v dlaždici hlavičky (červeně).
- Prázdno: `EmptyState` neutral `monitor-play` „Tento týden nic“.

### Server
- `recordScreenTimeAction(userId, minutes)`: minuty jen **15 | 60**, **bez kontroly kreditu**; push dítěti neutrálně „Zapsáno 15 min screen time, −50 Kč“ (kdo zapsal se neřeší). Chyba pushe zápis neshodí.
- Nová `cancelScreenTimeAction(requestId)`: jen admin, jen zápis z **dneška** (Praha) a jen z **běžícího týdne, který nemá uzávěrku**; smaže `CreditTransaction` i zápis (status `REJECTED`, aby zůstala stopa), push dítěti „Zápis 15 min zrušen, +50 Kč zpět“.
- **Dluh:** `WeeklyPayout` dostane sloupec **`debtInCzk Int @default(0)`** (≤ 0, dluh přenesený z minulého týdne; `db push`, TD3). `weekly-close`: `debtIn = min(0, předchozí týden earned − screen + bonus + debtIn)`, `payout = max(0, net + debtIn)`. Čisté funkce v `lib/credit-pure.ts` + testy.
- **Zobrazení k výplatě** (dlaždice hlavičky dítěte, výpis, detail dítěte): `earned − screen + bonus + dluh` — **smí být záporné**, záporné červeně. Ve výpisu a ve Výplatách řádek **„Dluh z minulého týdne −150 Kč“**, jen když je.

## Co ODCHÁZÍ
- Dětská žádost: `_screen-picker.tsx`, `requestScreenTimeAction`, karty „Čeká na rodiče“ / „zamítl“.
- Schvalování žádostí: položka `screen` v `approval-list.tsx` a v `(tabs)/page.tsx`, `approve/rejectScreenTimeAction`, počet v `lib/badges.ts`, `SCREEN_TIME_REQUESTED` v `lib/notifications.ts` a push rodičům.
- Zápis v detailu dítěte (D19, `RecordScreen` v `deti/[id]`).
- Pole granularity v Nastavení (`_settings-form.tsx`, `actions/settings.ts`); sloupec `screenTimeMinGranularity` zůstává v DB nepoužitý (bez destruktivní migrace).
- Rozpracované `PENDING` žádosti v ostrých datech: při nasazení zamítnout bez odpočtu (jednorázový příkaz, spustím po tvém OK).

## Co NEMĚNÍME
- Model `ScreenTimeRequest` (zápis = `APPROVED` řádek jako dnes), typ transakce `SCREEN_TIME`, cena za hodinu a její nastavení.
- Výplata v hotovosti (`payouts.ts`), trofeje, bonus, řada, crony mimo `weekly-close`.
- Ostatní obrazovky rodiče i dítěte.

## Nové složené komponenty (rozhoduje Milan)
- Žádná nová: formulář = přepsaná `RecordScreen`, dlaždice dítěte je její součást, řádek = rozšířený `TransactionRow`.

## Návrh v penu
| Frame | Id | Co ukazuje |
|---|---|---|
| HWS · 01B | `YPjD7` | rodič, záložka: vybráno Neli 15 min, seznam se „Zrušit“ u dnešního |
| HWS · 03 | `D8rp0T` | dítě, zápisy tento týden |
| HWS · 03b | `Au7y5` | dítě v mínusu |
| HWS · 03c | `t0DcY2` | dítě, tento týden nic |
| HWS · 01A, 02A, 02Ab | — | varianta A, zamítnuto 3. 10. |

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| Neli dojde čas, žádá v iOS | push z iOS rodiči | schválí v iOS → appka → Screen time → 15 min → Neli → Zapsat | Neli push „−50 Kč“, zápis v seznamu | — |
| Omyl: zapsáno Emi místo Neli | seznam Tento týden | Zrušit u Emi → zapsat Neli | Emi push „+200 Kč zpět“, Neli push | zrušit jde jen dnes |
| Emi nemá kredit | kredit 0 | zápis 1 h projde | dlaždice −200 Kč, upozornění; v neděli výplata 0, dluh do dalšího týdne | — |
| Scénář 5 (večer schvaluje) | Schválit | už bez položek screen time | — | — |

## Odpovědi
- 2026-10-03: kdo zapsal pryč (seznam i push), „Zrušit“ jako text pod částkou, ne tlačítko vedle.

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká“ a „Co odchází“. Cokoli mimo seznam se zastaví a zeptá. Sahá na peníze → `npm test` + `npm run test:sim` (nová postava s dluhem přes dva týdny) před nasazením.
