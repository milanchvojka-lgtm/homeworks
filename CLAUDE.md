# CLAUDE.md

> Tento soubor se automaticky načítá Claude Code v každé session. Slouží jako **routing layer** — neopakuje obsah ostatních dokumentů, jen řeže k nim cestu.

---

## První kroky v každé nové session

1. Načti [`SKILL.md`](./SKILL.md) — operating manual (jak pracovat).
2. Načti [`DECISIONS.md`](./DECISIONS.md) — architektonická rozhodnutí (přepisují PRD/plán při rozporu).
3. Otevři [`PRD.md`](./PRD.md) a [`IMPLEMENTATION_PLAN.md`](./IMPLEMENTATION_PLAN.md) podle toho, na čem se pracuje.
4. Pokud Milan řeší ostrý launch v1, načti [`LAUNCH_CHECKLIST.md`](./LAUNCH_CHECKLIST.md) — open items mimo kód (ENV, secrets, reálná data, ikony).
5. `git log --oneline -10` a `git status` pro orientaci, kde jsme.

Při rozporu má přednost: **DECISIONS > PRD > Plán**. Pokud něco není pokryté → zeptej se Milana, nehádej.

---

## Když v konverzaci padne nové architektonické rozhodnutí

**Závazný workflow** (nauč se z jednoho konkrétního průšvihu z 2026-04-26):

1. **Nejdřív zapiš rozhodnutí** jako nový záznam v [`DECISIONS.md`](./DECISIONS.md) (`D5`, `D6`, …) ve stejném formátu: rozhodnutí / důvod / důsledky.
2. **Patchni inline** dotčené sekce v `PRD.md` a `IMPLEMENTATION_PLAN.md`, ať fresh reader nemine změnu.
3. **Pak teprve** implementuj. Nikdy ne naopak.
4. Commit doc změny zvlášť od kódových změn (snazší code review a revert).

To samé platí pro otevřené otázky z `PRD.md §8`: jakmile padne odpověď, do `DECISIONS.md` jako nový záznam.

---

## Klíčové konvence (rychlý odkaz)

- **UI v češtině**, kód v angličtině (názvy, komentáře, commit messages). Detaily v `SKILL.md`.
- **Vše v `Europe/Prague` timezone** — viz `lib/time.ts` helpery.
- **Server actions** pro mutace, **API routes** jen pro `/api/cron/*`.
- **Žádné externí auth providery, žádný state management framework** — viz `SKILL.md` deny-list.
- **Cron přes GitHub Actions**, ne Vercel Cron — viz `DECISIONS.md` D1.
- **Commit konvence:** `<type>(scope): <message>` (např. `feat(m2): add daily check submission`).

---

## Memory — kde co žije

| Co | Kde | Kdo to čte |
|---|---|---|
| Architektonická rozhodnutí (long-term) | `DECISIONS.md` (v repu) | člověk i Claude |
| Produktové rozhodnutí | `PRD.md` (v repu) | člověk i Claude |
| Postup implementace | `IMPLEMENTATION_PLAN.md` (v repu) | člověk i Claude |
| Operating manual | `SKILL.md` (v repu) | Claude (primárně) |
| Launch open items (mimo kód) | `LAUNCH_CHECKLIST.md` (v repu) | člověk |
| Preference Milana napříč projekty | `~/.claude/projects/.../memory/` | Claude (auto memory) |
| Stav rozdělané práce v session | TaskList (in-context) | Claude |

**Pravidlo:** cokoli, co by mělo přežít session a co by měl číst i člověk — patří do repo dokumentů (typicky `DECISIONS.md`). Auto-memory je jen pro Claude-to-Claude preference.

---

## Co NEDĚLAT

- Neimplementuj kód dřív, než jsou docs aktualizované o čerstvá rozhodnutí.
- Nepřeskakuj milestony. M3 nezačíná, dokud M2 není deployed a otestovaný.
- Nezakládej PR review proces (Milan pracuje sám, push do `main`).
- Nepřidávej dependencies bez explicitního souhlasu (deny-list v `SKILL.md`).
- Nezakládej `*.md` dokumenty „pro pořádek“ mimo už definované — DECISIONS, PRD, plán a SKILL je celý okruh dokumentace pro v1.
