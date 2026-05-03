// Vibe A — Minimal / Editorial
// Vibe: Linear, Apple, Framer. Tight typography, monochrom, jeden akcent (emerald).
// Hodně bílého místa, tenké linky, žádné gradienty.

import Link from "next/link";
import { Check, ChevronRight, Flame, Trophy } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  childName,
  credit,
  monthlyBonus,
  myTasksCount,
  poolCount,
  streak,
  todayChecks,
} from "../_data";

export default function VibeA() {
  const doneCount = todayChecks.filter((c) => c.done).length;
  const total = todayChecks.length;

  return (
    <main className="mx-auto max-w-md space-y-10 px-5 pt-8 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Pondělí · 4. května
          </div>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">
            Ahoj, {childName}.
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/lab"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            ← lab
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Streak — minimalist */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b pb-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Řada
          </span>
          <span className="text-[11px] text-muted-foreground tabular-nums">
            nejdelší {streak.longestStreak}
          </span>
        </div>
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <Flame className="size-5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-6xl font-light tabular-nums tracking-tight">
              {streak.days}
            </span>
            <span className="text-sm text-muted-foreground">
              {streak.days < 5 ? "dny" : "dnů"}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Tier
            </div>
            <div className="text-lg font-semibold">{streak.tier}</div>
          </div>
        </div>
        <div className="h-px w-full bg-foreground/10">
          <div
            className="h-px bg-emerald-600 dark:bg-emerald-400"
            style={{ width: `${((streak.days - 7) / (30 - 7)) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground tabular-nums">
          <span>Silver · 7</span>
          <span>za 13 dnů → Gold</span>
          <span>Gold · 30</span>
        </div>
      </section>

      {/* Bonus */}
      <section className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Bonus tento měsíc
          </span>
          <span className="text-[11px] text-muted-foreground">
            {monthlyBonus.misses}× zaváhání
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-light tabular-nums">
            {monthlyBonus.current}
          </span>
          <span className="text-sm text-muted-foreground">Kč</span>
          <span className="ml-auto text-xs text-muted-foreground">
            z {monthlyBonus.full} Kč
          </span>
        </div>
      </section>

      {/* Dnešní kompetence */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between border-b pb-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Dnes · {doneCount}/{total}
          </span>
        </div>
        <ul className="divide-y">
          {todayChecks.map((c) => (
            <li
              key={c.id}
              className="flex items-center justify-between py-3"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex size-5 items-center justify-center rounded-full border ${
                    c.done
                      ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-black"
                      : "border-foreground/30"
                  }`}
                >
                  {c.done && <Check className="size-3" strokeWidth={3} />}
                </div>
                <span
                  className={
                    c.done ? "text-muted-foreground line-through" : ""
                  }
                >
                  {c.label}
                </span>
              </div>
              {!c.done && (
                <ChevronRight className="size-4 text-muted-foreground/50" />
              )}
            </li>
          ))}
        </ul>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-2 gap-3">
        <Link
          href="#"
          className="rounded-lg border p-4 transition hover:border-foreground/40"
        >
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Pool
          </div>
          <div className="mt-1 text-2xl font-light tabular-nums">
            {poolCount}
          </div>
          <div className="text-xs text-muted-foreground">k vybrání</div>
        </Link>
        <Link
          href="#"
          className="rounded-lg border p-4 transition hover:border-foreground/40"
        >
          <div className="text-[11px] uppercase tracking-widest text-muted-foreground">
            Mé úkoly
          </div>
          <div className="mt-1 text-2xl font-light tabular-nums">
            {myTasksCount}
          </div>
          <div className="text-xs text-muted-foreground">rozpracované</div>
        </Link>
      </section>

      {/* Kredit summary */}
      <section className="space-y-3 border-t pt-6">
        <div className="flex items-baseline justify-between">
          <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Kredit
          </span>
          <Link
            href="#"
            className="text-[11px] text-muted-foreground hover:text-foreground"
          >
            historie →
          </Link>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-4xl font-light tabular-nums">
            {credit.balanceCzk}
          </span>
          <span className="text-sm text-muted-foreground">Kč</span>
          <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 tabular-nums">
            +{credit.weeklyEarnedCzk} Kč týden
          </span>
        </div>
      </section>

      {/* Trophy hint */}
      <Link
        href="#"
        className="flex items-center justify-between border-t pt-6 group"
      >
        <div className="flex items-center gap-3">
          <Trophy className="size-4 text-muted-foreground" />
          <div>
            <div className="text-sm font-medium">Trofeje</div>
            <div className="text-xs text-muted-foreground">
              2 získané · další za 13 dnů
            </div>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground/50 group-hover:translate-x-1 transition" />
      </Link>
    </main>
  );
}
