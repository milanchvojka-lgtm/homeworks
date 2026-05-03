import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { TrophyList } from "@/components/streak/trophy-list";

function pluralizeDays(days: number): string {
  if (days === 1) return "den";
  if (days >= 2 && days <= 4) return "dny";
  return "dnů";
}

export default async function TrofejeePage() {
  const user = await getSession();
  if (!user) redirect("/");

  const [streakData, milestones, earnedAll] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        brokenStreaksCount: true,
      },
    }),
    db.streakMilestone.findMany({
      orderBy: [{ sortOrder: "asc" }, { days: "asc" }],
    }),
    db.trophyEarned.findMany({
      where: { userId: user.id },
      include: { milestone: true },
      orderBy: { earnedAt: "desc" },
    }),
  ]);

  const currentStreak = streakData?.currentStreak ?? 0;
  const longestStreak = streakData?.longestStreak ?? 0;
  const brokenStreaksCount = streakData?.brokenStreaksCount ?? 0;

  // Build map of latest earned per milestoneId (already ordered desc by earnedAt)
  const latestEarned = new Map<
    string,
    { earnedAt: Date; rewardPaidAt: Date | null }
  >();
  for (const t of earnedAll) {
    if (!latestEarned.has(t.milestoneId)) {
      latestEarned.set(t.milestoneId, {
        earnedAt: t.earnedAt,
        rewardPaidAt: t.rewardPaidAt,
      });
    }
  }

  const earnedSet = new Set(earnedAll.map((t) => t.milestoneId));

  // Milestones already sorted by sortOrder + days asc from the DB query
  let foundCurrent = false;
  const trophies = milestones.map((m) => {
    if (earnedSet.has(m.id)) {
      const rec = latestEarned.get(m.id)!;
      return {
        milestone: m,
        status: "earned" as const,
        earnedAt: rec.earnedAt,
        rewardPaidAt: rec.rewardPaidAt,
      };
    }
    if (!foundCurrent && m.days > currentStreak) {
      foundCurrent = true;
      return {
        milestone: m,
        status: "current" as const,
        remainingDays: m.days - currentStreak,
      };
    }
    return { milestone: m, status: "locked" as const };
  });

  return (
    <div className="space-y-3">
      {/* Back link */}
      <Link
        href="/child"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="size-4" />
        Zpět
      </Link>

      {/* Page heading */}
      <div>
        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
          Trofeje
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Trophy Room</h1>
      </div>

      {/* Stats card */}
      <Card>
        <CardContent className="pt-4">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Statistiky
          </div>
          <div className="mt-3 flex justify-between text-sm">
            <div>
              <div className="text-muted-foreground">Nejdelší řada</div>
              <div
                className="text-2xl font-bold tabular-nums"
                style={{ color: "var(--chart-1)" }}
              >
                {longestStreak}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  {pluralizeDays(longestStreak)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground">Rozbité řady</div>
              <div className="text-2xl font-bold tabular-nums">
                {brokenStreaksCount}×
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trophy list */}
      <Card className="overflow-hidden">
        <TrophyList trophies={trophies} />
      </Card>
    </div>
  );
}
