# Struktura a tok: rodičovská část Homeworks (M8.3)

**Datum:** 2026-09-26 · **Stav:** schváleno 2026-09-26: **varianta B** + společné body §5 · **Podle:** `2026-09-26-scenare.md` (scénáře 5–7 rodič), brief `2026-09-26-design-system-mobil.md`, dětská část `2026-09-26-struktura-a-tok.md` (varianta B)

Bez obrazovek a bez vzhledu. Jen to, co rodič dělá a co přitom vidí, a kde co žije. Až vybereš variantu, napíše se k ní smlouva rozsahu per obrazovka. Kreslit se začne až po tvém „kresli".

---

## 1 · Potřeby ze scénářů (bez řešení)

| # | Rodič potřebuje | Četnost | Scénář |
|---|---|---|---|
| R1 | vidět vše, co čeká na schválení, napříč dětmi (povinnosti, úkoly, obrazovka) | denně večer | 5 |
| R2 | u položky poznat kdo, co a kdy nahlásil, aby věděl, kam se jít podívat | denně večer | 5 |
| R3 | schválit jednu položku jedním krokem | denně večer | 5 |
| R4 | vrátit s krátkou poznámkou | když nastane | 5 |
| R5 | zapsat obrazovku za dítě, o kterou se žádalo mimo appku (**nová funkce**) | několikrát týdně | 5 |
| R6 | poznat, že nic nevisí | denně | 5 |
| R7 | vidět částku k výplatě u každého dítěte, označit vyplaceno, nevyplacené neztratit | týdně | 6 |
| R8 | na požádání vidět souhrn týdne dítěte (zmeškané dny, řada, bonus) | občas | 6 |
| R9 | rychle přidat jednorázový úkol, i z telefonu | občas | stav |
| R10 | dohledat, co se u dítěte stalo konkrétní den, a zmeškané zpětně uznat (**nová funkce, čeká na DECISIONS**) | občas | 7 |
| R11 | kompetence a povinnosti, uživatelé a PINy, sazby a trofeje | vzácně | — |

**Co se přetahuje:**
- **Rychlost proti kontrole:** rodič večer chodí po bytě s telefonem v ruce. Schválení musí jít rychle, ale jen u věcí, které viděl. Hromadné schválení nechce.
- **Dva rovnocenní rodiče:** kdokoli z nich může vyřídit cokoli. Co vyřídil jeden, druhému zmizí, a peníze se nesmí připsat dvakrát.
- **Frekvence proti dnešnímu menu:** dnes je šest rovnocenných záložek, ale denně se používá jedna (R1–R6). Zbytek je týdně, občas nebo vzácně.
- **Pohled přes položky proti pohledu přes dítě:** schvalování je fronta položek (R1–R4). Obrazovka za dítě (R5), souhrn týdne (R8) a dohledání dne (R10) se ale vždycky týkají jednoho konkrétního dítěte.

## 2 · Co je dnes (pro srovnání)

Hlavička se jménem a tlačítkem Odhlásit, pod ní šest textových záložek nahoře: Inbox · Kompetence · Úkoly · Výplaty · Uživatelé · Nastavení. Rozvržení je spíš pro počítač (okraje 24 px, starý styl karet), redesign dětské části na admin nesáhl.

- **Inbox** seskupuje čekající položky podle dítěte (povinnost, úkol, žádost o obrazovku). U každé je schválit a vrátit (R1–R4 pokryté).
- **Výplaty** jsou seznam uzavřených týdnů s částkami a „vyplaceno" (R7). Souhrn týdne chybí (R8).
- **Obrazovku za dítě zapsat nejde** (R5). **Pohled na jedno dítě neexistuje** (R8, R10).
- Úkoly, Kompetence, Uživatelé a Nastavení jsou formuláře (R9, R11).

---

## 3 · Varianta A: fronta ke schválení, zbytek pod „Víc"

**Spodní navigace (jako u dětí):** Schválit · Výplaty · Víc

