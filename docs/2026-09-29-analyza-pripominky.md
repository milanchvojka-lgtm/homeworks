# Analýza: připomínky, aby děti nezapomínaly odškrtat

**Datum:** 2026-09-29 · **Stav:** rozhodnuto 2026-09-29 → **D28** (A + B před launchem, `web-push` schválen, časy potvrzené, push i rodičům) · **Souvisí:** D3 (e-mail digest, push mimo v1), D18 (termín povinnosti), D25 (zkušební týden), LAUNCH_CHECKLIST §8

## 1. Problém

Milan: „považuju to za klíčovou funkci, bez který ten launch může selhat = děti budou zapomínat, že mají odškrtávat.“

- Nenahlášená povinnost po půlnoci propadne (`MISSED`): padá řada a z měsíčního bonusu se strhává. Scénář 7 (`docs/design/2026-09-26-scenare.md`) má jako nejčastější příčinu sporu „udělala, ale zapomněla nahlásit“.
- Dnes dítě o čekající povinnosti ví jen z badge ve spodní navigaci. Tu uvidí, jen když appku samo otevře, takže na zapomínání nepomáhá.
- Rodiče dostávají e-mailový souhrn, jen když dítě něco **odeslalo**. O tom, co dítě **neodeslalo**, se nedozví nikdo.

Samotné číslo na ikoně je pasivní, dítě má na telefonu čísla na desítkách appek. Nejvíc by měla pomoct **připomínka ve správnou chvíli, jen když ještě něco zbývá**, například „Zbývá odškrtnout: Kuchyň (do 17:00)“. Číslo na ikoně je doplněk k ní.

## 2. Co iPhone umí (stav 2026, zdroje na konci)

- **Web Push** funguje od iOS 16.4, ale jen u appky přidané na plochu (manifest `display: standalone`, to už máme). V EU funguje (Apple odstranění z iOS 17.4 vzal v březnu 2024 zpět).
- **Povolení** musí dítě ťuknout samo, například na tlačítko „Zapnout připomínky“. Nejde vyžádat automaticky při otevření.
- **Tichý push není.** Každý push musí zobrazit notifikaci, jinak iOS po pár pokusech odběr zruší.
- **Číslo na ikoně** (`setAppBadge`) jde nastavit při otevřené appce a v service workeru při příchodu pushe. Změna čísla bez notifikace v praxi nejde. Číslo tedy přijde vždy spolu s připomínkou.
- **Naplánovat notifikaci na telefonu nejde.** Web appka si nemůže sama nastavit „v 19:00 připomeň“. Každou připomínku musí poslat server, u nás cron.
- **Rizika:** vývojáři hlásí, že odběry na iOS občas samy odumřou po 1–2 týdnech. Proto odběr při každém otevření appky obnovit a mrtvé odběry (410) mazat.
- **Čas u obrazovky u dětí:** v klidovém režimu (Downtime) notifikace nechodí, pokud appka není ve „Vždy povolených“. U web appky z plochy to není jisté, **musí se vyzkoušet na telefonu holky**. Známá chyba: se zapnutým „Omezit weby pro dospělé“ web appky se service workerem nefungují.

## 3. Varianty

| | Co chytí | Náročnost | Nová závislost | Slabiny |
|---|---|---|---|---|
| **A. Push připomínky dětem + číslo na ikoně** | dítě dostane připomínku, jen když něco zbývá, a vidí počet na ikoně | ~2 dny kódu + test na reálných iPhonech + návrh obrazovky povolení v pen (D16) | `web-push` (nebo varianta bez závislostí, ale pracnější) | povolení může dítě odmítnout; odběr může odumřít; klidový režim |
| **B. Večerní e-mail rodičům „co děti ještě neodeslaly“** | rodič ve 20:00 vidí, že Ani ještě nenahlásila Kuchyň, a připomene jí to ústně | pár hodin, stojí na dnešním Resendu a cronu | žádná | spoléhá na rodiče; nefunguje, když nejsou doma |
| **C. Připomínka v appce Připomínky / budík na telefonu dítěte** | pevná denní připomínka, nastaví se při spuštění naživo | nula kódu | žádná | připomíná i po odškrtnutí, dítě ji rychle začne ignorovat |
| D. Jen číslo na ikoně, bez push | — | — | — | obnoví se jen při otevření appky, na zapomínání nepomůže. **Zamítnout.** |

### Jak by vypadala varianta A

