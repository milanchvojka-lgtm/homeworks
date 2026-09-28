# Brief: landing page Homeworks pro děti

**Datum:** 2026-09-28 · **Stav:** schváleno 2026-09-28 (D27) · **Kde se kreslí:** `_design/homeworks.pen` · **Sestra:** landing pro rodiče `docs/design/2026-09-28-landing-page-brief.md`, kód `/pro-rodice` (D26)

## 1 · Cíl a publikum

- **Publikum: děti 10–15 let**, které appku zatím nemají. Stránku jim typicky pošle rodič nebo kamarád, nebo ji najdou přes stránku pro rodiče.
- **Emoce (Milan):** „Wow, to chci, to chci okamžitě začít používat.“ Dítě má cítit, že je to **jeho** appka, ne rodičovský dozor v telefonu.
- **Hlavní akce (návrh):** dítě se nezapisuje samo. Výzva je **„Pošli to našim“** (sdílení odkazu na `/pro-rodice` přes sdílení v telefonu, nebo zkopírování odkazu). Od dítěte **nesbíráme žádné údaje** (žádný e-mail ani jméno), stejně jako appka (brief pro rodiče §3, Soukromí).

## 2 · Hlavní myšlenky (co dítě láká)

1. **Vlastní peníze, které si vydělá samo.** Placené úkoly s odměnou předem (Umýt okna 300 Kč, Umýt auto 450 Kč, Půdička 75 Kč), odhad času, vidí, kolik má.
2. **Screen time, o kterém rozhoduje samo.** Kupuje si ho z vydělaného (30 min za 100 Kč). Konec dohadování, kolik ještě smí: má to černé na bílém.
3. **Férovost.** Každý má svou oblast na týden, v pondělí se prostřídají. Nikdo nemůže říct „ona to minule nedělala“. Úkoly mají frontu mezi sourozenci.
4. **Hra: řada, trofeje, bonus.** Řada dní, trofeje (7, 14, 30 dní, pak 60, 100, 365), měsíční bonus. Vidí, jak roste.
5. **Méně připomínání od rodičů.** Když je hotovo, přejede prstem a je klid. (Týmovost z briefu pro rodiče §2 platí i tady: je to jeho díl v týmu, ne dřina navíc.)
6. **Start bez rizika:** první týden na zkoušku (nic neztratí) a **100 Kč do začátku**.

## 3 · Ověřená fakta (smí stránka tvrdit)

Stejná tabulka jako brief pro rodiče §3. Navíc pro dětskou stránku:

| Téma | Fakt |
|---|---|
| Trofeje | 🥉 7 dní, 🥈 14 dní, 🥇 30 dní (+100 Kč), 💎 60 dní (+200 Kč), 👑 100 dní (+500 Kč), ⚡ 365 dní (+2 000 Kč). Výchozí hodnoty ze `seed.ts`, rodič je může změnit. |
| Screen time | Volba po 30 min, cena podle rodiče (výchozí 200 Kč/h = 100 Kč za 30 min). Kredit nejde do mínusu. |
| Výplata | V neděli, co nepadne na screen time. |
| Přihlášení | Vlastní profil a vlastní PIN, i na sdíleném telefonu. |
| Co rodič vidí | Co dítě nahlásilo a vydělalo. Nic jiného z telefonu (appka nic nesleduje). |

**Nesmí slibovat:** vlastní měnu, kvízy jako hotovou věc (jen „připravujeme“), nic o tom, že appka hlídá telefon nebo blokuje aplikace (neumí to).

## 4 · Struktura (návrh, kratší než pro rodiče)

1. **Úvod:** nadpis v řeči dětí (např. „Vydělej si na screen time. Sám.“ / „Tvoje peníze. Tvůj čas. Tvoje pravidla hry.“), telefon s obrazovkou **Vydělat** (nabídka úkolů s odměnami), výzva „Pošli to našim“.
2. **Kolik si vyděláš:** 3–4 skutečné TaskCard s částkami, velké číslo „+825 Kč“ jako ukázkový týden (`[ZÁSTUPNÝ: skutečný týden z pilotu]`).
3. **Screen time podle tebe:** výběr 30/60/90 min, „za 300 Kč z tvého kreditu“.
4. **Férové pro všechny:** oblast týdne, rotace v pondělí, fronta úkolů.
5. **Řada a trofeje:** dlaždice řady, řada trofejí s odměnami, měsíční bonus.
6. **Jak to funguje:** 3 kroky (přejeď, až je hotovo → rodič schválí → peníze na účtu).
7. **Start:** týden na zkoušku + 100 Kč do začátku, vlastní PIN.
8. **Závěr:** „Chceš to taky? Pošli to našim.“ + drobný odkaz „Jsi rodič? → /pro-rodice“.

## 5 · Vizuální směr (návrh)

- Stejný design systém a tokeny (D15), ale **odvážnější**: víc růžové (`hw-pink` na velká čísla), větší čísla v Plex Mono (částky, minuty, dny), kratší věty, méně textu, víc ukázek z appky.
- Tykání, žádné „děti“ ve třetí osobě, žádný rodičovský tón („měl bys“).
- Fotky: bez tváří jako u rodičů, ale energičtější (ruce s telefonem, vydělané peníze, hotový úkol). Nebo úplně bez fotek, jen telefony: rozhodne Milan.

## 6 · Rozhodnuto (Milan 2026-09-28, D27)

1. Výzva **„Pošli to našim“** = sdílení odkazu na `/pro-rodice`. Souhlas.
2. Adresa **`/pro-deti`**, odkazy mezi stránkami oběma směry. Souhlas.
3. Tón **spíš cool, jazykem generace** (ne hravý). Nadpisy v §4 jsou jen pracovní, přepíšou se v penu.
4. **Fotky ano**, výběr nechává Milan na Claudovi (bez tváří, energičtější).
5. **Čísla z pilotu smíme použít** (skutečný týden holek).
