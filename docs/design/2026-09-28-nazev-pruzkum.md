# Průzkum názvu (místo „Homeworks“)

**Datum:** 2026-09-28 · **Stav:** nerozhodnuto. Milan: „zatím se mi nic nelíbí natolik, abych měnil jméno.“ Appka i obě landing pages dál jedou jako Homeworks.

## Proč měnit

- **Doména homeworks je obsazená** (Milan). Pozor: `homeworks.vercel.app` je cizí projekt, náš je `homeworks-rose.vercel.app`.
- **Jméno stojí proti sdělení.** Rodič „homeworks“ čte jako *domácí úkoly do školy*. Stránky přitom stojí na „domácnost je týmový sport“ (brief pro rodiče §2).

## Kritéria (Milan)

- **Anglický název**, ne český.
- Nese myšlenku týmu, vlastního dílu, péče nebo sdílení. Dítěti 10–15 let zní cool, rodiči důvěryhodně.
- Čech ho snadno vysloví a zapamatuje, dobře vypadá jako ikona.

## Jak jsme ověřovali domény

„Volné“ níže = doména **nemá v DNS záznam NS** (`dig +short NS`), měřeno 2026-09-28. **Není to jistota:** doména může být registrovaná bez DNS. Před rozhodnutím ověřit u registrátora (Forpsi, Wedos…) a **ochrannou známku v TMview** (EUIPO a ÚPV, třída 9 a 42 = software). `whois` z tohoto prostředí nefungoval.

## Kolo 1: týmovost

Krátká slova jsou obsazená na .com i .app: HomeTeam, PitchIn, FairShare, AllHands, Chorus, Doable, Homebase, Kinly, OurShare, Choreo.

| Název | Význam | Volné |
|---|---|---|
| **Famwork** | family + teamwork; „fam“ je dětský slang | .app, .cz |
| **HouseCrew** | crew = parta, posádka | .app, .cz |
| **HomeSquad** | squad = slovo generace (hry) | .cz |
| Kinwork | kin (příbuzní) + work; pro Čechy nečitelné | .app, .cz |
| TidyTeam | jasné, ale dětské a zužuje na úklid | .app, .cz |

Doporučení kola: **Famwork** (+ podnadpis „Your home team.“).

## Kolo 2: hravě

| Název | Hříčka | Volné |
|---|---|---|
| **Tidybop** | tidy + bop (slangem „pecka“, písnička, co se nedá neposlouchat) | **.com, .app, .cz** |
| **Moppet** | moppet = mrňous; uvnitř *mop* | .app, .cz |
| Choreboo | chore + boo (miláček); „chore“ české děti moc neznají | .com, .app, .cz |
| Chorepop | chore + pop | .app, .cz |
| Mopster | mop + mobster; drzé | .cz |
| Dustbunny | chuchvalec prachu; maskot | .cz |
| Scrubba | scrub + rumba/zumba | .app, .cz |

Slabina kola: hravá jména mluví jen o úklidu, ne o týmu a penězích.

## Kolo 3: house / together / share / care

Obsazené nebo rizikové: Housecare, Carehouse, Sharehouse, Sharehood (všude); Houseshare (= sdílený byt), HomeTogether, Togetherly, Housely, Carely (jen .cz); **Sharecare** (americká zdravotnická firma, riziko známky).

| Název | Význam | Volné |
|---|---|---|
| **HouseHuddle** | huddle = porada týmu na hřišti; aliterace H–H | .app, .cz |
| **CareCrew** | care + crew; rým | .app, .cz |
| Househood | house + -hood (brotherhood) | .app, .cz |
| HouseTogether | nejjasnější, ale dlouhé | .app, .cz |
| Careloop | care + loop (týden se točí dokola) | .com, .cz |
| CareShare | každý má svůj podíl | .cz |

## Kolo 4: Homies

**Homies** = slangem kámoši, uvnitř *home*: „doma jsme parta“. Pro děti jejich slovo, pro část rodičů může znít moc „ulice“ (vyvážit podnadpisem, třeba „Homies · Your home team“).

- homies.com / .app / .cz, homie, myhomies, thehomies: **obsazené**.
- Volné pro značku „Homies“ s jinou doménou: homiesapp.cz / .app, gethomies.cz / .app, homieshq.cz / .app, homiez.app / .cz, homiesquad.app / .cz.
- **HomieCrew**: volné .com, .app, .cz.
- Riziko: krátké slangové slovo má vysokou šanci na existující známku nebo appku „Homies“. **TMview je tady nutnost.**

### Homies + deal / co-op

| Název | Význam | Volné |
|---|---|---|
| **Homie Co-op** | co-op = družstvo i **herní režim spolupráce** (hráči spolu, ne proti sobě) | **.com, .app, .cz** (homiecoop, i homie-coop) |
| Homies Co-op | totéž v množném čísle | homies-coop: .com, .app, .cz |
| **Homies Deal** | deal = dohoda; nese „kapesné je protislužba“ | **.com, .app, .cz** |
| The Homie Deal | spíš slogan | .com, .app, .cz |
| HomieDeal | kratší | .app, .cz |

Pozor: **homiescoop** bez pomlčky se čte i jako „homie scoop“ (a .com je obsazená).

Doporučení kola: **Homie Co-op** („Domácnost je týmová hra“), druhý Homies Deal.

## Kde jsme skončili

- Nejsilnější kandidáti napříč koly: **Homie Co-op**, **Homies** (když projde známka), **Famwork**, **HouseHuddle**, **Tidybop**.
- Milan zatím nic nevybral. Až se k tomu vrátíme: zúžit na 2–3, udělat zkoušku v penu (hlavička obou landing pages + ikona appky vedle sebe), ověřit doménu a známku.
- Přejmenování zasáhne: texty obou landing pages, logo v hlavičce, manifest a název PWA, přihlášení, e-maily (`NOTIFICATION_FROM_EMAIL`). Odhad ~půl dne + nová doména na Vercelu.
