# Úhly pohledu (role pro panel)

Definice perspektiv, ze kterých se dá nechat přečíst dokument, rozhodnutí, návrh řešení nebo kus textu. Žádná z rolí není „expert" v pravém smyslu: každá je **zástupný čtenář s vyhraněným úhlem pohledu** (business lead zastupuje pohled Jakuba a Lukáše, klient laik zastupuje člověka, který playbook podepíše). Proto se složka jmenuje `perspectives/`, ne `experts/` (rozhodnutí `decisions/010`). Role jsou **data, ne postup**: postup, který je používá, je skill `examine-from-multiple-angles`.

## Dvě sady

**Byznys** — na strategii, rozhodnutí, experimenty a nápady:

| Role | Soubor | Čím se dívá |
|---|---|---|
| Business lead | `business-lead.md` | tržby, škálovatelnost, prodej, investovatelnost |
| HR a talent | `hr-talent.md` | trh práce v designu, hiring, motivace lidí |
| Produktový manažer | `product-manager.md` | hodnota pro uživatele, rozsah, priority |
| Tech lead | `tech-lead.md` | technická reálnost, náklady na stavbu a provoz |
| Výzkumník | `ux-researcher.md` | co o tom doopravdy víme a z čeho to plyne |

**Řemeslo** — na playbooky, specifikace a klientské materiály:

| Role | Soubor | Čím se dívá |
|---|---|---|
| Metodik | `methodologist.md` | je postup správně a obstojí v praxi |
| Designér nováček | `junior-designer.md` | dá se podle toho pracovat bez doptávání |
| Klient laik | `lay-client.md` | podepsal bych to a za co platím |
| Obchodník | `salesperson.md` | prodám to a obhájím cenu |
| Editor a korektor | `editor.md` | jak je to napsané, ne co je napsané |

## Jak je pustit

Skillem `examine-from-multiple-angles`, ve třech úrovních podle toho, kolik chceš rozhodovat:

1. **Nic neurčíš** — skill se podívá na materiál, navrhne sadu a jednou větou se zeptá. Nejběžnější případ.
2. **Určíš sadu** — „pusť byznys panel", „pusť řemeslo", „pusť všech deset".
3. **Vyjmenuješ role** — „jen metodika a klienta", „navíc tech leada". Nasadí přesně ty a nikoho jiného.

Panel má cenu, dokud jsou role nezávislé. Deset rolí na krátký text vrátí překrývající se názory a shoda mezi nimi přestane nést informaci; na úzkou otázku bývají dvě až tři role lepší než celá pětka.

## Přidání role

Nový soubor v této složce s anglickým názvem (kostra repa je anglicky, jméno role v tabulce česky), hlavička `**Sada:** byznys` nebo `**Sada:** řemeslo`, pak `## Perspektiva`, `## Klíčové otázky` a `## Varovné signály`. Doplň řádek do tabulky výše.
