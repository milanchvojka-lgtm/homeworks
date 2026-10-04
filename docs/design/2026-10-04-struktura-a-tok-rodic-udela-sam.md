# Struktura a tok — rodič udělá povinnost nebo úkol sám (D31)

**Datum:** 2026-10-04 · **Stav:** návrh · **Podle:** scénáře `2026-10-04-scenare-rodic-udela-sam.md` 1–3

## Co platí v obou variantách

- **Povinnost:** jen dnešní, nenahlášená nebo vrácená (`PENDING`, `REJECTED`). Po potvrzení `APPROVED`, poznámka, kdo ji udělal, schvalovatel = ten rodič. Dítěti se počítá (řada, bonus). Po jedné, ne celý den.
- **Úkol:** jen takový, který teď visí a nikdo ho nenahlásil: v nabídce (`AVAILABLE`), rozdělaný (`CLAIMED`) nebo vrácený dítěti (`REJECTED`). Po potvrzení `DONE` bez odměny, z nabídky zmizí, opakovaný naplánuje další jako po dokončení. Nahlášený úkol (`PENDING_REVIEW`) rodič normálně schválí.
- **Potvrzení:** krok „Ano, udělal(a) jsem“ / „Zrušit“ přímo v řádku (jako „Uznat den“), žádný dialog. Omyl se nevrací (D31 nic takového nežádá); kdyby byl potřeba, řeší se úpravou ručně.
- **Push:** jen u úkolu, který dítě mělo (`CLAIMED`/`REJECTED`): „Úkol Umýt okna je hotový“ · „Dodělal ho rodič, odměna se nepřipíše.“ U povinnosti a u úkolu z nabídky žádný push.

### Jak se jmenuje, kdo to udělal

Appka neví, kdo je táta a kdo máma, a sloveso podle jména hádat nechci (u Teri by „Udělal“ bylo špatně). Návrh bez rodu slovesa:
- **Dítě na kartě povinnosti:** místo „Schváleno“ text **„Hotovo za tebe · Milan“** (zelený stav jako schválené, jiný text).
- **Rodič v detailu dítěte:** „za Ani udělal(a) Milan“ v řádku povinnosti.
Kdybys chtěl „táta / máma“, je to nové pole u rodiče (oslovení) — mimo rozsah, řekni.

## 1 · Povinnost (scénář 1)

**Varianta A — v detailu dítěte (doporučuju).** Děti → Ani → v „Dny týdne“ je dnešek rozbalený rovnou (dnes se rozbaluje ručně). U každé nenahlášené nebo vrácené povinnosti vpravo malé tlačítko **„Udělám já“**. Klepnutí → pod řádkem „Ani se to započítá jako splněné.“ + **Zrušit / Ano, udělal(a) jsem**. Po potvrzení řádek ukáže Hotovo · „za Ani udělal(a) Milan“.
- ① Děti → ② Ani → ③ Udělám já → ④ Ano. Čtyři klepnutí.
- Plus: navazuje na místo, kde už je „Uznat den“ (D20); rozpis rolí v Dětech (D32) rovnou ukáže, kdo má kuchyň. Minus: o klepnutí víc než B.

**Varianta B — v záložce Schválit.** Pod seznamem ke schválení nová sekce **„Dnes ještě zbývá“**: po dětech jejich nenahlášené povinnosti, každá s „Udělám já“.
- ① (appka se otevře na Schválit) → ② Udělám já → ③ Ano. Tři klepnutí.
- Plus: nejkratší. Minus: Schválit přestane být jen „co schválit“ a stav dětí bude na dvou místech (Schválit i Děti) — stejný důvod, proč jsme u D32 zamítli rozpis v Schválit (tok 2B).

## 2 · Úkol (scénáře 2, 3)

**Varianta A — sekce „Teď visí“ nahoře v Úkolech (doporučuju).** Víc → Úkoly: nad seznamem šablon nová sekce **„Teď visí“** — jeden řádek na úkol, který právě visí: název, částka, stav („v nabídce“, „má Emi“, „vráceno Emi“), vpravo „Udělám já“ → potvrzení v řádku. Pod ní dál „Nový úkol“ a šablony.
- ① Víc → ② Úkoly → ③ Udělám já → ④ Ano.
- Plus: všechny visící úkoly na jednom místě, bez hledání v šablonách.

**Varianta B — v detailu úkolu.** Víc → Úkoly → Půdička → nad formulářem karta aktuální instance se stavem a „Udělám já“.
- ① Víc → ② Úkoly → ③ Půdička → ④ Udělám já → ⑤ Ano.
- Plus: žádná nová sekce. Minus: o krok delší a rodič musí vědět, který úkol visí.

## Doporučení

**1A + 2A.** Povinnost tam, kde je dítě a „Uznat den“; úkoly v jednom přehledu „Teď visí“.