| Záložka | Odpovídá na otázku | Obsah (potřeby) |
|---|---|---|
| **Schválit** | „Co musím vyřídit?" | Čekající položky seskupené podle dětí. Každá ukazuje, co, ke které kompetenci a kdy (R1, R2). Schválit jedním ťuknutím, vrátit s poznámkou (R3, R4). Nahoře akce „Zapsat obrazovku": vybrat dítě a délku (R5). Když nic nečeká: „Nic nevisí" (R6). |
| **Výplaty** | „Kolik komu poslat?" | Nevyplacené týdny nahoře, u každého dítěte částka a „vyplaceno" (R7). Ťuknutím na dítě v týdnu se otevře souhrn týdne (R8) a z něj den → dohledání a uznání (R10). |
| **Víc** | „Nastavení domácnosti" | Úkoly (nahoře „Nový úkol", R9), Kompetence, Uživatelé, Nastavení (R11), odhlášení. |

**Hlavička:** název záložky a avatar rodiče.

### Tok ve variantě A

**Scénář 5 (večer doma):** ① otevře appku, je na Schválit ② vidí „čtrnáctiletá · Kuchyň připravená na ráno · 21:04" ③ jde se podívat do kuchyně ④ ťukne „schválit", položka zmizí ⑤ u stolu vidí drobky, ťukne „vrátit", napíše „drobky pod stolem", potvrdí ⑥ ťukne „Zapsat obrazovku", vybere dítě a 60 min, potvrdí ⑦ vidí „Nic nevisí". **1 ťuknutí na schválení, 3 kroky na vrácení, 3 kroky na obrazovku.**

**Scénář 6 (výplata):** ① přepne na Výplaty ② vidí nevyplacený týden a u každé holky částku ③ pošle převody v bance ④ u každé ťukne „vyplaceno" ⑤ občas ťukne na dítě a vidí souhrn týdne. **1 přepnutí + 1 ťuknutí na dítě.**

**Scénář 7 (přišla o řadu):** ① přepne na Výplaty ② ťukne na dítě v aktuálním týdnu ③ v souhrnu vidí zmeškaný den ④ ťukne na něj a vidí, co se s povinností stalo (nenahlášeno / vráceno / neschváleno do půlnoci) ⑤ uzná. **1 přepnutí + 3 ťuknutí.** Háček: aktuální týden ještě není uzavřený, takže ve Výplatách by musel být jako „probíhá".

**Silné stránky:** nejjednodušší, jen tři záložky. Denní činnost (Schválit) je hned po otevření. Nejblíž tomu, co je dnes, jen seřazené podle četnosti.
**Slabiny:** obrazovka za dítě je v záložce Schválit, i když nic neschvaluje. Dohledání dne je schované ve Výplatách, i když s penězi souvisí jen nepřímo. Otázka „jak je na tom ta nejmladší?" nemá kde žít.

---

## 4 · Varianta B: fronta ke schválení + pohled na každé dítě

**Spodní navigace:** Schválit · Děti · Výplaty · Víc

| Záložka | Odpovídá na otázku | Obsah (potřeby) |
|---|---|---|
| **Schválit** | „Co musím vyřídit?" | Stejně jako ve variantě A, jen bez „Zapsat obrazovku" (R1–R4, R6). |
| **Děti** | „Jak je na tom každá holka?" | Tři řádky, jeden na dítě: tento týden vyděláno, kolik povinností dnes zbývá (R8 v krátkosti). Ťuknutím se otevře **detail dítěte**: tento týden (vyděláno, obrazovka, řada, bonus), dny týdne se stavem povinností (R8). Ťuknutím na den se ukáže, co se s povinnostmi stalo, a zmeškaný den jde uznat (R10). Na detailu je jedno hlavní tlačítko „Zapsat obrazovku" (R5). |
| **Výplaty** | „Kolik komu poslat?" | Jen peníze: nevyplacené týdny nahoře, částka u každého dítěte, „vyplaceno" (R7). Detail týdne vede do detailu dítěte, žádná druhá kopie souhrnu. |
| **Víc** | „Nastavení domácnosti" | Stejně jako ve variantě A (R9, R11). |

