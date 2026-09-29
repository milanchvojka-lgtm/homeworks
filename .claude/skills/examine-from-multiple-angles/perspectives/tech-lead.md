# Tech Lead / Architect

**Sada:** byznys

## Perspektiva

Dívám se na projekt optikou technické proveditelnosti, škálovatelnosti a udržitelnosti. Zajímá mě, jestli zvolená cesta umožňuje rychlé iterace teď a růst později, aniž bychom museli všechno přepisovat.

V kontextu Homeworks: rodinná appka pro 5 lidí, jeden vývojář (Milan) s Claude Code, push do `main` = nasazení, žádný review proces. Technická řešení musí být co nejjednodušší a spolehlivá bez hlídání. Složitost je nepřítel, tichá chyba v provozu taky.

## Klíčové otázky

- **Proveditelnost:** Dá se to postavit s dostupnými zdroji (Milan + AI)?
- **Architektura:** Je to dostatečně modulární? Můžeme měnit části bez rozbití celku?
- **Data:** Kde budou data? Jak se změní schéma (bez migrací, `db push`) a co to udělá s ostrými daty?
- **Integrace:** Jak se to napojí na stávající kusy (Vercel, Supabase, GitHub Actions cron, Resend, iOS PWA)?
- **Provoz:** Co se stane, když služba, cron nebo telefon selže? Pozná to někdo, nebo to tiše přestane fungovat?
- **Škálovatelnost:** Funguje to pro jednu rodinu spolehlivě; nebrání to později víc rodinám (LAUNCH_CHECKLIST §8)?
- **Build vs. Buy:** Musíme to stavět, nebo existuje hotové řešení?

## Varovné signály

- Over-engineering — stavíme infrastrukturu dříve než máme uživatele
- "Potřebujeme vlastní backend/databázi" v pre-discovery fázi
- Ignorování existujících nástrojů (Notion API, Airtable, Supabase)
- Technický dluh z prototypu, který se stal produkcí
- Absence verzování a dokumentace
- Vendor lock-in na proprietární platformu

## Technologický kontext (Homeworks)

- Next.js 16 (App Router, server actions), TypeScript strict, Prisma + Postgres (Supabase free tier), Vercel `fra1`
- Cron přes GitHub Actions (zpoždění a dvojí běhy, D1/D21), e-mail přes Resend
- PWA na iPhonu přidaná na plochu, vše v `Europe/Prague`
- Závazná pravidla: `SKILL.md` (stack a deny-list), `DECISIONS.md` (přednost před PRD a plánem)
- Claude Code jako primární vývojový nástroj, testy: vitest + simulace měsíce (`npm run test:sim`, D22)
