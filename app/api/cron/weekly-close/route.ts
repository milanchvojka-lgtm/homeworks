import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { computeWeeklyPayout, getCarriedDebt } from "@/lib/credit";
import { closePastDays } from "@/lib/day-close";
import { previousWeekStart } from "@/lib/day-close-pure";
import { endOfWeekPrague } from "@/lib/time";

/**
 * Týdenní uzávěrka (D21): zavírá PŘEDCHOZÍ, už skončený týden, takže nezáleží na tom,
 * kdy ji GitHub Actions spustí (rozvrh: pondělí po půlnoci Prague). Nejdřív uzavře dny,
 * aby byla neděle započítaná. Součty podle CreditTransaction.weekStart, ne createdAt.
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

  await closePastDays();
  const weekStart = previousWeekStart(new Date());
  const weekEnd = endOfWeekPrague(weekStart);

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
        weekStart,
        type: { in: ["TASK_REWARD", "SCREEN_TIME", "MONTHLY_BONUS", "STREAK_MILESTONE", "WELCOME_BONUS"] },
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
      else if (t.type === "MONTHLY_BONUS" || t.type === "STREAK_MILESTONE" || t.type === "WELCOME_BONUS")
        bonusCzk += t.amountCzk; // D25: welcome bonus is paid out as bonus
    }
    // D30: debt the previous week couldn't cover comes off this payout; the rest carries on.
    const debtInCzk = await getCarriedDebt(child.id, weekStart);
    const totalPayout = computeWeeklyPayout({
      earnedCzk,
      screenTimeCzk,
      bonusCzk,
      debtInCzk,
    });

    await db.weeklyPayout.create({
      data: {
        userId: child.id,
        weekStart,
        weekEnd,
        totalEarnedCzk: earnedCzk,
        totalScreenTimeCzk: screenTimeCzk,
        bonusCzk,
        debtInCzk,
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
