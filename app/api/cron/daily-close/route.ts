import { NextResponse } from "next/server";
import { checkCronAuth } from "@/lib/cron";
import { db } from "@/lib/db";
import { startOfDayPrague } from "@/lib/time";
import { applyDayOutcome } from "@/lib/streak";

/**
 * Denní uzavření: PENDING checky pro dnešní den se označí jako MISSED.
 * SUBMITTED zůstává — admin může schválit zpětně.
 * Volá GitHub Actions 23:59 Prague.
 *
 * Po konverzi MISSED: pro každé dítě se updatuje streak a detekují trofeje.
 * SUBMITTED je považováno za APPROVED (dítě splnilo svoji část, admin ještě neschválil).
 */
export async function GET(request: Request) {
  const unauth = checkCronAuth(request);
  if (unauth) return unauth;

  const today = startOfDayPrague();

  // Step 1: Mark PENDING checks as MISSED (unchanged)
  const result = await db.dailyCheckInstance.updateMany({
    where: { date: today, status: "PENDING" },
    data: { status: "MISSED" },
  });

  // Step 2: Streak + trophy update for each child
  const children = await db.user.findMany({
    where: { role: "CHILD" },
    select: {
      id: true,
      currentStreak: true,
      longestStreak: true,
    },
  });

  let streaksAdvanced = 0;
  let streaksBroken = 0;
  let trophiesEarned = 0;

  for (const child of children) {
    const todayInstances = await db.dailyCheckInstance.findMany({
      where: { userId: child.id, date: today },
      select: { status: true },
    });

    // No instances today → skip (no competency assigned, don't touch streak)
    if (todayInstances.length === 0) {
      continue;
    }

    const statuses = todayInstances.map((i) => i.status);
    const hasFail = statuses.some((s) => s === "MISSED" || s === "REJECTED");
    // SUBMITTED counts as APPROVED (child did their part, admin hasn't reviewed yet)
    const allDone = statuses.every((s) => s === "APPROVED" || s === "SUBMITTED");

    if (hasFail) {
      // Streak reset
      if (child.currentStreak > 0) {
        await db.user.update({
          where: { id: child.id },
          data: {
            currentStreak: 0,
            brokenStreaksCount: { increment: 1 },
          },
        });
        streaksBroken++;
      }
    } else if (allDone) {
      // Streak advance
      const newStreak = applyDayOutcome(child.currentStreak, "APPROVED");

      await db.user.update({
        where: { id: child.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(child.longestStreak, newStreak),
          lastStreakDate: today,
        },
      });
      streaksAdvanced++;

      // Trophy detection: check if newStreak hits a milestone
      const milestone = await db.streakMilestone.findUnique({
        where: { days: newStreak },
      });

      if (milestone) {
        // Cycle-aware dedup: is this milestone already earned in the current streak cycle?
        // Current cycle started (newStreak - 1) days before today (0-indexed from today).
        const cycleStart = new Date(today);
        cycleStart.setDate(cycleStart.getDate() - newStreak + 1);

        const earnedThisCycle = await db.trophyEarned.findFirst({
          where: {
            userId: child.id,
            milestoneId: milestone.id,
            earnedAt: { gte: cycleStart },
          },
        });

        if (!earnedThisCycle) {
          await db.trophyEarned.create({
            data: {
              userId: child.id,
              milestoneId: milestone.id,
              earnedAt: today,
            },
          });
          trophiesEarned++;
        }
      }
    }
    // else: mix of SUBMITTED+non-terminal, or unexpected state → no-op
  }

  return NextResponse.json(
    {
      status: "ok",
      date: today.toISOString(),
      missed: result.count,
      streaksAdvanced,
      streaksBroken,
      trophiesEarned,
    },
    { headers: { "cache-control": "no-store" } },
  );
}
