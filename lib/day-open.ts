import "server-only";
import { db } from "./db";
import { absentUserIds } from "./absence";
import { assignCompetenciesForDay } from "./rotation";
import { startOfDayPrague } from "./time";

/**
 * Eager `DailyCheckInstance`s for today (D2): every child with a competency today (D32) gets one per
 * check template. Children away today get none (D24). Idempotent (unique dailyCheckId+userId+date).
 * `onlyUserIds` limits it to some children (ending an absence brings today's checks back at once).
 */
export async function openDay(now: Date = new Date(), onlyUserIds?: string[]) {
  const today = startOfDayPrague(now);
  // D32: roles rotate daily, the day is assigned here (no separate rotation job).
  await assignCompetenciesForDay(today);
  const away = await absentUserIds(now);

  const assignments = await db.competencyAssignment.findMany({
    where: { date: today, ...(onlyUserIds ? { userId: { in: onlyUserIds } } : {}) },
    include: { competency: { include: { dailyChecks: true } } },
  });

  let created = 0;
  let skipped = 0;
  let away_ = 0;
  for (const a of assignments) {
    if (away.has(a.userId)) {
      away_++;
      continue;
    }
    for (const check of a.competency.dailyChecks) {
      const exists = await db.dailyCheckInstance.findUnique({
        where: { dailyCheckId_userId_date: { dailyCheckId: check.id, userId: a.userId, date: today } },
        select: { id: true },
      });
      if (exists) {
        skipped++;
        continue;
      }
      await db.dailyCheckInstance.create({
        data: { dailyCheckId: check.id, userId: a.userId, date: today, status: "PENDING" },
      });
      created++;
    }
  }
  return { date: today.toISOString(), assignments: assignments.length, created, skipped, away: away_ };
}
