import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { computeWeeklyPayout } from "@/lib/credit";
import { endOfWeekPrague, startOfWeekPrague } from "@/lib/time";

/**
 * Týdenní uzávěrka. Volá GitHub Actions neděli 23:59 Prague.
 * Pro každé dítě vytvoří `WeeklyPayout` (paidOutAt = null).
 * V M4 ještě bez bonusu (M5).
 * Idempotentní díky unique [userId, weekStart].
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const weekStart = startOfWeekPrague();
  const weekEnd = endOfWeekPrague();

  const children = await db.user.findMany({ where: { role: "CHILD" } });

  let created = 0;
  let skipped = 0;

  for (const child of children) {
    const existing = await db.weeklyPayout.findUnique({
      where: { userId_weekStart: { userId: child.id, weekStart } },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const txs = await db.creditTransaction.findMany({
      where: {
        userId: child.id,
        createdAt: { gte: weekStart, lte: weekEnd },
        type: { in: ["TASK_REWARD", "SCREEN_TIME", "MONTHLY_BONUS"] },
      },
      select: { type: true, amountCzk: true },
    });
    // Earned (jen TASK_REWARD), screen time, a bonus (MONTHLY_BONUS) reportujeme zvlášť.
    let earnedCzk = 0;
    let screenTimeCzk = 0;
    let bonusCzk = 0;
    for (const t of txs) {
      if (t.type === "TASK_REWARD") earnedCzk += t.amountCzk;
      else if (t.type === "SCREEN_TIME") screenTimeCzk += Math.abs(t.amountCzk);
      else if (t.type === "MONTHLY_BONUS") bonusCzk += t.amountCzk;
    }
    const totalPayout = computeWeeklyPayout({
      earnedCzk,
      screenTimeCzk,
      bonusCzk,
    });

    await db.weeklyPayout.create({
      data: {
        userId: child.id,
        weekStart,
        weekEnd,
        totalEarnedCzk: earnedCzk,
        totalScreenTimeCzk: screenTimeCzk,
        bonusCzk,
        totalPayoutCzk: totalPayout,
      },
    });
    created++;
  }

  return NextResponse.json(
    { status: "ok", weekStart: weekStart.toISOString(), created, skipped },
    { headers: { "cache-control": "no-store" } },
  );
}
