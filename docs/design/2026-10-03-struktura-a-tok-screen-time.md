# Screen time z iOS — struktura a tok

**Datum:** 2026-10-03 · **Stav:** schváleno 2026-10-03 — varianta **B**, „Zrušit“ ano · **Podle:** D30, scénář 5 (`2026-09-26-scenare.md`, krok ④ „zapíše obrazovku, o kterou se žádalo mimo appku“)

## Situace (Milan 2026-10-03)

Holce dojde čas, v iOS ťukne „Požádat o další čas“. Rodiči přijde SMS / push z iOS, skoro vždycky schválí 15 min nebo 1 h. Appka o tom neví. Rodič to chce mít zapsané **hned v tu chvíli**, na pár ťuknutí, a holka má vědět, že ji to stálo peníze.

## Potřeby

| Kdo | Potřeba | Odkud |
|---|---|---|
| Rodič | zapsat 15 min / 1 h vybranému dítěti na co nejméně ťuknutí | D30 |
| Rodič | nespadnout na „málo kreditu“ — čas už dal | D30 |
| Rodič | vidět, že se to uložilo (a co, komu) | — |
| Dítě | dozvědět se hned, že ji to stálo (push) | D30 |
| Dítě | vidět, co si tento týden vzala a za kolik | D30 |
| Dítě | vědět, že je v mínusu a že se to odečte z výplaty | D30 |

## Co se přetahuje / odchází

- **Odchází u dítěte:** „Můžeš si zahrát X“, výběr 30/60/90, „Požádat“, karta „Čeká na rodiče“, hláška o zamítnutí.
- **Odchází u rodiče:** položka screen time v Schválit (žádosti už nevznikají), „Zapsat obrazovku“ v detailu dítěte (D19).
- **Hlídat duplicitu:** součet minut za týden už je v hlavičce dítěte (StatusTiles „Screen time: 30 min“). Přehled na záložce ho **neopakuje**, ukazuje jednotlivé zápisy.

## Tok — rodič

### Varianta A: tlačítko na Schválit — zamítnuto 2026-10-03

1. Rodič schválí čas v iOS, otevře appku → je na **Schválit** (výchozí záložka).
2. Nahoře vidí řádek-tlačítko **„Zapsat screen time“** (ikona `monitor-play`), pod ním to, co čeká na schválení (nebo „Nic nevisí“).
3. Ťukne → podstránka **Zapsat screen time** (zpět šipkou): přepínač **15 min · 1 h**, tři dlaždice **Ani · Neli · Emi** (jméno + barva + kredit), **Uložit** (neaktivní, dokud není vybráno obojí).
4. Uloží → vrátí se na Schválit, nahoře potvrzení „Zapsáno: Neli 15 min, −50 Kč“.

Ťuknutí: 1 (tlačítko) + 2 (volby) + 1 (Uložit) = **4**. Záložky zůstávají 4.

### Varianta B: vlastní záložka — schváleno 2026-10-03

1. Rodič schválí čas v iOS, otevře appku, ťukne na záložku **Screen time** (5. záložka, mezi Děti a Výplaty).
2. Rovnou vidí zápis: **15 min · 1 h**, dlaždice **Ani · Neli · Emi**, **Uložit**.
3. Pod formulářem **„Tento týden“**: zápisy všech dětí (kdo, kdy, kolik, za kolik), poslední nahoře.
4. Uloží → formulář se vyprázdní, nový zápis naskočí nahoru do seznamu.
5. Omyl: u dnešního zápisu ťukne **Zrušit** → zápis zmizí, kredit se vrátí, dítěti přijde push.

Ťuknutí: 1 (záložka) + 2 + 1 = **4**. Navíc přehled zápisů na jednom místě. Cena: 5. záložka v liště (iOS běžně unese 5).

## Tok — dítě

1. Přijde push „Táta ti zapsal 15 min, −50 Kč“. Ťuknutí otevře záložku **Screen time**.
2. Vidí seznam zápisů **tento týden**: den a čas, 15 min / 1 h, −50 Kč, kdo zapsal.
3. Když je kredit v mínusu: částka je červeně v dlaždici hlavičky (−150 Kč), pod ní upozornění bez čísla „Jsi v mínusu. Dluh se odečte z nedělní výplaty. Co nestačí, přejde do dalšího týdne.“ (HWS · 03b)
4. Prázdný stav (nic tento týden): `EmptyState` neutral, „Tento týden nic“ + „Čas u obrazovky si řekneš v iPhonu, tady uvidíš, kolik tě stál.“

## Odpovědi (Milan 2026-10-03)

1. Varianta **B**.
2. **Zrušit** u dnešního zápisu ano.
3. Dlaždice dítěte: „kredit 380 Kč“ se nevešel — kredit jen jako částka na vlastním řádku, dlaždice vyšší.
