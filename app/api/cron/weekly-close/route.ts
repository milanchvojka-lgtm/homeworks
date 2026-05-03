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
 *
 * Od M7 (Task 3.4): před agregací vyplatí čekající streak milníky
 * (TrophyEarned kde rewardPaidAt = null a milestone.rewardCzk > 0).
 * Vyplacené trofeje se promítnou do bonusCzk v WeeklyPayout.
 * Vyplácení trofejí běží idempotentně — rewardPaidAt = null zabraňuje dvojímu vyplacení.
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const weekStart = startOfWeekPrague();
  const weekEnd = endOfWeekPrague();

  const children = await db.user.findMany({ where: { role: "CHILD" } });

  let created = 0;
  let skipped = 0;
  let trophiesPaidOut = 0;

  for (const child of children) {
    // Krok 1: Vyplať čekající streak milníky (nezávisle na existenci WeeklyPayout).
    const pendingTrophies = await db.trophyEarned.findMany({
      where: {
        userId: child.id,
        rewardPaidAt: null,
        milestone: { rewardCzk: { gt: 0 } },
      },
      include: { milestone: true },
    });

    for (const trophy of pendingTrophies) {
      await db.creditTransaction.create({
        data: {
          userId: child.id,
          amountCzk: trophy.milestone.rewardCzk,
          type: "STREAK_MILESTONE",
          weekStart,
          note: `🏆 ${trophy.milestone.trophyName} (${trophy.milestone.days} dnů)`,
        },
      });
      await db.trophyEarned.update({
        where: { id: trophy.id },
        data: { rewardPaidAt: new Date() },
      });
      trophiesPaidOut++;
    }

    // Krok 2: Vytvoř WeeklyPayout (idempotentní — přeskočí, pokud už existuje).
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
        type: { in: ["TASK_REWARD", "SCREEN_TIME", "MONTHLY_BONUS", "STREAK_MILESTONE"] },
      },
      select: { type: true, amountCzk: true },
    });
    // Earned (jen TASK_REWARD), screen time, a bonus (MONTHLY_BONUS + STREAK_MILESTONE) reportujeme zvlášť.
    let earnedCzk = 0;
    let screenTimeCzk = 0;
    let bonusCzk = 0;
    for (const t of txs) {
      if (t.type === "TASK_REWARD") earnedCzk += t.amountCzk;
      else if (t.type === "SCREEN_TIME") screenTimeCzk += Math.abs(t.amountCzk);
      else if (t.type === "MONTHLY_BONUS" || t.type === "STREAK_MILESTONE") bonusCzk += t.amountCzk;
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
    { status: "ok", weekStart: weekStart.toISOString(), created, skipped, trophiesPaidOut },
    { headers: { "cache-control": "no-store" } },
  );
}
