# Připomínky a upozornění — co měníme, co ne

**Datum:** 2026-09-29 · **Stav:** schváleno 2026-09-29 (Milan: „Smlouva OK“), pen schválen 2026-09-29 (Milan: „sedí“, texty zkrátil v penu): **přepínač B tmavá** · **Podle:** scénáře 11, 12, 13; tok `2026-09-29-struktura-a-tok-pripominky.md` varianta A; D25, D28

## Co VZNIKÁ

**1. Uvítání: nový krok „Připomínky“** (`/uvitani/pripominky`, jen dítě, jen při prvním spuštění)
- Kdy: po nastavení vlastního PINu (`setOwnPinAction` vede sem místo na `/child`). Když dítě dočasný PIN nemá, vede sem dokončení uvítání.
- Obsah: kostra `WelcomeStep` (růžová outline ikona `Bell`, jedna věta, jedno tlačítko), bez spodní lišty.
  - nadpis „Připomenu ti to“
  - věta „Když ti večer něco zbývá, připomenu ti to. Ať nepřijdeš o řadu.“
  - hlavní tlačítko **„Zapnout připomínky“** → iOS se zeptá → po povolení zkušební upozornění a přechod na Dnes
  - pod ním textové „Teď ne“ → Dnes
- Stavy: odmítnuto v iOS → věta „Zapneš je v Nastavení → Oznámení → Homeworks.“ a tlačítko „Pokračovat“; nejde (otevřeno v Safari, ne z plochy) → krok se přeskočí rovnou na Dnes.
- Krok se ukáže jen jednou: po něm už uvítání nevede (příznak dokončení uvítání se nemění, stačí pořadí přesměrování).

**2. Já: řádek „Připomínky“** (dítě) a **3. Víc: řádek „Upozornění“** (rodič)
- Jedna složená komponenta pro oba, v seznamu řádků (jako Změnit PIN / položky Víc): ikona `Bell`, název, pod ním stav, vpravo přepínač.
- Stavy (texty podle penu, Milan je zkrátil): „Zapnuté“ (přepínač zapnutý) · dítě „Vypnuté · zapni je, ať nepřijdeš o řadu“, rodič „Vypnuté“ (vypnutý) · „Nenastavené. Zapni v Nastavení → Oznámení → Homeworks.“ (bez přepínače) · „Fungují jen v appce z plochy“ (bez přepínače).
- Zapnutí: iOS povolení → zkušební upozornění. Vypnutí: bez dotazu, hned.
- V Já pod přepínačem Vzhled, ve Víc nad řádkem Přihlášený / Odhlásit.

**4. Děti: stav připomínek u dítěte** (rodič)
- V řádku dítěte (ChildSummaryRow) pod dnešním stavem tlumeně „připomínky vypnuté“, **jen když dítě nemá žádné aktivní zařízení**. Když připomínky fungují, nic.

**5. Pryč:** dočasný řádek „Připomínky (test)“ (`app/_components/push-switch-temp.tsx`) z Víc a Já.

## Co NEMĚNÍME

- Logika připomínek, časy, texty upozornění (schválené v toku §6), cron, e-mail, service worker, číslo na ikoně.
- Datový model (stav se čte z `PushSubscription.disabledAt`).
- Stávající kroky uvítání (4 obrazovky) a PIN, jen kam vede konec.
- Ostatní obrazovky, spodní navigace.

## Nové složené komponenty (rozhoduje Milan)

1. **SettingRow se přepínačem** (řádek Připomínky / Upozornění): nová. V knihovně penu přepínač nebyl; **v kódu už je** `components/ui/switch.tsx` (shadcn nad `@base-ui/react/switch`, nikde nepoužitý, 32×18 px, zapnuto `bg-primary`). Upraví se na velikost iOS 51×31 (dotyková plocha 44 px) a barvu podle Milanovy volby v penu: **A růžová** (`bg-highlight`, aktivní stav podle D15) nebo **B tmavá** (`bg-primary`). Řádek složit v `app/_components/`.
2. Krok uvítání znovupoužije `WelcomeStep`, žádná nová komponenta.

## Návrh v penu

| Frame | Id | Co ukazuje |
|---|---|---|
| Sekce „HW · Připomínky (29. 9.) · tok varianta A“ | `w5EXSk` | celé kolo |
| HWP · 01 | `HMapd` | uvítání · Připomínky: zvonek, „Připomenu ti to“, ukázka připomínky, Zapnout připomínky / Teď ne |
| HWP · 01b | `WvTMY` | odmítnuto v iOS: „Připomínky jsou vypnuté“, kde to zapnout, Pokračovat |
| HWP · 02A | `xpItA` | Já · řádek Připomínky zapnuté, **přepínač A růžová** |
| HWP · 02B | `hts3k` | Já · totéž, **přepínač B tmavá** |
| HWP · 02c | `cP420` | Já · vypnuté |
| HWP · 02d | `Xg2Hj` | Já · zablokované (bez přepínače) |
| HWP · 03 | `lPCxA` | Víc · řádek Upozornění (rodič) |
| HWP · 04 | `bwq2d` | Děti · „připomínky vypnuté“ u Neli |
| Knihovna · řada „Připomínky“ | `AMVC4` | Switch · zapnuto A `hbm8c` / B `G1YNr` / vypnuto `IzeJW`, SettingRow `yUJE3`; ChildSummaryRow dostal skrytý řádek „připomínky vypnuté“ `a8Lr37` |

## Průchod scénáři

| Scénář | Začátek | Kroky | Konec | Díry |
|---|---|---|---|---|
| 11 + 12 ① dítě u stolu zapne připomínky | uvítání po PINu | Zapnout připomínky → Povolit | Dnes, přišlo „Připomínky zapnuté“ | — |
| 12 dítě omylem odmítne | krok uvítání | Zapnout → Nepovolit → vidí, kde to zapnout | Dnes; v Já „Zablokované…“ | zapnout musí v iOS samo nebo s rodičem |
| 12 ③–⑤ večer přijde připomínka | zamčená obrazovka | ťukne | Dnes | — (hotovo v kódu) |
| 13 ① rodič zapne upozornění | Víc | přepínač → Povolit | zkušební upozornění | — |
| 13 rodič zjistí, že dítě připomínky nemá | Děti | vidí „připomínky vypnuté“ | zapne mu je v Já na jeho telefonu | — |

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká“. Cokoli mimo seznam se zastaví a zeptá.
