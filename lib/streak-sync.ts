import "server-only";
import type { Prisma } from "@prisma/client";
import { dayResult, replayStreak, type DayResult } from "./streak";

type Tx = Prisma.TransactionClient;

/** Closed days of a child (≤ lastStreakDate, the days daily-close already applied), oldest first. */
async function closedDays(tx: Tx, userId: string, lastStreakDate: Date | null) {
  if (!lastStreakDate) return { keys: [] as number[], results: [] as DayResult[] };
  const history = await tx.dailyCheckInstance.findMany({
    where: { userId, date: { lte: lastStreakDate } },
    select: { date: true, status: true },
  });
  const byDay = new Map<number, string[]>();
  for (const h of history) byDay.set(h.date.getTime(), [...(byDay.get(h.date.getTime()) ?? []), h.status]);
  const keys = [...byDay.keys()].sort((a, b) => a - b);
  return { keys, results: keys.map((k) => dayResult(byDay.get(k)!)) };
}

/**
 * D20/D24: runs `change` (which edits already closed days: excuse, absence), then rebuilds the streak
 * from history — current, longest, broken count — and grants trophies the rebuilt streak reaches
 * (cycle-aware, dated to the day the streak got there). Days not closed yet are left to daily-close.
 */
export async function withStreakResync(tx: Tx, userId: string, change: () => Promise<void>) {
  const child = await tx.user.findUniqueOrThrow({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, brokenStreaksCount: true, lastStreakDate: true },
  });
  const before = replayStreak((await closedDays(tx, userId, child.lastStreakDate)).results);
  await change();
  const { keys, results } = await closedDays(tx, userId, child.lastStreakDate);
  const after = replayStreak(results);

  await tx.user.update({
    where: { id: userId },
    data: {
      currentStreak: after.current,
      longestStreak: Math.max(child.longestStreak, after.longest),
      brokenStreaksCount: Math.max(0, child.brokenStreaksCount + after.breaks - before.breaks),
    },
  });

  const cycleDays = keys.slice(after.cycleStart);
  if (cycleDays.length === 0) return;
  const milestones = await tx.streakMilestone.findMany({
    where: { days: { gt: child.currentStreak, lte: after.current } },
  });
  for (const m of milestones) {
    const earned = await tx.trophyEarned.findFirst({
      where: { userId, milestoneId: m.id, earnedAt: { gte: new Date(cycleDays[0]) } },
    });
    if (!earned) {
      await tx.trophyEarned.create({
        data: { userId, milestoneId: m.id, earnedAt: new Date(cycleDays[m.days - 1]) },
      });
    }
  }
}
