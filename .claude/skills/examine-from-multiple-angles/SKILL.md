---
name: examine-from-multiple-angles
description: Nechá materiál (dokument, rozhodnutí, návrh řešení, kus textu) nezávisle přečíst několika rolemi z perspectives/ a nálezy shrne. Dvě sady rolí: byznys (strategie, rozhodnutí, experimenty) a řemeslo (playbooky, specifikace, klientské materiály). Použij, když Milan chce něco prověřit vícema očima, ověřit zlepšení po úpravách, nebo před vypuštěním na lidi.
---

# Prověření vícema očima (Homeworks)

Vlastní kopie skillu `examine-from-multiple-angles` a rolí z `2f-product/perspectives/` (převzato 2026-09-29), upravená pro Homeworks. S originálem se nesynchronizuje. Role jsou ve složce `perspectives/` vedle tohoto souboru; u tech leada je technologický kontext přepsaný na Homeworks.

**Homeworks místo 2FRESH:** materiál je typicky dokument v repu (`DECISIONS.md`, `PRD.md`, `IMPLEMENTATION_PLAN.md`, `docs/`) nebo commit s kódem, ne Notion. Čtený soubor se neskládá z Notionu, agentům se dají cesty k souborům v repu (a u kódu rozsah commitů). Zpráva z panelu jde do `docs/RRRR-MM-DD-<téma>-panel-<kolo>.md`, zapracování podle CLAUDE.md (nejdřív DECISIONS / PRD / plán, pak kód). Body 1, 5 a 6 postupu níže (Notion, `projects/design-playbooks`, `STATUS.md`) proto v Homeworks neplatí.

Osvědčený formát z revizí playbooku „Redesign informačního webu" (20. 8. 2026, dvě kola + metodik solo + audit srozumitelnosti). Podstata: několik nezávislých čtenářů s vyhraněnými rolemi čte tentýž materiál, každý sám za sebe, a jejich nálezy se pak shrnou a roztřídí.

Materiál nemusí být hotový dokument. Stejně dobře se tím dá prověřit rozhodnutí, návrh řešení nebo kus textu. Nahradil dřívější příkaz `/expert-review`, který dělal totéž s byznysovou sadou rolí.

## Zásady (neporušovat)

1. **Nezávislost:** každá role běží jako samostatný agent, NEVIDÍ nálezy ostatních ani nálezy z minulých kol. Shoda nezávislých rolí je hlavní signál závažnosti.
2. **Žádné podsunuté hypotézy:** v promptu roli neříkej, co si myslíš, že je špatně, ani co se nedávno měnilo. Jen roli, dokument a otevřené otázky. (Viz LEARNINGS.md — navádění zabíjí hodnotu revize.)
3. **Snapshot před zapracováním:** než se cokoli z nálezů zapíše do zdroje pravdy (Notion), ulož doslovný otisk aktuálního stavu do repa jako `RRRR-MM-DD-<dokument>-snapshot-pred-<krok>.md`.
4. **Dopad, ne počet:** rolím výslovně říct „nezdržuj se drobnostmi, hledej co má největší dopad" a nechat počet nálezů na nich.

## Postup

1. **Připrav čtený soubor:** stáhni aktuální stav dokumentu (u Notionu `notion-fetch`) a ulož ho zploštěný do scratchpadu (`playbook-aktualni*.md`). Agenti čtou soubor, ne Notion (konektor v subagentech nemusí fungovat). Tentýž soubor pak zkopíruj do repa jako snapshot.
2. **Vyber role.** Definice rolí jsou v `perspectives/` (v Homeworks `.claude/skills/examine-from-multiple-angles/perspectives/`), jedna role jeden soubor (anglické názvy souborů, česká jména rolí v tabulce v `perspectives/README.md`), nepiš je do promptu z hlavy. Dvě sady:
   - **byznys** (business lead, HR a talent, produktový manažer, tech lead, výzkumník) na strategii, rozhodnutí, experimenty a nápady
   - **řemeslo** (metodik, designér nováček, klient laik, obchodník, editor a korektor) na playbooky, specifikace a klientské materiály

   Kterou sadu nasadit, se řídí tím, co Milan řekl:
   - **Neurčil nic** → podívej se na materiál, navrhni sadu a zeptej se jednou větou. Nezačínej bez odpovědi.
   - **Určil sadu** („byznys panel", „řemeslo", „všech deset") → nasaď ji celou.
   - **Vyjmenoval role** („jen metodika a klienta", „navíc tech leada") → přesně ty a nikoho jiného.

   Méně než tři role nedávají křížové ověření, výjimkou je jmenovité zadání. Editor a korektor jde přidat samostatně, když Milan chce čistě jazykovou revizi bez posuzování obsahu; v jeho zadání pak výslovně napiš, že věcnou správnost neposuzuje, jinak sklouzne k obsahu.

   U role klient laik zvol konkrétní personu podle materiálu (například marketingová ředitelka strojírenské firmy, které rozpočet schvaluje jednatel) a napiš ji do zadání. U metodika přizpůsob literaturu typu dokumentu: web Halvorson, Covert, Frost, GOV.UK, Krug · produkt Goodwin, Cagan, Torres · výzkum Portigal, Krug.

3. **Spusť agenty paralelně** (jedna zpráva, `run_in_background`). Každý prompt: role s zázemím · cesta k souboru · úkol s otevřenými otázkami · formát výstupu (Verdikt 3 věty + číslované nálezy podle závažnosti: [kde] „citace" → problém → návrh) · česky, bez dlouhých pomlček, žádné meta-komentáře.
4. **Syntéza a triáž** (děláš ty, ne agent):
   - Najdi shody napříč rolemi (nezávislá shoda = priorita).
   - **Hromádka A** — mechanické opravy bez dopadu na proces/peníze → zapracuj rovnou (po snapshotu), Milanovi jen vykaž.
   - **Hromádka B/C** — mění proces nebo peníze → rozhodovací seznam pro Milana: u každého bodu otázka, doporučení, proč, co mluví proti. Odpovídá čísly („1 ano, 2 jinak…").
   - **Hromádka D** — patří jinam (klientský dokument, sazebník, smlouva) → vyjmenuj kam.
5. **Zpráva do repa:** `projects/design-playbooks/<playbook>/RRRR-MM-DD-<dokument>-panel-<kolo>.md` — verdikty, srovnání s minulým kolem (pokud bylo), triáž, plné výstupy rolí jako příloha.
6. **Workflow:** aktualizuj memory (`project_design_playbooks`) a `STATUS.md`, pak commit + push (Conventional Commits, česky).

## Kalibrace závažnosti (z dosavadních kol)

- Kolo na čerstvém dokumentu najde desítky nálezů včetně srozumitelnosti; po zapracování má další kolo přinést méně nálezů a hlubší (ekonomika, časování). Když druhé kolo přinese zase totéž, zapracování se nepovedlo.
- Milanova preference: obsahové návrhy „udělej rovnou a ukaž, smažeme kdyby ne" — ale jen hromádku A; procesní a peněžní rozhodnutí VŽDY přes rozhodovací seznam.
- Když role potřebuje číslo/limit, který neexistuje, zvol rozumný default, zapiš ho a označ ⚠️ k Milanovu potvrzení.
