import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import {
  aggregateTransactions,
  computeWeeklyPayout,
} from "@/lib/credit";
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
    const agg = aggregateTransactions(txs as never);
    const totalPayout = computeWeeklyPayout({
      earnedCzk: agg.earnedCzk - 0, // bez bonusu — bonus přijde v M5
      screenTimeCzk: agg.screenTimeCzk,
      bonusCzk: 0,
    });

    await db.weeklyPayout.create({
      data: {
        userId: child.id,
        weekStart,
        weekEnd,
        totalEarnedCzk: agg.earnedCzk,
        totalScreenTimeCzk: agg.screenTimeCzk,
        bonusCzk: 0,
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
