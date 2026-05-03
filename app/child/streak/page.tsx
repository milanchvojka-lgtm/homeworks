import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { startOfDayPrague } from "@/lib/time";
import { Card, CardContent } from "@/components/ui/card";
import { StreakGrid, type DayCell } from "@/components/streak/streak-grid";

export default async function StreakHistoryPage() {
  const user = await getSession();
  if (!user) redirect("/");

  const today = startOfDayPrague();
  // 84 days inclusive of today: day 0 = today - 83 days, day 83 = today
  const startDate = new Date(today.getTime() - 83 * 86400000);

  const [streakUser, instances] = await Promise.all([
    db.user.findUnique({
      where: { id: user.id },
      select: {
        currentStreak: true,
        longestStreak: true,
        brokenStreaksCount: true,
      },
    }),
    db.dailyCheckInstance.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate, lte: today },
      },
      select: { date: true, status: true },
      orderBy: { date: "asc" },
    }),
  ]);

  // Build a map: date ISO string → best status
  type StatusKind = "approved" | "submitted" | "missed" | "rejected" | "empty";
  const dayMap = new Map<string, StatusKind>();

  for (const inst of instances) {
    const key = inst.date.toISOString().slice(0, 10);
    const current = dayMap.get(key);
    let next: StatusKind;
    switch (inst.status) {
      case "REJECTED":
        next = "rejected";
        break;
      case "MISSED":
        next = "missed";
        break;
      case "APPROVED":
        next = "approved";
        break;
      case "SUBMITTED":
      case "PENDING":
        next = "submitted";
        break;
      default:
        next = "empty";
    }
    // Priority: rejected > missed > approved > submitted > empty
    const priority: Record<StatusKind, number> = {
      rejected: 4,
      missed: 3,
      approved: 2,
      submitted: 1,
      empty: 0,
    };
    if (current === undefined || priority[next] > priority[current]) {
      dayMap.set(key, next);
    }
  }

  // Build 84 cells oldest → newest
  const cells: DayCell[] = [];
  for (let i = 0; i < 84; i++) {
    const dayDate = new Date(startDate.getTime() + i * 86400000);
    const key = dayDate.toISOString().slice(0, 10);
    const todayKey = today.toISOString().slice(0, 10);
    const isFuture = key > todayKey;

    if (isFuture) {
      cells.push({ kind: "future" });
    } else {
      const status = dayMap.get(key) ?? "empty";
      cells.push({ kind: status });
    }
  }

  const currentStreak = streakUser?.currentStreak ?? 0;
  const longestStreak = streakUser?.longestStreak ?? 0;
  const brokenStreaksCount = streakUser?.brokenStreaksCount ?? 0;

  return (
    <div className="space-y-3">
      {/* Back link */}
      <Link
        href="/child"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Zpět
      </Link>

      {/* Stats card */}
      <Card>
        <CardContent className="py-4">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Přehled streaku
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-2xl font-extrabold tabular-nums" style={{ color: "var(--chart-1)" }}>
                {currentStreak}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                aktuální
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">
                {longestStreak}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                nejdelší
              </div>
            </div>
            <div>
              <div className="text-2xl font-extrabold tabular-nums">
                {brokenStreaksCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                rozbito
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 12-week grid */}
      <StreakGrid cells={cells} />
    </div>
  );
}
