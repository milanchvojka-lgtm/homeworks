# Brief: produktová landing page Homeworks

**Datum:** 2026-09-28 · **Stav:** podklad pro další kolo (návrh 3) · **Kde se kreslí:** `_design/homeworks.pen` (ne Claude Design artefakt, viz níže)

## 1 · Cíl a publikum

- **Cíl stránky:** vysvětlit, s čím Homeworks pomáhá a jak funguje, a vzbudit touhu to vyzkoušet. Hlavní akce: **zapsat se na seznam zájemců** („Chci to vyzkoušet“ / „Chci být mezi prvními“). Zároveň otestovat zájem o nové nápady.
- **Primární publikum: rodiče** dětí zhruba 10–15 let. Rozhodují a nastavují. Děti mají vlastní stránku `/pro-deti` (D27, brief `2026-09-28-landing-deti-brief.md`).
- **Emoce, které má stránka vyvolat (Milan):** radost, lehkost, úleva. „Chtěl bych si to přečíst a cítit se fakt dobře, že konečně vznikla aplikace, která mi s tím pomůže.“ Děti to mají za své, rodiče jsou klidní a spokojení.

## 2 · Hlavní myšlenky (messaging)

1. **Rodina je tým, kapesné je protislužba** (Milanova hlavní myšlenka, v návrhu 1 chyběla). Dokud byly děti malé, všechno bylo na rodičích: celá domácnost. Dnes se o sebe dokážou postarat, a je čas, aby se učily být součástí celku. Kapesné není samozřejmost. Dostávají jídlo, kde bydlet, kapesné a klid na učení; protislužbou je, že převezmou konkrétní díl domácnosti. Appka tenhle princip podporuje.
2. **Screen time s hranicemi.** Většina rodičů řeší, že děti jen scrollují a nemají přehled, kolik času na tom tráví. Chybí sebereflexe a vnímání hodnoty promarněného času. Ne všechno scrollování je špatně, ale všechno má mít hranice. Appka děti učí hranice vnímat: vidí, kolik času už odehrály, a screen time si kupují z vydělaného (30 min za 100 Kč).
3. **Pravidla jsou vaše.** Rodič si ve své instanci nastaví vlastní oblasti a povinnosti (i s termínem), vlastní placené úkoly a odměny, hodinovou sazbu, cenu screen time, měsíční bonus a jeho srážku, trofeje, vstupní bonus. *Vlastní měnu appka zatím neumí (vše v Kč), na stránce ji neslibovat, dokud Milan nerozhodne.*
4. **Nápad k otestování (v appce není):** screen time si děti mohou **vysloužit kvízy z mediální gramotnosti** a správného používání sociálních sítí. Na stránce jako „Připravujeme“ s jednoduchou otázkou zájmu („Chtěli byste to?“), aby se změřila reakce.
5. **Pro rodiče méně dozoru (ne méně práce):** večer projdete, co děti nahlásily, jedním ťuknutím schválíte; v neděli vyplatíte; tábor nebo nemoc zadáte jednou.
6. **Děti to mají za své:** vlastní telefon a PIN, řada dní, trofeje (7, 14, 30 dní), měsíční bonus, vidí, co si vydělaly a za co.

**Tón: týmovost, ne přesun práce (Milan 2026-09-28, po návrhu 3).** Stránka nesmí vyznít, že rodiče nic nedělají a děti makají. Domácnost je týmový sport: rodiče dál dělají svůj díl (práce, vaření, nákupy, vození), děti se do týmu vracejí se svým dílem a cítí za něj zodpovědnost. Appka je způsob, jak děti do týmu zapojit a motivovat je věcmi, na kterých jim záleží (screen time, peníze, řada, trofeje). Úleva rodiče = konec připomínání a dozoru, ne volno na gauči. Důsledky: žádné věty typu „Vy jen schvalujete“ nebo „Zbytek běží sám“; fotky „po“ ukazují rodinu spolu nebo dítě při jeho díle, ne odpočívajícího rodiče.

## 3 · Ověřená fakta o produktu (co smí stránka tvrdit)

