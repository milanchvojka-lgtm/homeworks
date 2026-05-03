import { redirect } from "next/navigation";
import Link from "next/link";
import { Trophy, ChevronRight, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { getBonusStatus } from "@/lib/bonus";
import { getCurrentAssignment } from "@/lib/rotation";
import { startOfDayPrague } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { StreakBanner } from "@/components/streak/streak-banner";
import { TodayChecks } from "./_components/today-checks";

export default async function ChildToday() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  const [assignment, instances, bonusStatus, streakData, totalMilestones, earnedMilestones] = await Promise.all([
    getCurrentAssignment(user.id),
    db.dailyCheckInstance.findMany({
      where: { userId: user.id, date: today },
      include: { dailyCheck: true },
      orderBy: [{ dailyCheck: { order: "asc" } }],
    }),
    getBonusStatus(user.id),
    db.user.findUnique({
      where: { id: user.id },
      select: { currentStreak: true, longestStreak: true },
    }),
    db.streakMilestone.count(),
    db.trophyEarned
      .findMany({
        where: { userId: user.id },
        distinct: ["milestoneId"],
        select: { id: true },
      })
      .then((r) => r.length),
  ]);

  return (
    <div className="space-y-3">
      <StreakBanner
        currentStreak={streakData?.currentStreak ?? 0}
        longestStreak={streakData?.longestStreak ?? 0}
        bonus={bonusStatus}
      />

      {/* Trofeje link */}
      <Link href="/child/trofeje" className="block">
        <Card className="transition hover:border-primary/50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Trophy
                className="size-4"
                style={{ color: "var(--chart-1)" }}
              />
              <div>
                <div className="text-sm font-bold">Trofeje</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  {earnedMilestones} / {totalMilestones} získáno
                </div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      {/* Streak history link */}
      <Link href="/child/streak" className="block">
        <Card className="transition hover:border-primary/50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <CalendarDays
                className="size-4"
                style={{ color: "var(--chart-1)" }}
              />
              <div>
                <div className="text-sm font-bold">Můj streak</div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                  posledních 12 týdnů
                </div>
              </div>
            </div>
            <ChevronRight className="size-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>

      {/* Current competency */}
      <Card>
        <CardContent className="pt-4 pb-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
            Aktuální kompetence
          </div>
          {assignment ? (
            <div className="mt-1 text-sm font-semibold tracking-tight">
              {assignment.competency.name}
            </div>
          ) : (
            <div className="mt-1 text-sm text-muted-foreground">
              Tento týden nemáš přiřazenou kompetenci.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Today checks */}
      {instances.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              Žádné checky pro dnešek. Zkontroluj to později.
            </p>
          </CardContent>
        </Card>
      ) : (
        <TodayChecks
          instances={instances.map((i) => ({
            id: i.id,
            name: i.dailyCheck.name,
            timeOfDay: i.dailyCheck.timeOfDay,
            status: i.status,
            note: i.note,
          }))}
        />
      )}
    </div>
  );
}