### Tok ve variantě B

**Scénář 5 (večer doma):** ①–⑤ jako A ⑥ přepne na Děti, ťukne na dítě, „Zapsat obrazovku", vybere 60 min, potvrdí ⑦ zpět na Schválit: „Nic nevisí". **Schválení 1 ťuknutí, vrácení 3 kroky, obrazovka 1 přepnutí + 3 kroky.**

**Scénář 6 (výplata):** ① přepne na Výplaty ② vidí částky ③ pošle převody ④ ťukne „vyplaceno" ⑤ souhrn týdne: ťukne na dítě a skončí v detailu dítěte. **1 přepnutí.**

**Scénář 7 (přišla o řadu):** ① přepne na Děti ② ťukne na dítě ③ vidí dny týdne a u středy „zmeškáno" ④ ťukne na středu a vidí, že kuchyň byla nahlášená ve 23:50 a nikdo ji do půlnoci neschválil ⑤ uzná. **1 přepnutí + 2 ťuknutí.** Funguje i pro běžící týden.

**Silné stránky:** každá akce, která se týká jednoho dítěte (obrazovka, souhrn, dohledání dne), má jedno přirozené místo. Scénář 7 je v ní nejkratší a nepotřebuje „probíhající" týden ve Výplatách. Otázka „jak je na tom ta nejmladší?" má odpověď.
**Slabiny:** o záložku víc. Zapsání obrazovky trvá o jedno přepnutí déle než ve variantě A. Detail dítěte je nová obrazovka, kterou je potřeba navrhnout a postavit.

---

## 5 · Co mají obě varianty společné (nezávisle na volbě)

- **Mobil napřed.** Spodní navigace a hlavička jako u dětí (AppHeader, BottomNav z knihovny). Rodič schvaluje na telefonu.
- **Schválit je výchozí obrazovka** po přihlášení rodiče. Odznak počtu je na její záložce (jako dnes u Inboxu).
- **Položka ke schválení:** kdo (jméno a barva dítěte), co (povinnost / úkol s částkou / obrazovka s minutami), kompetence, čas nahlášení. Schválit je hlavní akce, vrátit je vedlejší a otevře krátkou poznámku. Po vyřízení položka zmizí.
- **Bez hromadného schválení** (Milan: „stačí po jednom").
- **Dva rodiče:** když druhý rodič položku mezitím vyřídil, uvidí „už vyřízeno" místo chyby. Souběžné kliknutí nesmí připsat peníze dvakrát (oprava v kódu, bez vlivu na vzhled).
- **„Nic nevisí"** nahradí prázdný seznam.
- **Víc** obsahuje vzácné věci: úkoly, kompetence, uživatele, nastavení, odhlášení. Formuláře se jen přestylují do design systému, jejich obsah se nemění. Ostrá data přijdou z tabulky.
- **Každá informace žije na jednom místě** (design-to-code §5).
- **Zpětné uznání dne (R10)** je v toku jen jako místo. Kreslit se může, až bude rozhodnutí v DECISIONS (jak daleko zpátky, přepočet řady a trofejí, uzavřený bonus).

## 6 · Rozhodnutí

**Milan, 2026-09-26: varianta B, společné body z §5 platí.** Na otázku 3 (počítač) neodpověděl, navrhuje se jen pro telefon podle bodu „mobil napřed“. Pokračuje se smlouvou rozsahu `2026-09-26-rodicovska-cast-co-menime-co-ne.md`.

*Původní otázky:*

1. **Varianta A, nebo B?** Doporučuju **B**. Obrazovka za dítě, souhrn týdne i dohledání dne mají v ní jedno přirozené místo a scénář 7 je nejkratší. Cenou je čtvrtá záložka a nová obrazovka detail dítěte.
2. **Souhlasíš se společnými body z §5?** Hlavně s tím, že formuláře pod „Víc" se jen přestylují a obsahově nemění.
3. **Používáš admin i na počítači?** Když ne, navrhuju jen pro telefon, stejně jako dětskou část.