| Téma | Fakt |
|---|---|
| Oblasti | Každé dítě má na týden jednu oblast (kuchyň, stůl…), každé pondělí se samy prostřídají. |
| Povinnosti | Dítě přejede prstem, že je hotovo; rodič jedním ťuknutím schválí, nebo vrátí s poznámkou. Zmeškané až po půlnoci. |
| Placené úkoly | Když má dítě povinnosti hotové, bere si úkoly za peníze (vidí odměnu i odhad času). Úkoly mají frontu mezi sourozenci. |
| Peníze | Vydělané: screen time, nebo nedělní výplata. Kredit nejde do mínusu. Týdenní výpis „Za co“. |
| Motivace | Řada dní, trofeje 7/14/30 dní, měsíční bonus (plný, když nic nevynechá). |
| První spuštění | Uvítání ve 4 krocích, vlastní PIN, **první týden na zkoušku** (nic neztratí), **vstupní bonus 100 Kč**. |
| Nepřítomnost | Tábor, dovolená, nemoc: od–do, i zpětně v aktuálním týdnu; řada a bonus zůstanou. |
| Zařízení | Jen telefon, **PWA** (odkaz → přidat na plochu), **bez App Store**. Stačí i jeden sdílený telefon/tablet (každé dítě má profil a PIN). |
| Nastavení | **15–20 minut.** |
| Soukromí | Ukládá se **jen jméno dítěte** (a jeho činnost v appce). Žádný e-mail ani telefon dítěte, žádná reklama. |
| Cena | **Zatím zdarma, platí se zpětnou vazbou.** Později cena = provoz + 50 % marže. |

**Náklady provozu (pro FAQ o ceně, ověřit ceníky):** dnes 0 Kč (Vercel Hobby, Supabase Free, Resend Free, GitHub Actions u veřejného repa). Při zpoplatnění nutně Vercel Pro (Hobby nedovoluje komerční použití) ~20 USD + doporučeně Supabase Pro ~25 USD ≈ 1 100 Kč/měs, s marží ≈ 1 650 Kč/měs. Na rodinu: 10 rodin ≈ 165 Kč, 30 ≈ 55 Kč, 50 ≈ 33 Kč, 100 ≈ 17 Kč měsíčně.

**Omezení, které stránka musí respektovat:** Homeworks je dnes pro **jednu rodinu** (multi-tenant je v PRD mimo v1). Proto výzva = seznam zájemců, ne okamžitá registrace.

## 4 · Struktura (návrh 2 → výchozí pro návrh 3)

1. **Úvod** na barevné ploše: nadpis pro rodiče („Doma konečně táhnete za jeden provaz.“), podnadpis s klidem a úlevou, výzva, telefon dítěte se skutečnou obrazovkou Dnes.
2. **Zní vám to povědomě?** 4 situace (připomínání kuchyně, debata o obrazovce, „to není fér“, kapesné bez souvislosti) + scrollování bez přehledu.
3. **Rodina je tým** (myšlenka 1) + ukázka: karta povinnosti / kompetence týdne.
4. **Jak to funguje** ve 4 krocích, **u každého skutečná ukázka z appky** (CheckRow s posuvníkem, ApprovalRow, TaskCard nabídka, výběr screen time).
5. **Screen time s hranicemi** (myšlenka 2) + telefon s obrazovkou Screen time.
6. **Pro rodiče** (myšlenka 5) + telefon rodiče se Schválit / Nic nevisí, Výplaty.
7. **Děti to mají za své** (myšlenka 6) + dlaždice řada/bonus, trofeje, výpis Za co.
8. **Pravidla jsou vaše** (myšlenka 3) + ukázka Nastavení / formuláře úkolu.
9. **Připravujeme: kvízy z mediální gramotnosti** (myšlenka 4) s otázkou zájmu.
10. **Příběh** (Milan, táta tří holek) + 3 čísla z provozu.
11. **Časté otázky** (cena, PWA, nastavení, soukromí, nepřítomnost, sdílený telefon).
12. **Závěrečná výzva** se seznamem zájemců.

## 5 · Vizuální směr

- **Víc barvy a radosti, méně „wireframe“** (Milan k návrhu 1: typografie dobrý základ, ale černobílé a suché). Barevné plochy sekcí z palety appky: `hw-pink-bg`, `hw-green-bg`, `hw-blue-bg`, `hw-amber-bg`; tmavá sekce `hw-ink` jen jednou. Růžová `hw-pink` na zvýraznění čísel. *Pozor:* `hw-pink` má na bílé nízký kontrast u menšího textu.
- **Hodně skutečných ukázek z appky**, ne ilustrace: telefony s kopiemi skutečných framů. Obrazovky dětí i rodičů.
- Typografie IBM Plex Sans / Mono jako appka; velké nadpisy, krátké věty.
- **Fotky ano (Milan 2026-09-28):** mají nést emoci. Pojetí **„před a po“**: v sekci Problém frustrace, kterou zná většina rodičů (plná linka a nádobí večer, dítě v posteli s telefonem ve tmě, gauč zavalený oblečením, rodič volající z kuchyně), u nových sekcí úleva (uklizená kuchyň, dítě si odškrtává povinnost v telefonu, rodič večer v klidu). Generovat přímo v penu (`Generate` ai / stock). **Bez tváří** (detaily, ruce, prostředí, postavy zezadu), běžný byt, večerní světlo, ne přesvícený stock; jednotný styl a barvy ladící s paletou.

