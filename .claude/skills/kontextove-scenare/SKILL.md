---
name: kontextove-scenare
description: Použij, když se v Homeworks mají psát nebo upravovat kontextové scénáře (Goodwinová, Goal-Directed Design) — před návrhem nové obrazovky nebo toku, při redesignu, nebo když Milan řekne „scénáře". Určuje formát `docs/design/RRRR-MM-DD-scenare.md`, tabulku potřeb a průchod návrhu scénáři.
---

# Kontextové scénáře (Homeworks)

Upravená kopie pravidel ze skillu `start-new-stream` v `2f-product` (Goodwinová, kapitola 12). Navazuje na `design-to-code` (D16): scénáře jsou první krok, bez nich se nekreslí.

## Co to je

Krátké vyprávění, půl stránky až stránka, o konkrétním člověku v konkrétní situaci: co ho spustí, co potřebuje, co dělá, čím to končí. Píše se z pohledu toho člověka, na úrovni „co se stane", ne „na co klikne". **Žádné obrazovky, tlačítka, záložky ani systémové operace.**

## Kolik

Jeden typický příklad každé **hlavní** činnosti každé role. Činnosti, které se dějí spolu, se slijí do jednoho scénáře. Nečasté činnosti (nastavení, správa kompetencí, jednorázové zavedení) scénář nemají, ledaže jsou dnes bolest.

Homeworks má dvě role: **dítě** (11–15 let, iPhone, PWA z plochy) a **rodič-admin** (Milan, Teri). Typicky 4–6 scénářů celkem.

## Z čeho

Z toho, co rodina skutečně dělá: Milanova znalost domácnosti, zkušenost z pilotu, dnešní rutina (ráno před školou, odpoledne po škole, večer, víkend). **Věta, kterou nemáš z čeho podložit, se označí *domněnka*** a Milan ji potvrdí nebo škrtne. Scénář nepopisuje, co by appka hezky uměla. Osnovu předkládá Claude, obsah doplňuje Milan — nepiš celé scénáře z hlavy.

## Formát souboru `docs/design/RRRR-MM-DD-scenare.md`

```markdown
# Kontextové scénáře — <téma>

**Datum:** · **Stav:** návrh / schváleno · **Role:** dítě, rodič

## Scénář 1: <kdo> <v jaké situaci>

<vyprávění>

**Kroky:** ① … ② … ③ …

| Věta ze scénáře | Datová potřeba | Funkční potřeba | Vlastnost nebo omezení |
|---|---|---|---|
| „Ráno v 7:40 odchází do školy a chce mít myčku z krku" | co má dnes ráno udělat | odškrtnout hotové rychle | jednou rukou, na odchodu, do 10 s |

## Co ze scénářů plyne pro návrh
(potřeby napříč scénáři, co se přetahuje)

## Průchod návrhem (vyplní se při schvalování návrhu v penu)
| Scénář | Začátek | Kroky | Konec | Kde se ověřuje | Díry |
```

**Potřeba se píše jako potřeba, ne jako řešení:** „vidět, co dnes ještě zbývá", ne „seznam checků nahoře".

## K čemu slouží dál

- Tok a obsah obrazovek (`struktura-a-tok`) se odvozují z tabulek potřeb; co nemá oporu ve scénáři, nemá důvod být na obrazovce.
- Návrh v penu se před schválením projde scénář po scénáři: kde člověk začne, co vidí, kolik kroků do cíle. Krok, který návrh neobslouží, je díra.
- Po nasazení jsou scénáře zkušební postup, který se projde rukou na telefonu.

## Kdy se nepíšou

Oprava, přebarvení, změna textu. Nová funkce buď zapadá do existujícího scénáře, nebo přináší novou hlavní činnost a scénář se doplní (vzácně).
