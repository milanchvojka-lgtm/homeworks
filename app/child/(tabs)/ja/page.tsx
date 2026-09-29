import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, ChevronRight, KeyRound, LogOut, Trophy } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import { logoutAction } from "@/app/actions/auth";
import { THEME_COOKIE, parseThemePref } from "@/lib/theme";
import { ThemeSwitch } from "./_theme-switch";
import { PushSwitchTemp } from "@/app/_components/push-switch-temp";

/**
 * Já (návrh 2, frame 04). Shows only what the status header doesn't: next trophy, record,
 * bonus rules, links and account (streak count and bonus amount live in the header).
 */
export default async function ChildMePage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [me, milestones, earned, bonus] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true, longestStreak: true },
    }),
    db.streakMilestone.findMany({ orderBy: { days: "asc" } }),
    db.trophyEarned.findMany({
      where: { userId: user.id },
      distinct: ["milestoneId"],
      select: { id: true },
    }),
    getBonusStatus(user.id),
  ]);

  const themePref = parseThemePref((await cookies()).get(THEME_COOKIE)?.value);
  const streak = me?.currentStreak ?? 0;
  const next = milestones.find((m) => m.days > streak) ?? null;
  const prevDays = [...milestones].reverse().find((m) => m.days <= streak)?.days ?? 0;
  const pct = next ? Math.round(((streak - prevDays) / (next.days - prevDays)) * 100) : 100;
  const month = new Date().toLocaleString("cs-CZ", { month: "long", timeZone: "Europe/Prague" });

  return (
    <div className="flex flex-col gap-3">
      <section className="flex flex-col gap-2.5 rounded-tile border border-border bg-card p-[18px]">
        <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
          Další trofej
        </span>
        {next ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-[30px]" aria-hidden>
                {next.emoji}
              </span>
              <div>
                <h2 className="text-xl font-bold tracking-tight">
                  {next.trophyName} za {next.days - streak} {dayWord(next.days - streak)}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {next.rewardCzk > 0 ? `odměna +${next.rewardCzk} Kč · ` : ""}rekord{" "}
                  {me?.longestStreak ?? 0} {dayWord(me?.longestStreak ?? 0)}
                </p>
              </div>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-highlight" style={{ width: `${pct}%` }} />
            </div>
          </>
        ) : (
          <h2 className="text-xl font-bold tracking-tight">Máš všechny trofeje řady</h2>
        )}
      </section>

      <section className="flex flex-col gap-2.5 rounded-tile border border-border bg-card p-[18px]">
        <span className="font-mono text-[11px] font-bold tracking-wider text-subtle uppercase">
          Měsíční bonus · {month}
        </span>
        <h2 className="text-xl font-bold tracking-tight">
          {bonus.misses === 0
            ? "Zatím bez zaváhání"
            : `${bonus.misses} ${bonus.misses === 1 ? "zaváhání" : "zaváhání"} tento měsíc`}
        </h2>
        <p className="text-sm text-muted-foreground">
          Každý zmeškaný den ubere {bonus.stepCzk} Kč. Vyplácí se na konci měsíce.
        </p>
      </section>

      <nav className="overflow-hidden rounded-tile border border-border bg-card">
        <Row href="/child/trofeje" icon={<Trophy />} label="Trofeje" meta={`${earned.length} / ${milestones.length}`} />
        <Row href="/child/streak" icon={<CalendarDays />} label="Historie řady" />
      </nav>

      <ThemeSwitch current={themePref} />

      <PushSwitchTemp />

      <div className="overflow-hidden rounded-tile border border-border bg-card">
        <Row href="/child/ja/pin" icon={<KeyRound />} label="Změnit PIN" />
        <form action={logoutAction} className="border-t border-muted">
          <button
            type="submit"
            className="flex h-14 w-full items-center gap-3.5 px-[18px] text-[17px] font-semibold text-destructive"
          >
            <LogOut className="size-5" />
            Odhlásit
          </button>
        </form>
      </div>
    </div>
  );
}

function Row({
  href,
  icon,
  label,
  meta,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  meta?: string;
}) {
  return (
    <Link
      href={href}
      className="flex h-14 items-center gap-3.5 border-b border-muted px-[18px] last:border-b-0 [&>svg]:size-5"
    >
      <span className="text-muted-foreground [&>svg]:size-5">{icon}</span>
      <span className="flex-1 text-[17px] font-semibold">{label}</span>
      {meta && <span className="font-mono text-sm font-bold text-muted-foreground">{meta}</span>}
      <ChevronRight className="size-[18px] text-subtle" />
    </Link>
  );
}

function dayWord(n: number): string {
  if (n === 1) return "den";
  if (n >= 2 && n <= 4) return "dny";
  return "dní";
}
