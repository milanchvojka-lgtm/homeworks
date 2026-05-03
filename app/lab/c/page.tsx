// Vibe C — Dark gaming
// Vibe: Discord, Vercel, Linear dark, Riot. Dark-first, neon akcenty (cyan/magenta/lime),
// monospace cifry, hard contrast, tight rows.

import Link from "next/link";
import { ChevronRight, Trophy, Zap } from "lucide-react";
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

export default function VibeC() {
  const doneCount = todayChecks.filter((c) => c.done).length;
  const total = todayChecks.length;
  const tierProgress = ((streak.days - 7) / (30 - 7)) * 100;

  return (
    <main className="dark min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-md space-y-4 p-4 pb-32">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-zinc-500">
              MON · 04.05.2026
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="text-zinc-500">›</span> {childName.toLowerCase()}
            </h1>
          </div>
          <div className="flex items-center gap-1">
            <Link
              href="/lab"
              className="font-mono text-[10px] uppercase tracking-widest text-zinc-500 hover:text-zinc-200"
            >
              ← lab
            </Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Streak — terminal style */}
        <div className="relative overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
          {/* Scanline effect */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.02)_50%)] bg-[size:100%_4px]" />
          {/* Cyan glow */}
          <div className="absolute -left-20 -top-20 size-60 rounded-full bg-cyan-500/10 blur-3xl" />

          <div className="relative space-y-4 p-5">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
              <span className="text-cyan-400">{">"} STREAK.ACTIVE</span>
              <span className="text-zinc-500">PB {streak.longestStreak}</span>
            </div>

            <div className="flex items-end gap-3">
              <div className="font-mono text-7xl font-bold leading-none tabular-nums text-white drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                {String(streak.days).padStart(3, "0")}
              </div>
              <div className="pb-2 font-mono text-xs text-zinc-500">
                / DAYS
              </div>
            </div>

            <div className="flex items-center gap-3 border-t border-zinc-800 pt-4">
              <Zap className="size-4 text-fuchsia-400" />
              <div className="font-mono text-xs">
                <span className="text-zinc-500">TIER:</span>{" "}
                <span className="font-bold text-zinc-100">
                  {streak.tier.toUpperCase()}
                </span>{" "}
                <span className="text-zinc-600">→</span>{" "}
                <span className="text-amber-400">GOLD</span>
              </div>
              <div className="ml-auto font-mono text-xs text-zinc-500">
                {streak.days}/30
              </div>
            </div>

            <div className="h-1 overflow-hidden rounded-sm bg-zinc-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-amber-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                style={{ width: `${tierProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bonus */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {"//"} MONTHLY_BONUS
              </div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="font-mono text-3xl font-bold tabular-nums text-lime-400">
                  {monthlyBonus.current}
                </span>
                <span className="font-mono text-xs text-zinc-500">
                  / {monthlyBonus.full} CZK
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`size-2 ${
                      i < 4 - monthlyBonus.misses
                        ? "bg-lime-400 shadow-[0_0_4px_rgba(163,230,53,0.6)]"
                        : "bg-zinc-800"
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[10px] text-zinc-500">
                {monthlyBonus.misses} MISS
              </span>
            </div>
          </div>
        </div>

        {/* Dnešní checks */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
          <div className="mb-3 flex items-center justify-between border-b border-zinc-800 pb-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
              {"//"} TODAY.CHECKS
            </span>
            <span className="font-mono text-xs tabular-nums">
              <span className="text-lime-400">{doneCount}</span>
              <span className="text-zinc-600">/{total}</span>
            </span>
          </div>
          <ul className="divide-y divide-zinc-800">
            {todayChecks.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between py-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex size-4 items-center justify-center border ${
                      c.done
                        ? "border-lime-400 bg-lime-400 text-black"
                        : "border-zinc-700"
                    }`}
                  >
                    {c.done && (
                      <span className="text-[9px] font-bold leading-none">
                        ✓
                      </span>
                    )}
                  </div>
                  <span
                    className={`text-sm ${
                      c.done
                        ? "text-zinc-500 line-through"
                        : "text-zinc-100"
                    }`}
                  >
                    {c.label}
                  </span>
                </div>
                {!c.done && (
                  <span className="font-mono text-[10px] text-zinc-500">
                    [TAP]
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="#"
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition hover:border-cyan-500/50"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
              <span className="text-cyan-400">POOL</span>
              <ChevronRight className="size-3 text-zinc-600 group-hover:text-cyan-400" />
            </div>
            <div className="mt-1 font-mono text-3xl font-bold tabular-nums">
              {poolCount}
            </div>
          </Link>
          <Link
            href="#"
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition hover:border-fuchsia-500/50"
          >
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
              <span className="text-fuchsia-400">QUEUE</span>
              <ChevronRight className="size-3 text-zinc-600 group-hover:text-fuchsia-400" />
            </div>
            <div className="mt-1 font-mono text-3xl font-bold tabular-nums">
              {myTasksCount}
            </div>
          </Link>
        </div>

        {/* Kredit */}
        <Link
          href="#"
          className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition hover:border-lime-500/50"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-zinc-500">
                {"//"} BALANCE
              </div>
              <div className="mt-1 font-mono text-3xl font-bold tabular-nums text-lime-400">
                {credit.balanceCzk}{" "}
                <span className="text-xs text-zinc-500">CZK</span>
              </div>
              <div className="font-mono text-[10px] text-zinc-500">
                +{credit.weeklyEarnedCzk} THIS WEEK
              </div>
            </div>
            <ChevronRight className="size-5 text-zinc-600" />
          </div>
        </Link>

        {/* Trophy */}
        <Link
          href="#"
          className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900 p-3 transition hover:border-amber-500/50 group"
        >
          <div className="flex items-center gap-3">
            <Trophy className="size-4 text-amber-400" />
            <div>
              <div className="font-mono text-xs font-bold uppercase tracking-widest">
                Trophies
              </div>
              <div className="font-mono text-[10px] text-zinc-500">
                2 / 6 UNLOCKED · NEXT IN 13D
              </div>
            </div>
          </div>
          <ChevronRight className="size-4 text-zinc-600 group-hover:text-amber-400 transition" />
        </Link>
      </div>
    </main>
  );
}
