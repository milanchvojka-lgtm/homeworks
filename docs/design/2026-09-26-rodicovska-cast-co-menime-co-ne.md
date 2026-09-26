# Rodičovská část — co měníme, co ne

**Datum:** 2026-09-26 · **Stav:** návrh · **Podle:** scénáře 5, 6, 7 (`2026-09-26-scenare.md`); tok varianta B (`2026-09-26-struktura-a-tok-rodic.md`)

Rozsah: admin (`app/admin/*`) předělaný pro telefon v design systému D15, se spodní navigací Schválit · Děti · Výplaty · Víc. Data jsou v příkladech ilustrační, ve framech budou skutečná data z pilotu.

## Co VZNIKÁ

### 0 · Kostra (`app/admin/layout.tsx`)
- Auth zůstává (bez session → `/`, dítě → `/child`).
- **Hlavička:** tichý bílý pruh jako u dětí: wordmark HOMEWORKS a název záložky. Horní textové záložky (`AdminTopNav`) a tlačítko Odhlásit v hlavičce odcházejí.
- **Spodní navigace:** Schválit · Děti · Výplaty · Víc, s ikonami lucide. Odznak počtu je jen na Schválit (dnešní `getAdminInboxCount`). Safe area jako u dětí.
- Po přihlášení rodiče se otevře Schválit (`/admin`, jako dnes).
- Obsah má okraje 16 px (dnes 24 px).

### 1 · Schválit (`/admin`, dnes Inbox)
- Položky seskupené podle dítěte: hlavička skupiny se jménem, barvou dítěte a počtem.
- **Řádek položky:** co (název povinnosti / úkolu / „60 min obrazovky"), pod tím kompetence nebo částka a čas nahlášení („Kuchyň · 21:04", „Úkol · 300 Kč · 14:10", „Obrazovka · 200 Kč · 19:02"). Stav se neukazuje, všechno tady čeká.
- **Akce:** „Schválit" je hlavní (jedna na řádek). „Vrátit" je vedlejší a rozbalí na místě krátké pole pro poznámku a „Vrátit" / „Zrušit". Poznámka jde dnes k povinnostem a úkolům. U obrazovky se vrací bez poznámky, protože akce poznámku nemá.
- Po vyřízení položka zmizí, počet ve skupině i odznak se sníží.
- **Prázdný stav:** „Nic nevisí" (místo dnešního „Nic ke schválení").
- **Už vyřízeno:** když akce vrátí `invalid_state` (druhý rodič to mezitím vyřídil), řádek ukáže „Už vyřízeno" a zmizí po obnovení. Dnes se ukazuje chyba.
- **Chyba:** jiná chyba = krátká hláška u řádku „Nepovedlo se, zkus to znovu".