- **Odběr:** tabulka `PushSubscription` (uživatel, zařízení, endpoint, klíče, poslední úspěch). Jeden uživatel může mít víc zařízení. Při odhlášení se neruší odběr v prohlížeči, jen řádek na serveru.
- **Povolení:** nabídnout v uvítání (D25) jako poslední krok („Zapnout připomínky“) a trvale v záložce Já (zapnuto / vypnuto / zablokováno v Nastavení iOS s návodem).
- **Kdy připomínat** (návrh, rozhoduje Milan):
  - 60 min před termínem povinnosti (D18), pokud ji dítě ještě neodeslalo,
  - večer (např. 19:30) souhrn všeho, co zbývá,
  - poslední šance (např. 21:30),
  - vrácená povinnost (`REJECTED`): hned „Rodič ti vrátil Kuchyň: …“.
  - Nic, když je dítě nepřítomné (D24) nebo má všechno odeslané.
- **Odesílání:** nový krok v existujícím 15minutovém cronu (`admin-digest` a `claim-timeout` už tam jsou). Log odeslaných připomínek, aby se nic nepřipomnělo dvakrát ani při dvojím běhu cronu (D21). GitHub Actions občas zpozdí cron o desítky minut, na připomínky to stačí.
- **Číslo na ikoně** = počet dnešních neodeslaných povinností. Nastaví se v každé připomínce a při každém otevření appky, po odeslání poslední povinnosti se smaže.
- **Rodiče:** stejná infrastruktura umí i push rodičům („Ani odeslala Kuchyň“). E-mail podle D3 zůstává, push rodičům je volitelný bonus.
- **Test:** push jde vyzkoušet jen přes HTTPS a na appce z plochy, takže na preview nebo produkčním deployi a na telefonech holek. Cron připomínek patří do `npm run test:sim` (větší změna podle SKILL.md).

## 4. Doporučení

**Před launchem udělat A + B, C nechat jako zálohu na večer spuštění.**

- A je jediná varianta, která dítěti připomene samo a jen tehdy, když to potřebuje. Bez ní stojí celé pravidlo „propadne o půlnoci“ na paměti dvanáctiletého dítěte.
- B je levná pojistka pro dítě, které povolení odmítne nebo mu odběr odumře. Zároveň je to jediný způsob, jak se rodič dozví o **neodeslaném**, ne jen o odeslaném.
- Zkušební týden (D25) dává prostor doladit časy připomínek naostro bez ztráty řady a bonusu.
- Launch se tím posune zhruba o 2–3 dny (kód, návrh obrazovky povolení v pen, test na telefonech).

Postup podle CLAUDE.md: rozhodnutí zapsat jako **D28** (push připomínky dětem v rozsahu v1, D3 a PRD §4.11 / §7 se upraví), pak pen, pak kód.

## 5. Otázky na Milana

1. Jdeme do A + B před launchem, nebo jen B + C a A až po launchi?
2. Souhlas s novou závislostí `web-push` (standard, používá ho i oficiální návod Next.js)?
3. Časy připomínek: sedí „60 min před termínem, 19:30, 21:30“? **Kdy holkám začíná klidový režim** v Čase u obrazovky? Po jeho začátku připomínky nedorazí.
4. Mají holky zapnuté „Omezit weby pro dospělé“? Kvůli známé chybě iOS to musíme vyzkoušet hned.
5. Push i rodičům, nebo jim stačí e-mail?

## Zdroje

- WebKit, Web Push pro web appky na iOS: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/
- WebKit, Declarative Web Push (iOS 18.4+): https://webkit.org/blog/16535/meet-declarative-web-push/
- Next.js, návod na PWA a push: https://nextjs.org/docs/app/guides/progressive-web-apps
- MDN, `setAppBadge`: https://developer.mozilla.org/en-US/docs/Web/API/Navigator/setAppBadge
- Notification Triggers (neimplementováno v Safari): https://developer.chrome.com/docs/web-platform/notification-triggers
- Odumírání odběrů na iOS (hlášení vývojářů): https://developer.apple.com/forums/thread/727372
- Chyba s „Omezit weby pro dospělé“: https://developer.apple.com/forums/thread/728426
- Klidový režim v Čase u obrazovky: https://support.apple.com/en-us/108806

## Odpovědi Milana (2026-09-29)

1. A + B před launchem.
2. `web-push` schválen.
3. Časy sedí, posílat jen když něco zbývá.
4. „Omezit weby pro dospělé“ holky zapnuté mají → první krok je ověření service workeru a pushe na jejich telefonu (plán 9.0).
5. Push i rodičům.
