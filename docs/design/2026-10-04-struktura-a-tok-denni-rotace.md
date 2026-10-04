# Struktura a tok — denní rotace (D32, D33)

**Datum:** 2026-10-04 · **Stav:** schváleno 2026-10-04 (1A, 2A; 14:00 i o víkendu) · **Podle:** scénáře `2026-10-04-scenare-denni-rotace.md` 1–4

## Už rozhodnuto (pen, Milan 2026-10-04)

- **Dítě, Dnes:** řádek „DNES: KUCHYŇ A STŮL · 1 Z 3 HOTOVO“ + pruh po úsecích v barvě stavu (HWD · 02B). Počítají se nahlášené povinnosti, extra úkoly ne. Pod názvem povinnosti šedý detail (HWD · 01A, D33).
- **Dítě, Dnes, úkoly:** na Dnes jen úkol, se kterým má dítě něco udělat (rozdělaný s odpočtem, vrácený). Nahlášené a dnes schválené úkoly jen ve Vydělat → Moje úkoly. Mění bod A z `2026-09-27-dnes-ukoly-a-vypis-co-menime-co-ne.md`.
- **Badge Vydělat:** beze změny. Nabídka se započítá až po odeslání všech dnešních povinností (už dnes v `app/child/layout.tsx`).

## 1 · Upozornění s dnešní rolí (scénář 1)

Dnes chodí dítěti jen připomínky: „Blíží se termín“ 60 min před termínem (u kuchyně tedy v 16:00), „Ještě ti něco zbývá“ v 19:30 a „Poslední šance“ ve 21:30. Upozornění „co máš dnes“ neexistuje.

**Varianta A — jedno upozornění po škole pro každou holku.** Ve 14:00 přijde každé holce „Dnes máš Kuchyň a stůl · do 17:00“ (nebo „Dnes máš Obývák · do večera“). Holka, která už má všechno nahlášené, ho nedostane. V 16:00 pak u kuchyně přijde stávající „Blíží se termín“.
- ① 14:00 push s rolí → ② otevře Dnes, vidí roli a pruh → ③ udělá a nahlásí.
- Plus: každá holka ví, co má, i když roli zapomněla. Minus: jedno upozornění denně navíc.

**Varianta B — bez nového upozornění, jen stávající připomínky s názvem role.** Texty se doplní o roli: „Blíží se termín · Kuchyň a stůl do 17:00“, „Ještě ti zbývá Obývák“. Holka s kuchyní se o roli dozví v 16:00, ostatní v 19:30.
- Plus: žádné upozornění navíc. Minus: kuchyň se ozve až hodinu před termínem, kdy už může být pozdě (scénář 2: přijde v 15:30 a chce stihnout pátou).

*Otevřené pro A:* čas 14:00 sedí na všední dny. O víkendu stejný čas?

## 2 · Dnešní rozpis rolí pro rodiče (scénáře 3, 4)

Dnes rodič v záložce Děti vidí u každé holky jen „dnes zbývají 2 povinnosti“ nebo „dnes hotovo“. Kdo má co, nevidí.

**Varianta A — role v řádku dítěte (záložka Děti).** Podtitulek řádku: „Kuchyň a stůl · zbývají 2 z 3“, „Obývák · hotovo“. Když je role ten den bez holky (nepřítomnost), dole jeden řádek „Prádlo a koupelna · dnes nikdo (Neli pryč)“.
- ① otevře Děti → ② u každé holky vidí roli a stav → ③ klepne na holku, když chce detail.
- Plus: žádný nový prvek, jen bohatší řádek. Minus: rozpis je v záložce Děti, ne tam, kde rodič otevře appku (Schválit).

**Varianta B — karta „Dnes“ nahoře v záložce Schválit.** Tři řádky role → holka → stav (Kuchyň a stůl · Ani · 1 z 3, …), pod tím seznam ke schválení jako dnes.
- ① otevře appku (Schválit) → ② hned vidí rozpis → ③ schvaluje pod tím.
- Plus: rozpis na první obrazovce. Minus: Schválit přestane být čistý seznam ke schválení, stav dětí bude na dvou místech (Schválit i Děti).

## Doporučení

**1A + 2A.** Upozornění ve 14:00 přímo naplňuje „holky do appky přivede notifikace“. Rozpis v Dětech nepřidá nový prvek a neduplikuje stav dětí.
