# Homeworks — talking points pro interní demo

Pomocný dokument pro 2026-05-04 prezentaci. Není pro veřejnost, není scenario k odříkávání slovo od slova — jen klíčové body, ať se na nic nezapomene.

---

## 1. Co je Homeworks (30 s)

Rodinný systém pro 5 lidí — Milan + Teri (rodiče) + 3 dcery (11, 14, 15). Nahrazuje magnetické tabule, Excel, WhatsApp výzvy „uklidíš pokoj?".

**Tři věci, které appka řeší:**
1. **Denní povinnosti** — každá holka má aktuální týden přiřazenou jednu **kompetenci** (Kuchyň / Obývák / Koupelna), v ní denní checky (ráno/večer/kdykoliv). Splnění = check, schválení = peníze.
2. **Pool úkolů** — extra úkoly nad rámec běžných povinností (vyluxovat schody, umýt okna). Jdou v rotační frontě, kdo je vezme dřív, ten je má. Po splnění schvaluje rodič.
3. **Kredit + obrazovka** — vše se převádí na Kč v balanci. Holka si může „koupit" čas u obrazovky (200 Kč/h) nebo si nechat vyplatit kapesné.

**Showcase URL pro live demo:** [`/showcase`](http://localhost:3000/showcase) → odtud Milan (admin) nebo Ani (dítě, den 47 streaku).

---

## 2. Proč jsme to postavili (1 min)

**Konkurence** (NeatKid, OurHome, FamilyApp) je generická pro malé děti. Pro 11/14/15letý holky to vypadá pohádkově, neoslovuje je. Žádná z nich nemá:
- screen time integraci proti kreditu
- rotaci kompetencí přes víc dětí
- měsíční bonus za bezchybný měsíc
- streak gamifikaci napříč měsíci

**Druhý důvod — náklady.** Komerční appky stojí 5–10 USD/měsíc per rodina. Naše řeší **0 Kč/měsíc TCO**:
- Vercel Hobby (free) — hosting
- Supabase Free (500 MB Postgres)
- GitHub Actions (free pro private repo, 2000 min/měsíc — používáme ~5 min/měsíc na cron)
- Resend (free tier, 3000 mailů/měsíc — admin digest)

**Třetí důvod — kontrola.** Konkurence neukáže důvod, proč zamítla úkol. Naše ano. Konkurence uloží data v US cloudu. Naše má vše v EU (Supabase Frankfurt).

---

## 3. Klíčový feature: Streak gamifikace (1 min)

Tohle byla **změna v1.1** po brainstormu s Teri. v1 měla binární „1 zaváhání = 0 Kč" měsíční bonus — pro 11letou Aničku tvrdé, po prvním slipu už nebylo o co bojovat.

**Hybrid řešení:**
- **Gradient bonus** — 200 / 150 / 100 / 50 / 0 Kč podle počtu zaváhání. Vždycky je o co bojovat.
- **Streak counter** — jako Duolingo, počítá po sobě jdoucí dny APPROVED. Běží napříč měsíci, padá při MISSED/REJECTED.
- **Tier rank** — Bronze → Silver → Gold → Platinum → Diamond → Master (0/7/30/60/100/365 dnů).
- **Trofejní milníky** — 6 odznaků, opakovatelné per cyklus. Iron Will (7 d), Steady (14 d), Flawless Month (30 d, +100 Kč), Unbreakable (60 d, +200 Kč), Centurion (100 d, +500 Kč), Legend (365 d, +2000 Kč).

Vizuál inspirován Strava + Apple Fitness — fitness app aesthetic. Pro 14/15letý holky prý „cool".

---

## 4. Jak jsme to dělali — methodology (2-3 min, hlavní bod prezentace)

**Tohle není vibe coding.** Specification-oriented development na 5 dokumentech v repu:

| Dokument | Co obsahuje | Kdy se používá |
|---|---|---|
| `PRD.md` | 617 řádků — produktová specifikace, role, sitemap, feature spec, edge cases | nejdřív, jako brief |
| `DECISIONS.md` | 13 architektonických rozhodnutí D1–D13 (cron strategy, DB provider, design system, RLS…) | průběžně, **přepisuje PRD při rozporu** |
| `IMPLEMENTATION_PLAN.md` | 7 milestonů M0–M7 s odhady času, krokama, definicí hotovo | při kódování |
| `LAUNCH_CHECKLIST.md` | 138 řádků toho, co musí udělat člověk (PWA ikony, ENV, reálná data, Supabase RLS…) | před deployem |
| `CLAUDE.md` | Routing layer pro AI — kam koukat, jaký workflow | každá Claude session |

**Postup:**
1. **Brainstorming** — Milan + Teri sedli v lednu, 2 dny diskutovali co appka má dělat, sepsali požadavky do PRD
2. **Design Lab** — pro každou klíčovou feature 2–4 mockupy stylů (např. „šnek/plamínek/strom" pro streak; „Linear/Strava/Discord" pro vibe), uživatel vybírá
3. **Architektonická rozhodnutí** — kde se objeví trade-off (Vercel Cron vs GitHub Actions, next-themes vs custom), zapíše se DECISIONS.md před implementací
4. **Implementation plan** — bite-sized tasky, každý 2–5 minut, TDD kde to dává smysl
5. **AI execution** — Claude Code jako pair programmer. Subagent-driven: pro každý task čerstvý subagent s plnou izolací kontextu, hlavní session koordinuje a reviewuje
6. **Verifikace** — typecheck + 87 unit testů + curl smoke + scan dev logu po každém commitu

**Klíčová pointa pro publikum:** AI nepředchází specifikaci, **specifikace předchází AI**. Bez ní vibe coding generuje kód, který v čase shnije. S ní AI pracuje jako disciplinovaný junior, který nepřidává features mimo plán a nepředělává to, co rozhodlo.

**Konkrétní příklad z této session:** přidání streak gamifikace (v1.1) trvalo ~4 hodiny. Brainstorming → 4 design vibes → schválení → 27 tasků → implementace. Bez plánu by to byl týden.

---

## 5. Tech stack (1 min, rychlý přejezd)

| Vrstva | Volba | Důvod |
|---|---|---|
| Framework | **Next.js 16 (App Router, Turbopack)** | Server Components — méně klient JS, rychlejší start |
| UI | **React 19, Tailwind 4, shadcn/ui** (preset Sera/Mauve/Purple/Lime) | shadcn = vlastníme zdroják, žádný vendor lock-in |
| Font | **Source Sans 3** (z presetu) | čitelný napříč věkem |
| DB | **Postgres** přes **Supabase** (free tier) | EU region, Prisma kompatibilní |
| ORM | **Prisma** | TypeScript-first, schema migrations |
| Auth | **Custom PIN auth** (žádný OAuth/Auth0) | rodinná appka, 4místný PIN per profil, jednoduché |
| Cron | **GitHub Actions** → Vercel endpoint (D1) | Vercel Hobby cron limity (2× denně) nestačí; GH Actions free pro 12 cronů různé frekvence |
| E-mail | **Resend** (admin digest 2× denně) | nejlevnější s decentním DX |
| Testy | **Vitest** (87 testů pure logiky) | rychlé, žádný DB mock potřebný — pure logika je v `-pure.ts` modulech |
| State management | **Žádný** | RSC + server actions stačí |
| Hosting | **Vercel Hobby** | 0 Kč, automatický deploy z `main` |
| PWA | manifest.json + offline icons | „Add to Home Screen" na iOS/Android |

**Co tam ÚMYSLNĚ není:** Redux/Zustand (žádná globální klientská state), tRPC (server actions stačí), GraphQL (overengineered), Auth.js (žádný OAuth), pino/winston (Vercel logs stačí), Cypress/Playwright (manuální smoke 5 uživatelů).

---

## 6. Čísla pro slide

- **5 uživatelů** (1 admin pár + 3 dcery)
- **6 milestonů (M0–M5)** dodáno v původním v1
- **+1 milestone (M7)** v této session pro v1.1
- **21 commitů** v v1.1 sprintu
- **87/87 testů** zelených
- **12 cron endpointů** orchestrovaných GitHub Actions
- **17 DB tabulek**
- **0 Kč/měsíc** provozní náklady
- **2-3 hodiny** Milanovy práce mimo Claude k ostrému launch (ENV, ikony, reálná data, smoke)

---

## 7. Co dál (30 s)

- **2026-05-04 (zítra):** PWA ikony, Vercel ENV, GitHub Actions secrets, reálná data v seed, Vercel preview smoke
- **2026-05-05 ostrý launch:** push do `main`, holky dostanou PIN, zkušební měsíc
- **2026-08 retrospektiva:** co fungovalo / co ne, v2 kandidáti (Web Push, pause režim, foto proof)

---

## 8. Tipy pro samotnou prezentaci

- **Nemluvit o frameworcích.** Publikum je interní (kolegové z práce), nikdo nechce slyšet „React 19 RSC". Zaobalit do důvodů.
- **Začít se streakem.** Holky mají 47 dnů streak ⇒ otevři `/showcase/ani` ⇒ ukaz tier rank ⇒ řekni „nesmí zlomit řadu, takže si appku otevírají denně".
- **Pak admin.** Otevři `/showcase/milan` ⇒ Inbox ⇒ řekni „rodič jedním kliknutím schválí, holka dostává peníze".
- **Methodology je zlatý bod.** Nikdo z kolegů pravděpodobně nezavedl spec-oriented dev s AI. Tohle je tvoje USP.
- **Ne-omluvit se za "jen pro rodinu".** Je to ostrý systém pro 5 lidí, který fakt provozuješ. To je víc než většina demo aplikací co kdo ukazuje.

---

## 9. Možné otázky publika

**Q: Proč jsi to nestavěl jako standardní apku z storu?**
A: Žádná řešení neměla rotaci kompetencí + screen time proti kreditu + měsíční bonus. Ani jedna nepasovala na 5 lidí v EU za 0 Kč/měsíc.

**Q: Co když AI něco zkurví?**
A: Cron změny mají rollback (git revert + Vercel redeploy). Schema změny mají SQL rollback (ALTER TABLE … DISABLE RLS). Pure logika má 87 testů. Neplánujeme žádný feature bez DECISION záznamu.

**Q: Bezpečnost dat?**
A: Postgres v EU (Supabase Frankfurt). Row-Level Security zapnuté. Hesla jsou bcrypt-hashed PINy. Žádná telemetrie, žádná third-party JS knihovna co by „call home".

**Q: Použil bys to v práci na klientském projektu?**
A: Methodology ano. Konkrétní stack závisí na klientovi. Klíčové je: spec → decisions → plan → execute, AI jako disciplinovaný junior s plánem, ne improvizující senior.

**Q: Kolik času ti to celkem zabralo?**
A: v1 (M0–M6) cca 3 týdny po večerech. v1.1 (streak gamifikace + design pass + admin formy + showcase) za 1 odpoledne. Důvod toho rozdílu: spec a designové rozhodnutí byly pevné, AI mohlo plán mechanicky exekuovat.
