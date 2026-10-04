---
name: design-to-code
description: Použij VŽDY, když jde o návrh nebo úpravu rozhraní Homeworks — obrazovky dítěte i admina, komponenty, barvy, typografie, rozestupy, tlačítka, navigace, stavy checků a úkolů — nebo když Milan zmíní pen / pen.dev / .pen soubor / frame. Platí i na drobné vizuální úpravy. Řídí postup scénáře → tok → smlouva rozsahu → pen → kód (DECISIONS D16) a drží pen a kód v souladu bez driftu.
---

# Implementace designu (Homeworks)

Vlastní kopie skillu `design-to-code` z 2FRESH (`2f-product`), upravená pro Homeworks: rodinná PWA na iPhonu, Next.js + Tailwind 4 + shadcn/ui přebarvené 2FRESH design systémem (D15). S originálem se nesynchronizuje.

**Na začátku každé práce na rozhraní tenhle skill nahlas použij** („používám design-to-code") a veď postup skrz něj.

## 0 · Zlaté pravidlo: nejdřív rozsah, pak teprve kreslení a kód

Postup (D16), každý krok schvaluje Milan, kroky se nepřeskakují:

1. **Kontextové scénáře** — `docs/design/RRRR-MM-DD-scenare.md` (skill `kontextove-scenare`). Bez scénářů se nová obrazovka ani tok nekreslí; když chybí, řekni to.
2. **Struktura a tok bez obrazovek** — `docs/design/RRRR-MM-DD-struktura-a-tok.md`: potřeby ze scénářů, co se přetahuje, tok jako číslované kroky „co člověk dělá a co vidí", **ve dvou variantách**.
3. **Smlouva rozsahu** — `docs/design/RRRR-MM-DD-<obrazovka>-co-menime-co-ne.md` (šablona níže), grounded v reálném kódu.
4. **Pen** — až po Milanově výslovném „kresli". Framy se skutečnými daty, stavy, průchod scénáři.
5. **Kód** → ověření v běžící appce proti framu → dorovnání penu.

Schválený text scénářů není schválený tok a souhlas s opravou toku není pokyn ke kreslení. Když při práci narazíš na něco mimo smlouvu, **nech to být a zeptej se**; rozšíření rozsahu dopiš do smlouvy.

Drobné opravy (text, barva, bug) scénáře ani tok nepotřebují — stačí krátká smlouva nebo věta v chatu, co se mění a co ne.

### Šablona smlouvy rozsahu

```markdown
# <Obrazovka / tok> — co měníme, co ne

**Datum:** RRRR-MM-DD · **Stav:** návrh / schváleno RRRR-MM-DD · **Podle:** scénáře X, Y; tok varianta Z

## Co VZNIKÁ
(per krok toku: pole, akce, hlášky, prázdný stav, chyba, konkrétní komponenty)

## Co NEMĚNÍME
(datový model, server actions, jiné obrazovky, …)

## Nové složené komponenty (rozhoduje Milan)

## Návrh v penu
| Frame | Id | Co ukazuje |

## Průchod scénáři
| Scénář | Začátek | Kroky | Konec | Díry |

## Pravidlo
Implementuje se přesně to, co je v části „Co vzniká". Cokoli mimo seznam se zastaví a zeptá.
```

## 1 · Explorační skica ≠ pravda

Pen skica je **zdroj nápadu, ne předloha k obtažení.** Skládej věrně podle **skutečné aplikace + design systému**. Když se smlouva a předloha rozcházejí, řekni rozpor nahlas předem a nech Milana rozhodnout.

## 2 · Zdroj pravdy: kód vyhrává u postaveného

- Co je postavené v kódu, řídí kód; pen se dorovná (dělá to Claude Code).
- Pen vyhrává jen tam, kde se něco teprve navrhuje.
- Rozpor mezi kódem, penem a briefem **nahlas Milanovi, neopravuj potají.**

## 3 · Postup při změně

1. **Čti návrh ze zdroje, ne ze screenshotu.** Pencil MCP `execute` → `Get(frameId)`; hodnoty (padding, gap, fontSize, fill) ber z dat.
2. **Zařaď změnu na nejnižší úroveň:** token (`app/globals.css`, propíše se všude) → komponenta (`components/ui/*` nebo složená komponenta, propíše se do všech použití) → složení obrazovky. Nikdy nestyluj na stránce to, co patří do komponenty.
3. **U větší změny pošli plán složení** (které komponenty, pořadí, co odchází, co je nové). Nová komponenta je Milanovo rozhodnutí; znovupoužití má přednost. Odchylku od rozhraní, na které jsou lidé zvyklí (iOS konvence, spodní navigace), nahlas jako rozhodnutí.
4. **Frame plň skutečnými daty z pilotu** v reálném počtu a délce (skutečné názvy checků, úkolů, částky, jména), ne vymyšlenými ukázkami.
5. **Implementuj** podle map §6.
6. **Ověř v běžící appce** na šířce iPhonu (390 px): dev server, přihlášení jako dítě / admin, screenshot cílové obrazovky proti framu. Zkontroluj i stavy (prázdno, čeká na schválení, vráceno, chyba).
7. **Dorovnej pen (§4).**

## 4 · Pen a kód drží krok

Změny přes pencil MCP žijí v běžící aplikaci pen.dev; **před commitem ověř, že se `_design/homeworks.pen` na disku změnil** (`git status` M, dnešní čas v `stat`), jinak nejdřív uložit v pen.dev. Commit nepopisuj obsahem, který nebyl vidět v `git diff --stat`. Když změníš token nebo komponentu v kódu, propiš to do knihovny v penu; když to nejde hned, napiš to Milanovi jako otevřenou položku.

**Pojmenování v penu:** sekce na každé kolo návrhu („HW · Redesign · návrh 1 (RRRR-MM-DD) · tok varianta A"), framy `HW1 · 01`, `01b` (stav), `02A/02B` (varianty), podvarianty `02A2…` mění jen jednu věc. Štítek varianty je vidět přímo ve framu. Zamítnuté návrhy zůstávají vedle s označením „zamítnuto RRRR-MM-DD". Nové komponenty patří do knihovny, ne do sekce obrazovek.

## 5 · Co nedělat

- Nezaváděj barvy, fonty, radiusy ani rozestupy mimo tokeny a škálu. Žádný hex ani `oklch` mimo `app/globals.css`. Na netokenovou hodnotu se zastav a nahlas ji.
- Nesahej na datový model, server actions, auth ani cron kvůli vzhledu.
- Nerozhoduj o designu sám. Nejasnost v návrhu je otázka pro Milana.
- **Žádná informace na obrazovce dvakrát.** Před odesláním framu nebo snímku ke schválení vypiš každou informaci na obrazovce (stav, počet, částka, jméno, čas, streak) a u každé jedno místo, kde žije. Když má dvě, jedno zruš. Výjimka jen záměrná redundance pro přístupnost (barva + text u stavu), i tu nahlas.
- **Jedno hlavní tlačítko na sekci.** Růžová jen pro aktivní stav a zvýraznění čísla, ne jako druhé hlavní tlačítko.
- Když se něco ukáže jako slepá ulička, zapiš ponaučení do `DECISIONS.md` (rozhodnutí) nebo do dokumentu v `docs/design/` týž den.

## 6 · Mapa Homeworks

**Soubory:** tokeny `app/globals.css`; písmo `app/layout.tsx` (IBM Plex Sans `--font-plex-sans`, IBM Plex Mono `--font-plex-mono`); shadcn komponenty `components/ui/*`; streak komponenty `components/streak/*`; obrazovky `app/child/*`, `app/admin/*`, jejich složené komponenty v `app/child/_components`, `app/_components`; pen `_design/homeworks.pen`; design dokumenty `docs/design/`.

**Mapa tokenů** (zdroj `--hw-*` → alias → Tailwind třída; **v kódu piš Tailwind třídu, ne `--hw-*`**):

| Zdroj | Hex | Alias / Tailwind | Použití |
|---|---|---|---|
| `--hw-paper` | `#F4F3F0` | `bg-background` | pozadí stránky |
| `--hw-card` | `#FFFFFF` | `bg-card`, `bg-popover` | karty, dialogy |
| `--hw-hair` | `#EEECE7` | `bg-muted`, `bg-secondary` | jemné plochy, neutrální chip |
| `--hw-rule` | `#DFDDD7` | `border-border`, `border-input` | obrysy, linky |
| `--hw-ink` | `#17191E` | `text-foreground`, `bg-primary` | text, nadpisy, hlavní tlačítko |
| `--hw-ink-60` | `#5B5F68` | `text-muted-foreground` | sekundární text |
| `--hw-ink-35` | `#A6AAB4` | `text-subtle` | tlumené labely, kickery, placeholder |
| `--hw-pink` | `#FF77AA` | `text-highlight`, `bg-highlight`, `ring` | aktivní stav, zvýrazněné číslo (streak, kredit) |
| `--hw-pink-bg` | `#FFEEF5` | `bg-accent`, `bg-highlight-soft` | hover, aktivní chip |
| `--hw-amber` / `-bg` | `#B97F0F` / `#FBF6EA` | `text-warning` / `bg-warning-soft` | čeká na schválení |
| `--hw-green` / `-bg` | `#1B7A45` / `#E3F1E8` | `text-success` / `bg-success-soft` | schváleno, hotovo |
| `--hw-red` / `-bg` | `#C2453B` / `#F1E4E3` | `text-destructive` / `bg-danger-soft` | vráceno, zmeškáno, chyba |
| `--hw-blue` / `-bg` | `#2E5FA8` / `#E9F0FA` | `text-info` / `bg-info-soft` | informace |

Stavy checků a úkolů: `PENDING` bez barvy, `SUBMITTED`/`PENDING_REVIEW` warning, `APPROVED`/`DONE` success, `REJECTED`/`MISSED`/`EXPIRED` danger — vždy barva + text.

**Mapa komponent (brief `docs/design/2026-09-26-design-system-mobil.md` §5 → soubor):**
- PrimaryButton = `components/ui/button.tsx` `variant="default"` (pilulka, 48 px přes `compoundVariants`, sans 16/600). Jedna velikost primary.
- OutlineButton = `button.tsx` `variant="outline"` (pilulka, 44 px). `size="sm"` (36 px) jen přechodně pro řádkové akce a hlavičku, do redesignu obrazovek.
- StateChip = `components/ui/badge.tsx` `variant="warning|success|danger|info|neutral"` + lucide ikona jako první dítě (čeká `Hourglass`, schváleno/hotovo `Check`, vráceno `Undo2`, zmeškáno `X`).
- Odznak počtu = `badge.tsx` `variant="count"` (růžová plocha, tmavé číslo) přes `app/_components/nav-badge.tsx`.
- Input = `components/ui/input.tsx` (48 px, písmo 16, rámeček, focus růžový ring 2 px).
- Karta = `components/ui/card.tsx` (radius ≈12, rámeček `ring-border`, tělo 16).
- Callout: zatím neexistuje, nová komponenta čeká na Milana.
- **Dětská část v kódu (M8.5, návrh 2):** kostra `app/child/layout.tsx` (auth + `BottomNav` = `app/_components/bottom-nav.tsx`, sdílená s rodičem, záložky jako parametr), záložky ve skupině `app/child/(tabs)/` s `layout.tsx` = `AppHeader` (`app/_components/app-header.tsx`, sdílený, + `BackHeader` pro podstránky) + `StatusTiles` (`app/child/_components/status-header.tsx`; hlavička C6 z iterace 8); Dnes `(tabs)/page.tsx`, Vydělat `(tabs)/vydelat`, Screen time `(tabs)/obrazovka`, Já `(tabs)/ja` (+ `ja/pin`), Týdenní výpis `app/child/vypis` (vlastní hlavička se šipkou). Pen → soubor: CheckRow E = `_components/check-card.tsx`, TaskCard = `_components/task-card.tsx`, posuvník = `_components/swipe-confirm.tsx` (`SwipeConfirm` + `SliderState`), PovinnostiBanner = `_components/checks-first-banner.tsx` (DayDone zrušeno 27. 9.), řádek role a postup na Dnes = `_components/day-progress.tsx` (`DayProgress`, D32, pen `g4k2TF`, HWD · 02B), detail pod názvem povinnosti = `CheckCard` (`description`, D33, HWD · 01A), seznam Za co ve výpisu = `_components/transactions.tsx` (`TransactionList`), den „St 23. 9.“ = `formatDayPrague` v `_components/format.ts`. Termín a odpočet = `lib/deadline-pure.ts` (D18), formátování minut a času = `_components/format.ts`. Radius karet = token `rounded-tile` (18 px).
- **Rodičovská část v kódu (M8.6, tok B):** kostra `app/admin/layout.tsx` (auth + `BottomNav` Schválit · Děti · Screen time · Výplaty · Víc, D30), záložky ve skupině `app/admin/(tabs)/` s `layout.tsx` = `AppHeader`; Schválit `(tabs)/page.tsx`, Děti `(tabs)/deti`, Výplaty `(tabs)/vyplaty`, Víc `(tabs)/vic`. Podstránky mimo skupinu přes `app/admin/_components/subpage.tsx` (`AdminSubpage` = `BackHeader` + obsah): detail dítěte `app/admin/deti/[id]`, úkoly, kompetence, uživatelé, nastavení. Pen → soubor: ApprovalRow (+ vracení, „Už vyřízeno“, „Nic nevisí“) = `app/admin/_components/approval-list.tsx`, DayRow (+ rozbalený, Uznat den D20, dnešek rozbalený a „Udělám já“ D31 přes `CheckLine`) = `_components/day-row.tsx` (data `_components/child-days.ts`), řádek „Teď visí“ v Úkolech (D31) = `app/admin/ukoly/_hanging-task.tsx` (`HangingTaskRow`), značky v `DailyCheckInstance.note` = `lib/check-notes.ts`, Screen time záložka (D30, pen HWS · 01B) = `(tabs)/obrazovka/page.tsx` + `_components/record-screen.tsx` (`RecordScreen` 15 min / 1 h + dlaždice dětí, `CancelRecord` „Zrušit“), zápisy týdne `lib/screen-time.ts`; dětský přehled (HWS · 03–03c) = `app/child/(tabs)/obrazovka/page.tsx`; řádek s akcí = `TransactionList` (`action`), ChildSummaryRow je přímo v `(tabs)/deti/page.tsx`. Víceřádkové pole = `components/ui/textarea.tsx`. Prázdný seznam = `app/_components/empty-state.tsx` (`EmptyState`, `tone` success jen pro „vše hotovo“ / neutral; Schválit „Nic nevisí“, Vydělat prázdná nabídka; pen `EmptyState · success` `nvZok` / `· neutral` `lC2B6`, frame HW1 · 02-2b). Změna PINu (dítě Já → PIN i rodič Víc → Změnit PIN `app/admin/pin`) = `app/_components/change-pin-form.tsx` (`ChangePinForm`). Odhlášení = `app/_components/logout-row.tsx` (`LogoutRow`, červený řádek v dlaždici; dětské Já i rodičovské Víc, pen `Řádek Odhlásit`). Nepřítomnost (D24) = `app/admin/nepritomnost/` (`_absence-list.tsx` = AbsenceRow, `_add-absence.tsx` = panel), karta Máš volno = `app/child/_components/free-day.tsx`. Uvítání (D25) = `app/uvitani/` (`_welcome-flow.tsx` = WelcomeStep ×4, `pin/` = povinný vlastní PIN); přesměrování v `app/child/layout.tsx`.
- **Připomínky (D28, sekce `w5EXSk`):** krok uvítání po PINu = `app/uvitani/pripominky/` (`_reminders-step.tsx` = HWP · 01 / 01b), řádek Připomínky (Já) / Upozornění (Víc) = `app/_components/push-setting-row.tsx` (pen `SettingRow` `yUJE3`, HWP · 02B–02d, 03), přepínač = `components/ui/switch.tsx` (pen `Switch · zapnuto (B tmavá)` `G1YNr` / `Switch · vypnuto` `IzeJW`; varianta A růžová `hbm8c` zamítnuta 29. 9.), „připomínky vypnuté“ v Děti = `(tabs)/deti/page.tsx` (ChildSummaryRow, skrytý text `a8Lr37`). Logika a texty upozornění `lib/reminders-pure.ts`, klient `lib/push-client.ts`.
- **Knihovna v penu:** frame „HW · Knihovna" (`Dluso`), proměnné `hw-*` se světlým a tmavým motivem (`mode: light | dark`, D17). Základ: PrimaryButton `xz14g`, OutlineButton `OPnr1`, StateChip · warning `t7gInv` / success `qsdJm` / danger `pMUaT` / danger-missed `f4c7b` / info `aW4Vx` / neutral `WyHcn`, CountBadge `XsnzY`, Input `DW6kr`, Input · focus `v4Xzc`, Card `nPD3U`. Složené (dětská část): iOS status bar `tX7pr`, AppHeader C6 `SBJyG`, StatusTiles `dW95X`, BottomNav `IhnZG` (`hkONr` = zamítnutá růžová hlavička C, jen historie); CheckRow E · k splnění `W5oLN` / termín blízko `zYhYo` / čeká `FAYbR` / schváleno `ajGhI` / vráceno `CdqNz`; DayProgress `g4k2TF`; PovinnostiBanner `b9xTML`; TaskCard · nabídka `M9gF8J` / zamčeno `ZE6Iw` / rozdělaný `UvWEx` / čeká `Q1chG` / schváleno `h9dn4`; TransactionRow `kWfDp`; DayDone `lEwnf` (zrušeno 27. 9., jen historie). Složené (rodičovská část, řada „Složené komponenty · rodičovská část“): ApprovalRow `OHnMw`, ApprovalRow · vracení `tYf7a`, ChildSummaryRow `jxF1R`, DayRow `e4MxJr`, DayRow · rozbalený `rHz8X`, AbsenceRow `L21SiO`; dětská FreeDay `BtWL2`, WelcomeStep `NuSRU` (ikona růžová outline bez kruhu); obrazovky v sekci `fYwO8`. Obrazovky skládej z instancí (`ref`), ne z kopií. Staré varianty (MoneyBar, AppHeader, CheckRow v1/L/v2/A–D, TaskRow, Callout) jsou smazané, historie v gitu (`f8599b7`).

**Zákon proti duplikátům:** než uděláš složenou komponentu, projdi `components/` a `app/*/_components`; když komponenta s tou rolí existuje, uprav ji, nestav paralelní variantu. Novou komponentu jen na Milanův pokyn a pak ji dopiš sem.
