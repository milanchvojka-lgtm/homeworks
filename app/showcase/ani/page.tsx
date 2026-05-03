import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Flame, Clock, Coins, Monitor } from "lucide-react";
import { StreakBanner } from "@/components/streak/streak-banner";
import { TrophyList } from "@/components/streak/trophy-list";
import { StreakGrid } from "@/components/streak/streak-grid";
import {
  ANI_PROFILE,
  ANI_BONUS,
  ANI_TODAY_CHECKS,
  ANI_COMPETENCY,
  ANI_POOL_TASKS,
  ANI_MY_TASKS,
  ANI_CREDIT,
  ANI_HISTORY,
  ANI_TROPHIES,
  generateAniStreakCells,
} from "@/app/showcase/_data";

const limeStyle = { color: "var(--chart-1)" };
const limeBg = { backgroundColor: "var(--chart-1)" };

function SectionHeader({ label, route }: { label: string; route: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border pb-1">
      <h2 className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </h2>
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">
        {route}
      </span>
    </div>
  );
}

function Avatar({
  name,
  color,
  size = "sm",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizeClass =
    size === "sm" ? "size-7 text-xs" : size === "md" ? "size-9 text-sm" : "size-12 text-lg";
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass}`}
      style={{ backgroundColor: color }}
    >
      {name.charAt(0)}
    </div>
  );
}

function statusLabel(status: string) {
  switch (status) {
    case "APPROVED":
      return "Schváleno";
    case "SUBMITTED":
      return "Čeká";
    case "PENDING":
      return "Nesplněno";
    default:
      return status;
  }
}

function statusVariant(
  status: string,
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "APPROVED":
      return "default";
    case "SUBMITTED":
      return "secondary";
    case "PENDING":
      return "outline";
    default:
      return "outline";
  }
}

const streakCells = generateAniStreakCells();

export default function AniShowcase() {
  const approvedCount = ANI_TODAY_CHECKS.filter(
    (c) => c.status === "APPROVED",
  ).length;
  const doneCount = ANI_TODAY_CHECKS.filter(
    (c) => c.status === "APPROVED" || c.status === "SUBMITTED",
  ).length;

  return (
    <main className="mx-auto max-w-md space-y-12 px-4 py-8 pb-24">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <header className="flex items-center gap-4">
        <Avatar name="Ani" color={ANI_PROFILE.avatarColor} size="lg" />
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Pohled dítěte
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{ANI_PROFILE.name}</h1>
          <div className="flex items-center gap-2">
            <Flame className="size-3" fill="var(--chart-1)" style={limeStyle} />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
              Den {ANI_PROFILE.currentStreak} streaku · Tier: Gold
            </span>
          </div>
        </div>
      </header>

      {/* ── DNES ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Dnes" route="app/child" />

        {/* Streak banner — reusing the real component */}
        <StreakBanner
          currentStreak={ANI_PROFILE.currentStreak}
          longestStreak={ANI_PROFILE.longestStreak}
          bonus={ANI_BONUS}
        />

        {/* Trofeje link card */}
        <Card>
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="text-base">🏆</span>
              <div>
                <div className="text-sm font-bold">Trofeje</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  4 / 6 získáno · Centurion za 53 dní
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competency */}
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Aktuální kompetence
            </div>
            <div className="mt-1 text-sm font-semibold tracking-tight">
              {ANI_COMPETENCY}
            </div>
          </CardContent>
        </Card>

        {/* Today checks */}
        <Card>
          <CardContent className="px-0 pt-0 pb-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                Dnešní cheky
              </div>
              <div className="text-xs font-semibold tabular-nums">
                <span style={limeStyle}>{doneCount}</span>
                <span className="text-muted-foreground">/{ANI_TODAY_CHECKS.length}</span>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {ANI_TODAY_CHECKS.map((check) => {
                const isApproved = check.status === "APPROVED";
                const isSubmitted = check.status === "SUBMITTED";
                return (
                  <li
                    key={check.id}
                    className="flex items-center justify-between px-5 py-3"
                  >
                    <div className="flex items-center gap-3">
                      {/* Checkbox visual */}
                      <div
                        className="flex size-4 items-center justify-center rounded-sm border"
                        style={
                          isApproved
                            ? { ...limeBg, borderColor: "var(--chart-1)" }
                            : isSubmitted
                              ? { borderColor: "var(--chart-1)" }
                              : {}
                        }
                      >
                        {isApproved && (
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
                        {isSubmitted && (
                          <div className="size-2 rounded-sm" style={limeBg} />
                        )}
                      </div>
                      <div>
                        <span
                          className={`text-sm ${isApproved ? "text-muted-foreground line-through" : "font-medium"}`}
                        >
                          {check.name}
                        </span>
                        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                          {check.timeOfDay === "MORNING"
                            ? "Ráno"
                            : check.timeOfDay === "EVENING"
                              ? "Večer"
                              : "Kdykoli"}
                        </div>
                      </div>
                    </div>
                    <Badge variant={statusVariant(check.status)} className="text-[9px]">
                      {statusLabel(check.status)}
                    </Badge>
                  </li>
                );
              })}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* ── POOL ────────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Pool" route="app/child/pool" />
        <div className="space-y-3">
          {ANI_POOL_TASKS.map((task) => (
            <Card key={task.id}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold">{task.name}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <Clock className="size-3 text-muted-foreground" />
                      <span className="text-[10px] text-muted-foreground">
                        {task.durationMin} min
                      </span>
                      {task.note && (
                        <span className="text-[10px] text-muted-foreground">
                          · {task.note}
                        </span>
                      )}
                    </div>
                    {task.waitingFor && (
                      <div className="mt-1 flex items-center gap-1.5">
                        <Avatar
                          name={task.waitingFor.name}
                          color={task.waitingFor.avatarColor}
                          size="sm"
                        />
                        <span className="text-[10px] text-muted-foreground">
                          čeká na {task.waitingFor.name}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-lg font-bold tabular-nums" style={limeStyle}>
                      {task.rewardCzk} Kč
                    </span>
                    <Button
                      size="sm"
                      variant={task.waitingFor ? "outline" : "default"}
                      disabled={!!task.waitingFor}
                      className="text-xs"
                    >
                      {task.waitingFor ? "Obsazeno" : "Vzít si"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── MÉ ÚKOLY ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Mé úkoly" route="app/child/ukoly" />
        {ANI_MY_TASKS.map((task) => (
          <Card key={task.id}>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{task.name}</span>
                    <Badge variant="secondary" className="text-[9px] uppercase tracking-wider">
                      Přijato
                    </Badge>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Clock className="size-3" />
                    <span>Splnit do {task.executeDeadline}</span>
                    <span style={limeStyle} className="font-semibold">
                      · zbývá 2 h 12 m
                    </span>
                  </div>
                </div>
                <span className="text-lg font-bold tabular-nums" style={limeStyle}>
                  {task.rewardCzk} Kč
                </span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button size="sm" className="flex-1" disabled>
                  Odevzdat
                </Button>
                <Button size="sm" variant="outline" disabled>
                  Vrátit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── KREDIT ──────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Kredit" route="app/child/kredit" />

        {/* Balance */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <Coins className="size-3" />
              Celkový kredit
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-4xl font-bold tabular-nums" style={limeStyle}>
                {ANI_CREDIT.balanceCzk}
              </span>
              <span className="text-sm text-muted-foreground">Kč</span>
            </div>
          </CardContent>
        </Card>

        {/* This week */}
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              Tento týden (26.4. – 3.5.)
            </div>
            <ul className="divide-y divide-border -mx-4 px-4">
              {[
                { label: "Vyděláno", value: ANI_CREDIT.weeklyEarnedCzk },
                { label: "Obrazovka", value: -ANI_CREDIT.weeklyScreenCzk },
                { label: "K výplatě", value: ANI_CREDIT.weeklyPayoutCzk, accent: true },
              ].map(({ label, value, accent }) => (
                <li
                  key={label}
                  className="flex items-center justify-between py-2 first:pt-0 last:pb-0"
                >
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span
                    className="text-sm font-semibold tabular-nums"
                    style={accent ? limeStyle : undefined}
                  >
                    {value > 0 ? `+${value}` : value} Kč
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Screen time requester */}
        <Card>
          <CardContent className="pt-4 pb-4 space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
              <Monitor className="size-3" />
              Obrazovkový čas
            </div>
            <div className="flex gap-2">
              {ANI_CREDIT.screenTimeOptions.map((opt) => (
                <Button
                  key={opt.minutes}
                  variant="outline"
                  size="sm"
                  disabled
                  className="flex-1 flex-col h-auto py-2 gap-0.5"
                >
                  <span className="text-sm font-bold">{opt.minutes} min</span>
                  <span className="text-[10px] text-muted-foreground">
                    {opt.priceCzk} Kč
                  </span>
                </Button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              Sazba: {ANI_CREDIT.screenTimeOptions[1].priceCzk} Kč / hodinu
            </p>
          </CardContent>
        </Card>
      </section>

      {/* ── HISTORIE ────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Historie výplat" route="app/child/kredit/historie" />
        <div className="space-y-2">
          {ANI_HISTORY.map((week) => (
            <Card key={week.id}>
              <CardContent className="pt-3 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                      {week.weekStart} → {week.weekEnd}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        vydělano {week.earnedCzk} Kč
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · obrazovka {week.screenCzk} Kč
                      </span>
                    </div>
                    {week.bonusNote && (
                      <div className="mt-0.5 text-[10px] font-semibold" style={limeStyle}>
                        {week.bonusNote}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-base font-bold tabular-nums" style={limeStyle}>
                      {week.payoutCzk} Kč
                    </span>
                    <Badge
                      variant={week.paidOutAt ? "default" : "outline"}
                      className="text-[9px] uppercase tracking-wider"
                    >
                      {week.paidOutAt ? "Vyplaceno" : "Čeká"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ── TROFEJE ─────────────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Trofeje" route="app/child/trofeje" />

        {/* Stats card */}
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold tabular-nums" style={limeStyle}>
                  {ANI_PROFILE.currentStreak}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Aktuální
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {ANI_PROFILE.longestStreak}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Rekord
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tabular-nums">
                  {ANI_PROFILE.brokenStreaksCount}
                </div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  Přerušení
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Trophy list — reusing the real component */}
        <Card>
          <CardContent className="px-0 pt-2 pb-2">
            <TrophyList trophies={ANI_TROPHIES} />
          </CardContent>
        </Card>
      </section>

      {/* ── STREAK MŘÍŽKA ───────────────────────────────────────────────── */}
      <section className="space-y-3">
        <SectionHeader label="Streak · Posledních 12 týdnů" route="app/child/streak" />

        {/* StreakGrid — reusing the real component */}
        <StreakGrid cells={streakCells} />
      </section>
    </main>
  );
}
