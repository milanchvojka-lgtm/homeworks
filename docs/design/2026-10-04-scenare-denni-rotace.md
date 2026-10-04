# Kontextové scénáře — denní rotace a kuchyň do 17:00 (D32)

**Datum:** 2026-10-04 · **Stav:** návrh · **Role:** dítě, rodič

Nahrazují scénáře 1 a 2 z `2026-09-26-scenare.md`. Ty předpokládají kuchyň na celý týden a večerní kuchyň u dítěte, což po D32 neplatí. Scénáře 3–13 platí dál.

---

## Scénář 1: Dítě ráno zjistí, co má dnes na starosti

Je úterý ráno, dvanáctiletá snídá a za deset minut odchází do školy. Včera měla obývák, dnes je to jinak, protože se role mění každý den. Do appky se sama od sebe moc nedívá. Otevře ji, až jí přijde upozornění, že dnes má kuchyň do pěti (Milan 2026-10-04: „asi když jim pošleme notifikaci“). Když má kuchyň, ví, že musí být doma s předstihem před pátou. Když má obývák nebo prádlo, má čas do večera.

**Kroky:** ① přijde upozornění s dnešní rolí ② otevře appku ③ zjistí dnešní roli a do kdy ji má hotovou

| Věta ze scénáře | Datová potřeba | Funkční potřeba | Vlastnost nebo omezení |
|---|---|---|---|
| „Včera měla obývák, dnes je to jinak" | dnešní role dítěte | poznat dnešní roli na první pohled | mění se každý den, nesmí se plést se včerejškem |
| „Musí být doma s předstihem před pátou" | termín role (17:00 / konec dne) | vidět, do kdy to má hotové | rozdíl mezi „do 17:00" a „do večera" musí být zřejmý |
| „Otevře ji, až jí přijde upozornění" | dnešní role a termín | dozvědět se roli bez otevření appky | upozornění včas před termínem kuchyně |

---

## Scénář 2: Dítě s kuchyní odpoledne po škole

V 15:30 přijde ze školy. Táta po obědě zapnul myčku, takže je teď umytá. Do pěti má holka vyndat a uklidit nádobí, utřít linku, vysypat koše, odnést skleničky, tašky a potraviny, které se na lince nahromadily, a uklidit stůl, aby se dalo vařit a večeřet. Pak chce nahlásit, že je hotovo, a mít klid. Ví, že kuchyň je jediná věc s termínem, a když nestihne pátou, máma nemá kde vařit. Když jí rodič něco vrátí, chce vědět proč.

**Kroky:** ① otevře appku ② vidí, co přesně ke kuchyni patří ③ nahlásí hotovo ④ vidí, že na dnešek nic nevisí, nebo co jí rodič vrátil a proč

| Věta ze scénáře | Datová potřeba | Funkční potřeba | Vlastnost nebo omezení |
|---|---|---|---|
| „Do pěti má…" | povinnost s termínem 17:00, kolik zbývá času | vidět, jak moc spěchá | upozornění blízko termínu (D18 už umí) |
| „Vyndat a uklidit nádobí, utřít linku, koše, skleničky…" | co všechno patří do kuchyně | vědět, co se po ní čeká, bez dohadů | seznam položek, ne jeden vágní pokyn |
| „Nahlásit, že je hotovo, a mít klid" | stav dne | nahlásit jedním krokem, poznat, že nic nevisí | jako dnes (posuvník) |
| „Když jí rodič něco vrátí, chce vědět proč" | vrácené povinnosti + poznámka | všimnout si vráceného | vrací se jen dnešní povinnosti (Milan 2026-10-04) |

---

## Scénář 3: Rodič odpoledne potřebuje vědět, kdo má dnes kuchyň

Je 16:40 a máma chce začít vařit. Kuchyň uklizená není a ona neví, která z holek ji dnes má. Dřív to věděla, protože kuchyň měla jedna holka celý týden. Teď se to mění každý den a nechce to počítat z hlavy. Chce rychle zjistit, kdo kuchyň dnes má a jestli už nahlásila hotovo, aby věděla, koho zavolat.

**Kroky:** ① otevře appku ② zjistí, kdo má dnes kterou roli ③ vidí, jestli je kuchyň nahlášená

| Věta ze scénáře | Datová potřeba | Funkční potřeba | Vlastnost nebo omezení |
|---|---|---|---|
| „Neví, která z holek ji dnes má" | dnešní rozpis rolí (kdo má co) | zjistit to bez počítání | na jeden pohled, ne v detailu každého dítěte |
| „Jestli už nahlásila hotovo" | stav dnešní kuchyně | poznat, jestli čeká na schválení, nebo není hotová | — |
| „Koho zavolat" | jméno dítěte | — | — |

---

## Scénář 4: Dítě s kuchyní je pryč

Nejstarší je od středy do neděle na škole v přírodě. Rodič to zadal do appky jako nepřítomnost (D24). Ve čtvrtek by měla kuchyň ona, takže ten den odpolední kolo neudělá žádná holka a udělá ho táta. Dopředu to počítat nepotřebuje. Stačí, když ten den uvidí, že kuchyň dnes nemá nikdo. Ostatní holky mají své role beze změny.

**Kroky:** ① rodič zadá nepřítomnost ② v ten den v rozpisu rolí vidí, že kuchyň nemá nikdo ③ udělá ji sám

| Věta ze scénáře | Datová potřeba | Funkční potřeba | Vlastnost nebo omezení |
|---|---|---|---|
| „Ten den udělá kolo táta" | role bez holky | poznat, že role je ten den neobsazená | nikdo ji automaticky nepřebírá (D24, D32) |

---

## Rozhodnuto (Milan 2026-10-04)

1. **Výměna rolí** mezi holkami se řeší ústně, appka ji neumí.
2. **Do appky** holky přivede upozornění s dnešní rolí.
3. **Dopředu** nic: ani zítřejší role pro dítě, ani rozpis na víc dní pro rodiče. Rotaci si časem zapamatují.
4. **Víkend:** kuchyň do 17:00 platí i v sobotu a v neděli.
5. **Vracení:** rodič vrací jen dnešní povinnosti.

## Co ze scénářů plyne pro návrh

- Dnešní role je hlavní informace dne a mění se denně. Dítě ji musí poznat okamžitě.
- Termín je vlastnost role: kuchyň do 17:00, zbytek do konce dne.
- Rodič potřebuje dnešní rozpis rolí na jeden pohled, ne po dětech.
- Role bez holky (nepřítomnost) musí být pro rodiče vidět v dnešním rozpisu.
- Upozornění s dnešní rolí je vstup do appky pro dítě. Náhled na zítřek ani rozpis dopředu se nedělá.

## Průchod návrhem (vyplní se při schvalování návrhu v penu)

| Scénář | Začátek | Kroky | Konec | Kde se ověřuje | Díry |
|---|---|---|---|---|---|
