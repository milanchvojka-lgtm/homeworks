# Design systém Homeworks: úprava pro mobil

**Datum:** 2026-09-26 · **Stav:** návrh, čeká na Milana · **Podle:** D15, brief Offer Buddyho `2f-product/projects/offer-buddy/design/2026-08-31-design-system-brief.md` (dál jen „OB brief")

Homeworks přebírá tokeny, typografii a pravidla z OB briefu. Tenhle dokument popisuje jen **rozdíly pro mobilní PWA** (iPhone, šířka 390 px, ovládání palcem, spuštění z plochy). Co tu není, platí podle OB briefu. Body označené **▶ rozhodni** čekají na Milana.

---

## 1 · Barvy: kontrast textu na telefonu

Z OB briefu přechází celá paleta beze změny (`--hw-*` = `--ob-*`, viz `app/globals.css`). Tři barvy ale jako drobný text nesplňují WCAG AA (4,5:1). Na telefonu se čte venku, na slunci, s nižším jasem, takže to vadí víc než na webu Offer Buddyho.

| Barva | Kontrast na bílé / na paperu | Problém |
|---|---|---|
| `--hw-pink` `#FF77AA` | 2,48 / 2,23 | zvýrazněná čísla (streak, kredit) jsou špatně čitelná |
| `--hw-ink-35` `#A6AAB4` | 2,33 / 2,10 | kickery a tlumené labely |
| `--hw-amber` `#B97F0F` | 3,44 / 3,10 | stav „čeká na schválení", nejčastější stav v appce |

**Návrh:** nové tokeny jen pro **text**. Plochy a tečky si nechají původní barvu, takže vzhled zůstane stejný a změní se jen barva písma.

| Nový token | Hex | Kontrast bílá / paper | Nahrazuje v textu |
|---|---|---|---|
| `--hw-pink-ink` | `#C4336E` | 5,19 / 4,68 | růžové číslo, kicker, aktivní odkaz |
| `--hw-ink-45` | `#72767F` | 4,55 / 4,10 | kicker, meta, tlumený label (placeholder smí zůstat `ink-35`) |
| `--hw-amber-ink` | `#8F620B` | 5,36 / 4,83 | text stavu „čeká" |

Aliasy: `text-highlight` → `--hw-pink-ink`, `text-subtle` → `--hw-ink-45`, `text-warning` → `--hw-amber-ink`. Plocha `bg-highlight` zůstává `#FF77AA` (tmavý text na růžové má 7,09 : 1).

**▶ rozhodni 1:** přijmout tři textové varianty (doporučuju), nebo držet originál Offer Buddyho kvůli věrnosti?

---

## 2 · Typografie

OB brief má tělo textu 13,5 px a H1 34 px, protože jde o hustý pracovní nástroj na velkém monitoru. Na telefonu je 13,5 px malé a iOS navíc přiblíží stránku, když má pole formuláře písmo menší než 16 px.

| Role | OB brief (web) | **Homeworks (mobil)** | Použití |
|---|---|---|---|
| H1 | sans 34 / 700 / −0,7 | **sans 26 / 700 / −0,5 / lh 1,15** | nadpis obrazovky (jen jeden) |
| H2 | sans 22 / 700 | **sans 19 / 700 / −0,3** | nadpis sekce nebo karty |
| Velké číslo | mono 24 / 700 (cena) | **mono 32 / 700** | streak, kredit (hlavní číslo obrazovky) |
| Body | sans 13,5 / lh 1,55 | **sans 16 / lh 1,5** | text, položky seznamu, názvy checků |
| Meta | sans 13 | **sans 14** | druhý řádek položky, čas, částka |
| Section label | mono 12–13 / 700 / upper / +1,6 | **mono 12 / 700 / upper / +1,4** | nadpis skupiny („RÁNO", „VEČER") |
| Kicker | mono 10,5 / 700 / upper | **mono 11 / 700 / upper** | drobný štítek nad nadpisem |
| Micro | sans 11 | **sans 12** | poznámka, časová značka |
| Input | sans 14 | **sans 16** (povinné kvůli iOS) | PIN, formuláře admina |

Minimum na telefonu je 11 px, a to jen pro mono kicker v kapitálkách. Dnešní popisky `text-[10px]` zmizí.

**▶ rozhodni 2:** škála vyhovuje, nebo chceš celkově větší nebo menší písmo?

---

## 3 · Dotykové plochy a velikosti

- **Minimum pro ťuknutí je 44 × 44 px** (Apple HIG). Dnešní tlačítka mají 32 px (`h-8`) a malá 28 px, a to je potřeba změnit.
- **Hlavní tlačítko:** výška 48 px, šířka přes celý obsah, když je hlavní akcí obrazovky nebo sekce. Tvar je pilulka (`radius: pill`) jako v OB briefu. Pořád platí jedna velikost primary.
- **Vedlejší tlačítko (outline):** výška 44 px, pilulka.
- **Řádek seznamu s akcí** (check, úkol): výška aspoň 56 px, ťuknout jde na celý řádek, ne jen na malé tlačítko vpravo.
- **Rozestupy:** násobky 4 px (OB brief §1.3). Postranní okraj obrazovky je 16 px, mezera mezi sekcemi 24–32 px a vnitřní padding karty 16–20 px (OB má 22–28, na telefonu je to moc).
- **Zaoblení:** input 8, karta 12, chip 16, tlačítko pilulka (OB brief §1.4). V kódu to znamená `--radius: 0.5rem` a karta `rounded-xl` (≈ 11 px, blízko 12).

---

## 4 · Navigace a kostra obrazovky

- **Spodní lišta** se 4 záložkami (vstup z brainstormu, přesné záložky určí scénáře v kroku 8.2). Výška 56 px nad home indikátorem, spodní padding `env(safe-area-inset-bottom)`. Aktivní záložka má ikonu a popisek v barvě ink s růžovou čárkou nad ikonou, neaktivní má `ink-45`. Odznak s počtem je růžová plocha s tmavým číslem.
- **Ikony:** OB brief používá unicode znaky (▸ ✓ ●). Na spodní liště a u stavů doporučuju **lucide ikony**, protože už jsou v projektu a vykreslují se stejně na všech zařízeních. Unicode zůstane pro drobnosti v textu.
- **Hlavička:** jen název obrazovky (H1) a vpravo avatar. Nastavení a odhlášení se přesunou pod záložku „Já" nebo do menu u avataru. Dnes jsou to tři textová tlačítka v hlavičce.
- **Horní okraj:** `env(safe-area-inset-top)`, protože PWA běží na celou obrazovku (`viewportFit: cover`).
- **Hlavní akce na dosah palce:** hlavní akce obrazovky patří do spodní poloviny nebo do seznamu, ne do hlavičky.

**▶ rozhodni 3:** lucide ikony na liště a u stavů (doporučuju), nebo unicode jako Offer Buddy?

---

## 5 · Komponenty: z Offer Buddyho do Homeworks

Tvar se ladí ve zdrojovém souboru komponenty (D15), ne na stránkách.

| Komponenta (OB brief) | V Homeworks | Změna pro mobil |
|---|---|---|
| PrimaryButton §2.5 | `components/ui/button.tsx` varianta `default` | pilulka, výška 48, sans 16 / 600 |
| OutlineButton §2.6 | `button.tsx` varianta `outline` | pilulka, výška 44 |
| StateChip §2.1 | `components/ui/badge.tsx` (nové varianty stavů) | tečka + mono 11 upper; stavy: čeká / schváleno / vráceno / zmeškáno / hotovo |
| TagChip §2.3 | `badge.tsx` varianta `tag` | beze změny kromě písma 11 |
| Callout §3.7 | nová v `components/ui/` (▶ Milan) | pro hlášku „vráceno s poznámkou", úspěch a chybu |
| Input §2.9 | `components/ui/input.tsx` | výška 48, písmo 16, focus růžový rámeček 2 px |
| Karta | `components/ui/card.tsx` | radius 12, rámeček `border`, padding 16–20 |
| ToggleChip §2.8 | zatím nepotřebujeme | — |
| Wizard, VersionPillbox, SouhrnCard, FazeCard, … | nepřebíráme | specifické pro nabídky |

**Nové složené komponenty pro Homeworks** (třeba řádek checku, karta úkolu, streak ukazatel, spodní lišta) se navrhnou až podle scénářů a toku (8.2–8.4). Tady se jen přeberou primitivy.

---

## 6 · Pravidla (doplněk k OB brief §5)

Z OB briefu platí: jeden primary na sekci, stavové chipy jen pro stav, section label je mono upper, callout má levý proužek 2 px. Pro Homeworks navíc:

1. **Jedna hlavní věc na obrazovce.** Obrazovka odpovídá na jednu otázku ze scénáře (třeba „co mám dnes ještě udělat"). Ostatní je vedlejší nebo patří jinam.
2. **Žádná informace dvakrát** (skill `design-to-code` §5).
3. **Stav je vždy barva a text**, nikdy jen barva.
4. **Růžová** je jen pro aktivní stav, zvýrazněné číslo a odznak. Nikdy pro druhé hlavní tlačítko ani pro chybu.
5. **Zelená jen pro stav** „schváleno" nebo „hotovo". Ne jako dekorace ani pro tlačítka.
6. **Žádné popisky pod 11 px**, žádné `text-[10px]`.

---

## 7 · Co se po schválení udělá (zbytek kroku 8.1)

1. Tokeny a aliasy z §1 do `app/globals.css`.
2. Primitivy z §5 upravit ve zdrojových souborech (`button`, `badge`, `input`, `card`). Propíše se to do všech obrazovek, rozložení obrazovek zůstane.
3. Knihovna komponent v `_design/homeworks.pen`: tokeny jako proměnné a primitivy z §5 jako komponenty (kopie z `offer-buddy-design-system.pen`, upravená podle tohoto briefu). Frame „HW · Knihovna".
4. Mapa komponent do skillu `design-to-code` §6.
5. Ověření v běžící appce na šířce 390 px.
