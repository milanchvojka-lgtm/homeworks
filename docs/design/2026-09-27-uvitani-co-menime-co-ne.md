# První spuštění dítěte (uvítání) — co měníme, co ne

**Datum:** 2026-09-27 · **Stav:** schváleno 2026-09-27 (Milan: „kresli“), implementováno 2026-09-28 · **Podle:** scénář 11; tok varianta A (`2026-09-27-struktura-a-tok-uvitani.md`); D25

## Co VZNIKÁ

### 1 · Průvodce `/uvitani` (nová stránka mimo `/child`, bez spodní lišty)
- Dítě s `onboardedAt = null` přesměruje `app/child/layout.tsx` sem (místo Dnes). Rodič sem nepřijde.
- 4 kroky na jedné stránce (klientské přepínání, bez nového URL), nahoře tečky postupu 1–4 a **„Přeskočit“**, dole jedno hlavní tlačítko **„Další“**, na posledním kroku **„Jdeme na to“**:
  1. **Tvoje kompetence** — ikona sun, „Tenhle týden máš **Kuchyň**.“ + „Každý den ji dáš do pořádku a přejedeš, že je hotovo.“ (název kompetence ze skutečného přiřazení; bez přiřazení „Kompetenci ti rodiče přidělí.“)
  2. **Vydělat navíc** — ikona list-checks, „Když máš povinnosti hotové, bereš si placené úkoly.“ + jeden skutečný úkol z nabídky s odměnou („Umýt okna · 300 Kč“), bez nabídky jen text.
  3. **Screen time, nebo peníze** — ikona monitor-play, „Za vydělané si koupíš screen time, nebo ti to v neděli vyplatíme.“
  4. **Řada a bonus** — ikona flame, „Když nic nevynecháš, roste ti řada a měsíční bonus.“ + „První týden je na zkoušku, nic neztratíš.“ + zvýrazněné **„100 Kč do začátku“** (částka z `AppSettings.welcomeBonusCzk`).
- „Jdeme na to“ i „Přeskočit“ zavolají `completeWelcomeAction`: nastaví `onboardedAt`, `trialEndsOn` (+6 dní), připíše `WELCOME_BONUS` (jednou) a pošle dítě na PIN (je-li dočasný), jinak na Dnes.

### 2 · Nastav si PIN `/uvitani/pin` (povinné)
- Dokud `pinIsTemporary = true`, `app/child/layout.tsx` pošle dítě sem. Bez přeskočení.
- Nadpis „Nastav si vlastní PIN“, věta „Aby se za tebe nikdo nepřihlásil.“, dvě pole PIN (nový, znovu), hlavní tlačítko „Uložit PIN“.
- Pravidla: 4 číslice, obě pole stejná, ne „0000“ ani dosavadní PIN. Hlášky: „PIN musí mít 4 číslice.“ · „PINy se neshodují.“ · „Vyber si jiný PIN než 0000.“
- Po uložení `pinIsTemporary = false` → Dnes.
- Znovupoužije logiku `changePinAction` (bez starého PINu, dítě je přihlášené dočasným).

### 3 · Dnes (beze změny rozvržení)
- Po uvítání přijde dítě na Dnes k první povinnosti (existující karta s posuvníkem). Žádná cvičná karta.

### 4 · Dlaždice Řada během zkoušky (návrh k odsouhlasení)
- Po dobu `trialEndsOn ≥ dnes` má dlaždice Řada místo „Bonus +200 Kč“ text **„Zkouška do Ne 4. 10.“**. Po zkoušce zpět bonus.

### 5 · Výpis Za co
- Vstupní bonus jako řádek „Vstupní bonus · +100 Kč“.

### 6 · Logika (D25, bez vlivu na vzhled)
- Prisma: `User.onboardedAt`, `User.pinIsTemporary`, `User.trialEndsOn`, `AppSettings.welcomeBonusCzk` (100), `TransactionType.WELCOME_BONUS`.
- `resetPinAction` nastaví `pinIsTemporary = true`. Nastavení: pole „Vstupní bonus (Kč)“.
- Zkouška: `closePastDays` + `withStreakResync` berou neúspěšný den ve zkoušce jako přeskočený; `countMissedDays` ho do bonusu nepočítá.
- `weekly-close` počítá `WELCOME_BONUS` do bonusu výplaty.
- Simulace (D22): nové dítě s uvítáním, bonusem, zkouškou (zmeškaný den ve zkoušce nic nesebere) a povinným PINem.

### 7 · Vzhled kroků (Milan 2026-09-28, po iteracích A–G v penu)
- Ikona kroku: **velká (56 px) lucide outline v růžové (`text-highlight`), bez kruhu na pozadí**.
- Vstupní bonus: **bílá karta s rámečkem**, číslo „+100 Kč“ růžově. Žádné světle růžové plochy.

## Co NEMĚNÍME
- Rozvržení Dnes, Vydělat, Screen time, Já. Rodičovská část (kromě pole v Nastavení a resetu PINu).
- Přihlašovací obrazovku.

## Nové složené komponenty (rozhoduje Milan)
1. **WelcomeStep** — krok průvodce (ikona v kruhu, nadpis, jedna věta, volitelná ukázka).
2. **Stránka PIN** — z existujících Input + PrimaryButton.

## Návrh v penu

Sekce „HW · Uvítání (27. 9.) · tok varianta A“ (`r2uBbz`). Knihovna: WelcomeStep `NuSRU` (řada Úkoly a stavy dne, slot „Ukázka“ pro úkol / vstupní bonus).

| Frame | Id | Co ukazuje |
|---|---|---|
| HWU · 01 Krok 1 | `X81vUg` | Tvoje kompetence (Kuchyň) |
| HWU · 02 Krok 2 | `qt9yw` | Vydělat navíc (Umýt okna 300 Kč) |
| HWU · 03 Krok 3 | `S3RW8` | Screen time, nebo peníze |
| HWU · 04 Krok 4 | `W29f75` | Řada a bonus, zkouška, 100 Kč |
| HWU · 05 PIN | `o9Q111` | Nastav si vlastní PIN |
| HWU · 06 Dnes ve zkoušce | `x4sxF` | dlaždice Řada „Zkouška do Ne 4. 10.“, první povinnost |

## Průchod scénářem 11
| Začátek | Kroky | Konec | Díry |
|---|---|---|---|
| přihlášení dočasným PINem | 4× Další (nebo Přeskočit) → PIN 2× → Dnes → přejede první povinnost → rodič schválí | vlastní PIN, 100 Kč, zkouška běží | — |

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
