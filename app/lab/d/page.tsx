// Vibe D — preset b3SlZvnfF aplikovaný globálně přes shadcn init.
// Tokeny: base-sera / mauve / primary purple / chart-1 lime / Source Sans 3.
// Tato stránka jen kombinuje shadcn primitiva — barvy řeší globals.css.

import Link from "next/link";
import {
  ChevronRight,
  Coins,
  Flame,
  ListTodo,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
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

export default function VibeD() {
  const doneCount = todayChecks.filter((c) => c.done).length;
  const total = todayChecks.length;
  const tierProgress = ((streak.days - 7) / (30 - 7)) * 100;

  // chart-1 = lime (preset accent pro data)
  const limeStyle = { color: "var(--chart-1)" };
  const limeBg = { backgroundColor: "var(--chart-1)" };

  return (
    <main className="mx-auto max-w-md space-y-3 p-4 pb-32">
      {/* Header */}
      <header className="flex items-center justify-between pt-2 pb-1">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            MON · 04 MAY 2026
          </div>
          <h1 className="mt-0.5 text-2xl font-bold tracking-tight">
            Hi, {childName}
          </h1>
        </div>
        <div className="flex items-center gap-1">
          <Link
            href="/lab"
            className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            ← LAB
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Streak hero */}
      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              STREAK
            </div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
              BEST · {streak.longestStreak} DAYS
            </div>
          </div>

          <div className="flex items-end gap-3">
            <Flame className="size-8 shrink-0" fill="var(--chart-1)" style={limeStyle} />
            <span className="text-6xl font-bold leading-none tabular-nums">
              {streak.days}
            </span>
            <span className="pb-1.5 text-sm text-muted-foreground">
              days in a row
            </span>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                CURRENT TIER
              </div>
              <div className="text-xl font-bold">{streak.tier}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                NEXT
              </div>
              <div className="text-xl font-bold" style={limeStyle}>
                Gold
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="h-2 bg-secondary rounded-sm overflow-hidden">
              <div
                className="h-full"
                style={{ width: `${tierProgress}%`, ...limeBg }}
              />
            </div>
            <div className="flex justify-between text-[11px] tabular-nums">
              <span>{streak.days} / 30</span>
              <span className="text-muted-foreground">in 13 days → Gold</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bonus */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                <Sparkles className="size-3" />
                MONTHLY BONUS
              </div>
              <div className="mt-1 flex items-baseline gap-1.5">
                <span className="text-3xl font-bold tabular-nums" style={limeStyle}>
                  {monthlyBonus.current}
                </span>
                <span className="text-xs text-muted-foreground">
                  / {monthlyBonus.full} CZK
                </span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="size-2.5 rounded-sm"
                    style={
                      i < 4 - monthlyBonus.misses
                        ? limeBg
                        : { backgroundColor: "var(--secondary)" }
                    }
                  />
                ))}
              </div>
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {monthlyBonus.misses} MISS
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today */}
      <Card>
        <CardContent className="pt-0 px-0">
          <div className="flex items-center justify-between border-b px-5 py-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              TODAY
            </div>
            <div className="text-xs font-semibold tabular-nums">
              <span style={limeStyle}>{doneCount}</span>
              <span className="text-muted-foreground">/{total}</span>
            </div>
          </div>
          <ul className="divide-y">
            {todayChecks.map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between px-5 py-3"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex size-4 items-center justify-center rounded-sm border"
                    style={
                      c.done
                        ? { ...limeBg, borderColor: "var(--chart-1)" }
                        : {}
                    }
                  >
                    {c.done && (
                      <svg
                        viewBox="0 0 12 12"
                        className="size-3"
                        fill="none"
                        stroke="var(--background)"
                        strokeWidth="2.5"
                      >
                        <path d="M2 6l3 3 5-6" />
                      </svg>
                    )}
                  </div>
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
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="#">
          <Card className="transition hover:border-primary/50">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <Target className="size-4" style={limeStyle} />
                <Badge
                  className="border-0 text-[10px] font-bold uppercase tracking-widest"
                  style={{
                    backgroundColor: "var(--chart-1)",
                    color: "var(--background)",
                  }}
                >
                  NEW
                </Badge>
              </div>
              <div className="mt-3 text-3xl font-bold tabular-nums">
                {poolCount}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                POOL
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="#">
          <Card className="transition hover:border-primary/50">
            <CardContent className="pt-4">
              <ListTodo className="size-4 text-muted-foreground" />
              <div className="mt-3 text-3xl font-bold tabular-nums">
                {myTasksCount}
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                MY TASKS
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Credit */}
      <Link href="#" className="block">
        <Card className="transition hover:border-primary/50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  <Coins className="size-3" />
                  CREDIT BALANCE
                </div>
                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold tabular-nums" style={limeStyle}>
                    {credit.balanceCzk}
                  </span>
                  <span className="text-xs text-muted-foreground">CZK</span>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground tabular-nums">
                  +{credit.weeklyEarnedCzk} THIS WEEK
                </div>
              </div>
              <ChevronRight className="size-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Trophies */}
      <Link href="#">
        <Card className="transition hover:border-primary/50 group">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-sm bg-secondary">
                  <Trophy className="size-4 text-primary" />
                </div>
                <div>
                  <div className="text-sm font-bold uppercase tracking-wide">
                    Trophies
                  </div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    2 / 6 UNLOCKED · NEXT IN 13D
                  </div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground transition group-hover:translate-x-0.5" />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Primary CTA */}
      <Button className="w-full uppercase tracking-wide font-semibold" size="lg">
        View Full Report
      </Button>
    </main>
  );
}
