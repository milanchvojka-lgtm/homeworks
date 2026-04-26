import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { startOfDayPrague, startOfWeekPrague } from "@/lib/time";

/**
 * Eager generování `DailyCheckInstance` pro dnešní den (D2).
 * Pro každé dítě s `CompetencyAssignment` na tento týden vytvoří instance
 * pro všechny `DailyCheck` šablony jeho aktuální kompetence.
 * Idempotentní (unique on dailyCheckId+userId+date).
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const today = startOfDayPrague();
  const weekStart = startOfWeekPrague();

  const assignments = await db.competencyAssignment.findMany({
    where: { weekStart },
    include: {
      competency: { include: { dailyChecks: true } },
    },
  });

  let created = 0;
  let skipped = 0;

  for (const a of assignments) {
    for (const check of a.competency.dailyChecks) {
      const result = await db.dailyCheckInstance.upsert({
        where: {
          dailyCheckId_userId_date: {
            dailyCheckId: check.id,
            userId: a.userId,
            date: today,
          },
        },
        create: {
          dailyCheckId: check.id,
          userId: a.userId,
          date: today,
          status: "PENDING",
        },
        update: {},
        select: { createdAt: true },
      });
      if (result.createdAt.getTime() > Date.now() - 5_000) created++;
      else skipped++;
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      date: today.toISOString(),
      assignments: assignments.length,
      created,
      skipped,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
