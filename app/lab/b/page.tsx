// Vibe B — Playful / Sport
// Vibe: Strava, Apple Fitness, Duolingo. Gradient karty, glow ringy, větší typo, multi-color.

import Link from "next/link";
import { ChevronRight, Flame, Sparkles, Trophy } from "lucide-react";
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

export default function VibeB() {
  const doneCount = todayChecks.filter((c) => c.done).length;
  const total = todayChecks.length;
  const tierProgress = ((streak.days - 7) / (30 - 7)) * 100;

  return (
    <main className="mx-auto max-w-md space-y-5 p-4 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between px-1 pt-2">
        <div>
          <div className="text-xs text-muted-foreground">Pondělí · 4. 5.</div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Ahoj {childName}! 👋
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

      {/* Hero streak card */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-200/60 bg-gradient-to-br from-zinc-100 via-zinc-50 to-slate-100 p-6 shadow-sm dark:border-zinc-800/60 dark:from-zinc-800/40 dark:via-zinc-900 dark:to-zinc-950">
        <div className="absolute -right-10 -top-10 size-40 rounded-full bg-gradient-to-br from-zinc-300/40 to-transparent blur-3xl dark:from-zinc-400/20" />

        <div className="relative space-y-5">
          <div className="flex items-center gap-2">
            <Flame className="size-6 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
            <div className="flex items-baseline gap-1.5">
              <span className="text-5xl font-black tabular-nums tracking-tight">
                {streak.days}
              </span>
              <span className="text-base font-medium text-muted-foreground">
                dnů v řadě
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-white text-3xl shadow-md ring-4 ring-zinc-300/60 dark:bg-zinc-900 dark:ring-zinc-600/40">
              🥈
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Current Tier
              </div>
              <div className="text-xl font-extrabold tracking-tight">
                {streak.tier.toUpperCase()}
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Next
              </div>
              <div className="text-xl font-extrabold tracking-tight text-amber-600 dark:text-amber-400">
                GOLD
              </div>
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex justify-between text-xs">
              <span className="font-medium tabular-nums">
                {streak.days} / 30
              </span>
              <span className="text-muted-foreground">za 13 dnů</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-zinc-400 via-zinc-500 to-amber-500"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bonus card */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Sparkles className="size-3.5" />
              Bonus tento měsíc
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tabular-nums">
                {monthlyBonus.current}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Kč
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {monthlyBonus.misses}× zaváhání · z {monthlyBonus.full} Kč
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={`size-2.5 rounded-full ${
                  i < 4 - monthlyBonus.misses
                    ? "bg-emerald-500"
                    : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Dnes — checks */}
      <div className="rounded-2xl border bg-card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold">Dnes</h2>
          <span className="text-xs font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
            {doneCount}/{total} ✓
          </span>
        </div>
        <ul className="space-y-2">
          {todayChecks.map((c) => (
            <li
              key={c.id}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5 transition ${
                c.done
                  ? "bg-emerald-50 dark:bg-emerald-950/30"
                  : "bg-muted/40 hover:bg-muted/70"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">{c.done ? "✅" : "⭕"}</span>
                <span
                  className={`text-sm ${
                    c.done
                      ? "text-muted-foreground line-through"
                      : "font-medium"
                  }`}
                >
                  {c.label}
                </span>
              </div>
              {!c.done && (
                <ChevronRight className="size-4 text-muted-foreground" />
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="#"
          className="rounded-2xl border bg-gradient-to-br from-blue-50 to-cyan-50 p-4 dark:from-blue-950/40 dark:to-cyan-950/40"
        >
          <div className="text-2xl">🎯</div>
          <div className="mt-2 text-2xl font-extrabold tabular-nums">
            {poolCount}
          </div>
          <div className="text-xs text-muted-foreground">úkolů v poolu</div>
        </Link>
        <Link
          href="#"
          className="rounded-2xl border bg-gradient-to-br from-purple-50 to-pink-50 p-4 dark:from-purple-950/40 dark:to-pink-950/40"
        >
          <div className="text-2xl">📋</div>
          <div className="mt-2 text-2xl font-extrabold tabular-nums">
            {myTasksCount}
          </div>
          <div className="text-xs text-muted-foreground">mé rozpracované</div>
        </Link>
      </div>

      {/* Kredit */}
      <div className="rounded-2xl border bg-gradient-to-br from-emerald-50 to-teal-50 p-5 dark:from-emerald-950/30 dark:to-teal-950/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              💰 Kredit
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold tabular-nums text-emerald-700 dark:text-emerald-300">
                {credit.balanceCzk}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                Kč
              </span>
            </div>
            <div className="text-xs text-emerald-700/70 dark:text-emerald-400/70">
              +{credit.weeklyEarnedCzk} Kč tento týden
            </div>
          </div>
          <ChevronRight className="size-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Trophy hint */}
      <Link
        href="#"
        className="flex items-center justify-between rounded-2xl border bg-card p-4 group"
      >
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 text-xl dark:from-amber-900/40 dark:to-yellow-900/40">
            <Trophy className="size-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <div className="text-sm font-bold">Trofeje</div>
            <div className="text-xs text-muted-foreground">
              2 získané · další za 13 dnů 🥇
            </div>
          </div>
        </div>
        <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-1 transition" />
      </Link>
    </main>
  );
}
