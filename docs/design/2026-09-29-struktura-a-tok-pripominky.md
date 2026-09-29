# Struktura a tok: zapnutí připomínek a upozornění (D28)

**Datum:** 2026-09-29 · **Stav:** schváleno 2026-09-29: **varianta A**, stav v Děti jen když připomínky nejsou zapnuté, texty obecné s počtem · **Podle:** scénáře 12 a 13 (`2026-09-26-scenare.md`), scénář 11 (první spuštění), D25 (uvítání), D28

Bez obrazovek a bez vzhledu. Kreslit se začne až po „kresli“. Nahrazuje dočasný řádek „Připomínky (test)“ z brány 9.0.

## 1 · Potřeby

| # | Potřeba | Scénář |
|---|---|---|
| P1 | dítě zapne připomínky samo, vlastním ťuknutím, a ví proč („abys nepřišla o řadu“) | 12 ① |
| P2 | zapnout to u stolu při prvním spuštění, s rodičem vedle | 11, 12 |
| P3 | vidět, jestli připomínky chodí, a když ne, vědět, kde je zapnout (odmítnuto v iOS, otevřeno v Safari místo z plochy) | 12 |
| P4 | připomínky dát vypnout (dítě, které je nechce, je jinak vypne v iOS a rodič to nepozná) | 12 |
| R1 | rodič zapne upozornění jednou a pak na to nemyslí | 13 ① |
| R2 | rodič ví, u kterého dítěte se na připomínky nedá spolehnout | 13, tech lead 2c |

**Co se přetahuje:** povolení musí dítě pochopit a ťuknout (iOS) vs. „návod nečte, klikne na první tlačítko“ (scénář 11). Jedna věta proč, jedno tlačítko, žádný odstavec.

**Stavy povolení** (platí pro obě varianty): zapnuto · vypnuto (ještě neřešeno, nebo vypnul sám) · zablokováno v iOS (odmítl, zapnout jde jen v Nastavení → Oznámení → Homeworks) · nejde (appka otevřená v Safari, ne z plochy, nebo starý iOS).

---

## 2 · Varianta A: krok v uvítání + řádek v Já

Po nastavení vlastního PINu (D25) přijde **ještě jedna obrazovka uvítání**: „Připomenu ti, když ti něco zbývá. Ať nepřijdeš o řadu.“ Jedno tlačítko **„Zapnout připomínky“** (iOS se hned zeptá, dítě ťukne Povolit), pod ním „Teď ne“. Pak Dnes.

V **Já** trvale řádek **Připomínky** se stavem (zapnuté / vypnuté / zablokované v Nastavení) a přepínačem. U „zablokované“ jedna věta, kde to zapnout.

**Tok dítěte:** ① … uvítání, PIN (jako dnes) ② „Zapnout připomínky“ → Povolit ③ Dnes. **+2 ťuknutí.**
**Silné:** u stolu to projdou všechny holky naráz a rodič vidí, že to zapnuly. Dnes zůstane čistá. **Slabé:** o obrazovku delší uvítání; kdo dá „Teď ne“, musí si to najít v Já.

## 3 · Varianta B: karta na Dnes + řádek v Já

Uvítání se nemění. Na **Dnes** nahoře karta **„Zapni si připomínky, ať nepřijdeš o řadu“** s tlačítkem. Karta zmizí po zapnutí nebo po „Teď ne“ (vrátí se, když připomínky přestanou fungovat, např. zablokované). Řádek v Já jako ve variantě A.

**Tok dítěte:** ① uvítání, PIN ② Dnes: karta → Zapnout → Povolit. **+2 ťuknutí.**
**Silné:** připomene se i tomu, kdo to u stolu přeskočil nebo komu to odumřelo. **Slabé:** na Dnes přibývá věc nad povinnostmi (dnes tam je PovinnostiBanner a Máš volno); karta, která se vrací, může otravovat.

## 4 · Společné (obě varianty)

- **Rodič (R1):** ve **Víc** řádek **Upozornění** se stavem a přepínačem, stejná komponenta jako řádek v Já. Rodič nemá uvítání, takže jen tady (a postup v LAUNCH_CHECKLIST §6).
- **Po zapnutí** přijde zkušební upozornění „Připomínky zapnuté“ (jako v testu), ať je hned vidět, že to funguje.
- **Stav u dětí pro rodiče (R2, otevřené):** v **Děti** u každého dítěte drobně „připomínky vypnuté“, jen když nejsou zapnuté (nic, když fungují). Dnes to nese jen večerní e-mail. Navrhuji ano, řádek dítěte (ChildSummaryRow) dostane jednu tlumenou větu.
- **Texty upozornění** (jsou v kódu, schvaluje se ve smlouvě): „Zbývá ti Linka prázdná“ / „…do 17:00. Přejeď to v appce, ať nepřijdeš o řadu.“ · „Ještě ti něco zbývá“ · „Poslední šance na dnešek“ / „…O půlnoci to propadne.“ · „Vrácené: Koupelna“ / „„drobky pod stolem“ Oprav to a pošli znovu.“ · rodiči „Neli: Koupelna“ / „Odeslaná povinnost. Ke schválení: 2“.
- Dočasný řádek „Připomínky (test)“ z Víc a Já zmizí.

## 5 · Otázky na Milana

1. **Varianta A, nebo B?** Doporučuji **A**: spuštění je naživo u stolu (D25), takže to zapnou všechny najednou pod dohledem a Dnes zůstane čistá. Kdo to přeskočí, na toho upozorní večerní e-mail („nemá zapnuté připomínky“) a rodič mu to zapne v Já.
2. **Stav u dětí v Děti (R2):** ano, jen když připomínky nejsou zapnuté?
3. **Texty upozornění** výše: sedí tón?

## 6 · Rozhodnutí (Milan 2026-09-29)

1. **Varianta A** (krok v uvítání po PINu + řádek v Já, rodič řádek ve Víc).
2. **Stav v Děti:** „připomínky vypnuté“ jen když nejsou zapnuté, jinak nic.
3. **Texty obecné:** žádné názvy povinností, poznámky rodiče ani jména dětí, jen počet (Milan: „nepoužíval bych konkrétní věci“; počet ponechán kvůli shodě s číslem na ikoně, Milan OK). Zapracováno v `lib/reminders-pure.ts`:
   - „Blíží se termín“ / „Do 17:00 ti zbývá 1 povinnost. Odškrtni to, ať nepřijdeš o řadu.“
   - „Ještě ti něco zbývá“ / „Zbývají ti 2 povinnosti. Odškrtni to do půlnoci, ať nepřijdeš o řadu.“
   - „Poslední šance na dnešek“ / „Zbývá ti 1 povinnost. O půlnoci to propadne.“
   - „Povinnost ti byla vrácená“ / „Podívej se, co opravit, a pošli ji znovu.“
   - rodiči „Máš co schvalovat“ / „Ke schválení: 2“

Pokračuje se smlouvou `2026-09-29-pripominky-co-menime-co-ne.md`.
