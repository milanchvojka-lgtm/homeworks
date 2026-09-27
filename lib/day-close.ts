import "server-only";
import { db } from "./db";
import { daysToClose } from "./day-close-pure";
import { applyDayOutcome, dayResult } from "./streak";
import { startOfDayPrague } from "./time";

/**
 * D21: closes every day that has ended and is not closed yet, whenever it runs.
 * PENDING checks before today → MISSED; then per child the closed days after `lastStreakDate`
 * are applied to the streak and trophies (daily-close rules) and `lastStreakDate` moves on.
 * Today is never touched. Safe to run any number of times, also concurrently.
 */
export async function closePastDays(now: Date = new Date()) {
  const today = startOfDayPrague(now);

  const missed = await db.dailyCheckInstance.updateMany({
    where: { date: { lt: today }, status: "PENDING" },
    data: { status: "MISSED" },
  });

  const children = await db.user.findMany({
    where: { role: "CHILD" },
    select: {
      id: true,
      currentStreak: true,
      longestStreak: true,
      brokenStreaksCount: true,
      lastStreakDate: true,
    },
  });
  const milestones = await db.streakMilestone.findMany();

  let daysClosed = 0;
  let streaksBroken = 0;
  let trophiesEarned = 0;

  for (const child of children) {
    const instances = await db.dailyCheckInstance.findMany({
      where: {
        userId: child.id,
        date: { lt: today, ...(child.lastStreakDate ? { gt: child.lastStreakDate } : {}) },
      },
      select: { date: true, status: true },
    });
    const days = daysToClose(
      instances.map((i) => i.date),
      child.lastStreakDate,
      today,
    );
    if (days.length === 0) continue;

    let streak = child.currentStreak;
    let longest = child.longestStreak;
    let broken = 0;
    const trophies: { milestoneId: string; earnedAt: Date; cycleStart: Date }[] = [];

    for (const day of days) {
      const statuses = instances
        .filter((i) => i.date.getTime() === day.getTime())
        .map((i) => i.status);
      if (dayResult(statuses) === "FAIL") {
        if (streak > 0) broken++;
        streak = 0;
        continue;
      }
      streak = applyDayOutcome(streak, "APPROVED");
      longest = Math.max(longest, streak);
      const m = milestones.find((x) => x.days === streak);
      if (m) {
        // Cycle-aware dedup as before: the current streak started (streak - 1) days before this day.
        const cycleStart = new Date(day);
        cycleStart.setDate(cycleStart.getDate() - streak + 1);
        trophies.push({ milestoneId: m.id, earnedAt: day, cycleStart });
      }
    }

    const lastDay = days[days.length - 1];
    const applied = await db.$transaction(async (tx) => {
      // Guard on the old lastStreakDate: a concurrent run that got here first wins, this one skips.
      const updated = await tx.user.updateMany({
        where: { id: child.id, lastStreakDate: child.lastStreakDate },
        data: {
          currentStreak: streak,
          longestStreak: longest,
          brokenStreaksCount: child.brokenStreaksCount + broken,
          lastStreakDate: lastDay,
        },
      });
      if (updated.count === 0) return false;
      for (const t of trophies) {
        const earned = await tx.trophyEarned.findFirst({
          where: { userId: child.id, milestoneId: t.milestoneId, earnedAt: { gte: t.cycleStart } },
        });
        if (!earned) {
          await tx.trophyEarned.create({
            data: { userId: child.id, milestoneId: t.milestoneId, earnedAt: t.earnedAt },
          });
          trophiesEarned++;
        }
      }
      return true;
    });
    if (applied) {
      daysClosed += days.length;
      streaksBroken += broken;
    }
  }

  return { missed: missed.count, daysClosed, streaksBroken, trophiesEarned };
}