### 2 · Děti (`/admin/deti`, nová)
- Tři řádky, jeden na dítě, v pořadí rotace: jméno a barva, **tento týden vyděláno** (`getWeekTotals`) a **dnes zbývá N povinností** (nebo „dnes hotovo"). Ťuknutím se otevře detail.

### 3 · Detail dítěte (`/admin/deti/[id]`, nová)
- Hlavička se šipkou zpět a jménem dítěte (vzor Týdenní výpis u dětí).
- **Tento týden:** vyděláno, obrazovka (Kč a minuty), k výplatě, řada (dní), měsíční bonus ve hře (Kč). Zdroje: `getWeekTotals`, `User.currentStreak`, `getBonusStatus`.
- **Hlavní tlačítko „Zapsat obrazovku"** (R5), **čeká na D19.** Otevře výběr délky po krocích granularity (30 / 60 / 90 min) s cenou a potvrzení. Po zapsání se sníží „k výplatě" a přibude obrazovka.
- **Dny týdne** (po–ne do dneška): u každého dne stav povinností jedním slovem (hotovo / čeká / vráceno / zmeškáno / zbývá). Ťuknutím na den se rozbalí povinnosti toho dne se stavem, časem nahlášení a poznámkou při vrácení (R10, dohledání).
- **„Uznat den"** u zmeškaného dne (R10), **čeká na D20.** Do rozhodnutí se ve framu kreslí jen místo, v kódu nevzniká.

### 4 · Výplaty (`/admin/vyplaty`)
- Nevyplacené týdny nahoře, pod nimi vyplacené, sbalené po týdnech.
- U dítěte v týdnu: jméno, **částka k výplatě** jako hlavní číslo, pod ní malým písmem „vyděláno − obrazovka + bonus" (dnešní data `WeeklyPayout`). Akce „Vyplaceno" (dnešní akce). Vyplacené: „Vyplaceno 28. 9." bez tlačítka.
- Ťuknutí na dítě vede do detailu dítěte. Žádný druhý souhrn týdne tady.
- Prázdný stav: „Zatím žádný uzavřený týden."

### 5 · Víc (`/admin/vic`, nová rozcestník)
- Seznam: Úkoly · Kompetence · Uživatelé · Nastavení, pod nimi Odhlásit.
- Úkoly (`/admin/ukoly`) mají nahoře „Nový úkol" (R9).
- **Formuláře Úkoly, Kompetence, Uživatelé, Nastavení:** jen přestylování do design systému a pro šířku telefonu (Input 48 px, tlačítka z `button.tsx`, karty, okraje 16 px, hlavička se šipkou zpět do Víc). Pole, validace a akce se nemění.

### 6 · Opravy v kódu bez vlivu na vzhled
- **Souběžné schválení** úkolu a obrazovky: stav se ověří a změní uvnitř transakce (podmíněný update `where status = PENDING_REVIEW / PENDING`, při 0 změněných řádcích `invalid_state`), aby se peníze nepřipsaly nebo neodečetly dvakrát. U povinností totéž kvůli jednotnému chování.
- **Odznak na Vydělat u dětí** počítá i zamčené úkoly (otevřená položka z dětské části). Opraví se ve stejném kole.

## Co NEMĚNÍME
- Datový model. D19 (obrazovka za dítě) se obejde bez změny schématu. Zapíše se jako schválený `ScreenTimeRequest` s `reviewerId` rodiče a transakcí `SCREEN_TIME`. D20 (uznání dne) se posoudí zvlášť.
- Pravidla kreditu, řady, bonusu, rotace a cronů.
- Obsah formulářů pod Víc (pole, validace, server actions).
- Dětskou část a login.
- Notifikace (e-mailový souhrn zůstává, jak je).

## Nové složené komponenty (rozhoduje Milan)
1. **BottomNav obecná:** dnešní `ChildBottomNav` se upraví tak, aby brala záložky jako parametr. Dítě i rodič tak používají jednu komponentu, žádná paralelní kopie.
2. **AppHeader s názvem:** `AppHeader` dostane variantu s názvem záložky místo pozdravu („Schválit" místo „Ahoj, Milane 👋").
3. **ApprovalRow (nová):** řádek ke schválení s akcemi Schválit / Vrátit a rozbalenou poznámkou.
4. **ChildSummaryRow (nová):** řádek dítěte na záložce Děti.
5. **DayRow (nová):** den v detailu dítěte se stavem a rozbalením povinností.
6. **Výběr délky obrazovky:** znovupoužije volbu 30 / 60 / 90 z dětské záložky Obrazovka, pokud to jde bez úprav. Když ne, nahlásím.

## Návrh v penu
| Frame | Id | Co ukazuje |
|---|---|---|
| HWR · 01 Schválit | — | 2 děti, 4 položky (povinnost, úkol, obrazovka) |
| HWR · 01b Schválit · vracení | — | rozbalená poznámka u povinnosti |
| HWR · 01c Schválit · nic nevisí | — | prázdný stav |
| HWR · 02 Děti | — | 3 řádky |
| HWR · 03 Detail dítěte | — | tento týden + dny, jeden den rozbalený |
| HWR · 03b Detail · zapsat obrazovku | — | výběr délky |
| HWR · 03c Detail · zmeškaný den | — | místo pro „Uznat den" (čeká D20) |
| HWR · 04 Výplaty | — | nevyplacený + vyplacený týden |
| HWR · 05 Víc | — | rozcestník |
| HWR · 05b Formulář úkolu | — | vzor přestylovaného formuláře |

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 5 večer doma | Schválit | schválit 1 ťuknutí; vrátit 3 kroky; obrazovka: Děti → dítě → Zapsat → délka → potvrdit | „Nic nevisí" | obrazovka čeká na D19 |
| 6 výplata | Výplaty | vidí částky → převod v bance → Vyplaceno | týden vyplacený | — |
| 7 přišla o řadu | Děti | dítě → den → vidí, co se stalo → uznat | řada zpět | uznání čeká na D20 |

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