## 6 · Pravidla práce (D15, D16, design-to-code)

- Kreslit **v penu**, sekce „HW · Landing page · návrh N (datum)“, framy `HWL<N> · 01 Desktop 1440`, `· 02 Telefon 390`, štítek ve framu.
- **Jen tokeny `hw-*`** a **komponenty z knihovny** (`xz14g` PrimaryButton, `OPnr1` OutlineButton, `DW6kr` Input, StateChip…); telefony = kopie skutečných obrazovek.
- Jedno hlavní tlačítko na sekci; žádná informace dvakrát (výzva opakovaná na konci je záměr).
- Skutečná data z pilotu; chybějící fakta jako `[ZÁSTUPNÝ TEXT]`, nic nevymýšlet.
- Po každém kroku Milan uloží pen (⌘S) a ověřit `stat` + `grep` na disku (Pencil občas neuloží).

## 7 · Kde co je

- **Návrh 1** (pen): sekce „HW · Landing page · návrh 1 (28. 9.)“ (`eY0H5`), framy `HWL · 01 Desktop` (`IScQW`), `HWL · 02 Telefon` (`D3PQB`).
- **Návrh 2** (pen, rozpracovaný, jen úvod): „HW · Landing page · návrh 2 (28. 9.)“ (`Zk5mw`), frame `HWL2 · 01 Desktop` (`y4ueV`); telefon rodiče (`t8Pbp`) je odložený (skrytý) na stránce pro sekci Pro rodiče.
- **Návrh 3** (pen, celá stránka desktop, telefon zatím ne): „HW · Landing page · návrh 3 (28. 9.)“ (`zZovU`), frame `HWL3 · 01 Desktop 1440` (`S8Zm8H`). Sekce: Úvod `nYfi5` (z návrhu 2), Problém `lcANB`, Rodina je tým `g4NFhg`, Jak to funguje `BLAKP`, Screen time `VEWsx`, Pro rodiče `SYy6w`, Děti to mají za své `g3ny6u`, Pravidla jsou vaše `c6aUN7`, Připravujeme · kvízy `XAy4g`, Příběh `MkQNF`, Časté otázky `WZANf`, Seznam zájemců `FnyJA`, Patička `v6UlqS`. Fotky `_design/generated*.png` (AI v penu). Hodnoty v ukázce Nastavení = výchozí `AppSettings` (150 Kč/h, 200 Kč/h screen time, bonus 200 / krok 50, vstupní 100).
- **Návrh 3b · týmovost** (pen): „HW · Landing page · návrh 3b (28. 9.) · týmovost“ (`UYupj`), frame `HWL3b · 01 Desktop 1440 · týmovost` (`Uvq4k`). Kopie návrhu 3, mění jen tón podle §2 (podnadpis úvodu, 1. situace, Rodina je tým text + fotka, krok 1, Pro rodiče nadpis + fotka, nadpis Děti, závěrečná výzva, patička). Návrh 3 zůstává vedle pro srovnání.
- **Skutečné obrazovky ke kopírování:** dítě Dnes `o6rLC` (HW2 · 01), Vydělat `xwok7`, Screen time `RhrEU`, Týdenní výpis `DJK0X`, uvítání HWU · 01–06; rodič Schválit `g4AoCl`, Děti `NcPEb`, Výplaty `YyN2Z`, Nepřítomnost `h2NteO`.
- **Artefakt Claude Design** (první pokus, mimo pravidla): https://claude.ai/artifact/KRuysPXq7R2qSc9TQAf7HF — jen historie; smazat, až to Milan potvrdí.

## 8 · Otevřené

- Milanův citát a 3 čísla z provozu do sekce Příběh.
- Vlastní měna: slibovat, nebo ne?
- Skutečná fotka od Milana v sekci Příběh: ano / ne (rozhodne později).
- Kde bude stránka hostovaná a kam se ukládají e-maily ze seznamu zájemců (dnes nikam).
