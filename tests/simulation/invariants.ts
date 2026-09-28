import { db } from "@/lib/db";
import { computeMonthlyBonus } from "@/lib/bonus-graduated";
import { countMissedDays } from "@/lib/bonus-pure";
import { computeWeeklyPayout } from "@/lib/credit";
import { dayResult, replayStreak } from "@/lib/streak";
import { endOfMonthPrague, startOfDayPrague, startOfMonthPrague } from "@/lib/time";

/**
 * Rules that must hold at any moment of the simulated month. Loads everything in a few queries
 * (the database is remote) and checks in memory. Returns human-readable problems.
 */
export async function checkInvariants(label: string): Promise<string[]> {
  const problems: string[] = [];
  const p = (msg: string) => problems.push(`${label}: ${msg}`);
  const today = startOfDayPrague();

  const [kids, txs, instances, trophies, tasks, screens, payouts, settings] = await Promise.all([
    db.user.findMany({ where: { role: "CHILD" } }),
    db.creditTransaction.findMany(),
    db.dailyCheckInstance.findMany({ select: { userId: true, date: true, status: true } }),
    db.trophyEarned.findMany({ include: { milestone: true } }),
    db.taskInstance.findMany({ select: { id: true, status: true, task: { select: { name: true, valueCzk: true } } } }),
    db.screenTimeRequest.findMany({ where: { status: "APPROVED" } }),
    db.weeklyPayout.findMany({ include: { user: { select: { name: true } } } }),
    db.appSettings.findFirst(),
  ]);

  // Today (and later) is never MISSED (D21).
  const early = instances.filter((i) => i.status === "MISSED" && i.date >= today).length;
  if (early > 0) p(`${early} check(s) MISSED for today or later`);

  for (const k of kids) {
    const mine = txs.filter((t) => t.userId === k.id);

    const balance = mine.reduce((s, t) => s + t.amountCzk, 0);
    if (balance < 0) p(`${k.name} balance ${balance} Kč`);

    for (const type of ["TASK_REWARD", "SCREEN_TIME", "PAYOUT"] as const) {
      const refs = mine.filter((t) => t.type === type && t.referenceId).map((t) => t.referenceId!);
      const dup = refs.filter((r, i) => refs.indexOf(r) !== i);
      if (dup.length) p(`${k.name} ${type} credited twice for ${[...new Set(dup)].join(",")}`);
    }

    const welcome = mine.filter((t) => t.type === "WELCOME_BONUS").length;
    if (welcome > 1) p(`${k.name} welcome bonus credited ${welcome}×`);

    // Streak equals a replay of the closed days (daily-close rules).
    const byDay = new Map<number, string[]>();
    for (const i of instances) {
      if (i.userId !== k.id || i.date >= today) continue;
      byDay.set(i.date.getTime(), [...(byDay.get(i.date.getTime()) ?? []), i.status]);
    }
    const closed = [...byDay.keys()]
      .filter((d) => k.lastStreakDate && d <= k.lastStreakDate.getTime())
      // D25: failed days in the trial week are skipped.
      .filter((d) => !(k.trialEndsOn && d <= k.trialEndsOn.getTime() && dayResult(byDay.get(d)!) === "FAIL"))
      .sort((a, b) => a - b);
    const replay = replayStreak(closed.map((d) => dayResult(byDay.get(d)!)));
    if (replay.current !== k.currentStreak) p(`${k.name} streak ${k.currentStreak}, replay says ${replay.current}`);
    if (replay.breaks !== k.brokenStreaksCount) p(`${k.name} broken ${k.brokenStreaksCount}, replay says ${replay.breaks}`);

    const seen = new Set<string>();
    for (const t of trophies.filter((x) => x.userId === k.id)) {
      const key = `${t.milestoneId}@${t.earnedAt.toISOString()}`;
      if (seen.has(key)) p(`${k.name} trophy ${t.milestone.trophyName} twice on the same day`);
      seen.add(key);
    }

    // Monthly bonus: one per month, graduated by that month's misses.
    for (const b of mine.filter((t) => t.type === "MONTHLY_BONUS")) {
      const same = mine.filter((t) => t.type === "MONTHLY_BONUS" && t.referenceId === b.referenceId);
      if (same.length > 1) p(`${k.name} bonus ${b.referenceId} credited ${same.length}×`);
      const [y, m] = (b.referenceId ?? "0-0").split("-").map(Number);
      const mid = new Date(Date.UTC(y, m - 1, 15, 12));
      const from = startOfMonthPrague(mid);
      const to = endOfMonthPrague(mid);
      const monthInst = instances.filter((i) => i.userId === k.id && i.date >= from && i.date <= to);
      const expected = computeMonthlyBonus({
        misses: countMissedDays(monthInst, k.trialEndsOn),
        fullCzk: settings!.monthlyBonusCzk,
        stepCzk: settings!.monthlyBonusStepCzk,
      });
      if (b.amountCzk !== expected) p(`${k.name} bonus ${b.referenceId} is ${b.amountCzk}, expected ${expected}`);
    }
  }

  // Every DONE task paid exactly once with its value; nothing else paid.
  const rewards = txs.filter((t) => t.type === "TASK_REWARD");
  for (const t of tasks) {
    const paid = rewards.filter((r) => r.referenceId === t.id);
    if (t.status === "DONE" && (paid.length !== 1 || paid[0].amountCzk !== t.task.valueCzk))
      p(`task ${t.task.name} ${t.id} paid ${paid.map((x) => x.amountCzk).join("+") || "0"} instead of ${t.task.valueCzk}`);
    if (t.status !== "DONE" && paid.length) p(`task ${t.task.name} ${t.id} is ${t.status} but was paid`);
  }
  for (const s of screens) {
    const tx = txs.filter((t) => t.type === "SCREEN_TIME" && t.referenceId === s.id);
    if (tx.length !== 1 || tx[0].amountCzk !== -s.costCzk) p(`screen time ${s.id} deducted ${tx.length}×`);
  }

  // Weekly payouts: one per child and week, matching the week's transactions.
  const seenWeek = new Set<string>();
  for (const w of payouts) {
    const key = `${w.userId}@${w.weekStart.toISOString()}`;
    if (seenWeek.has(key)) p(`${w.user.name} two payouts for week ${w.weekStart.toISOString()}`);
    seenWeek.add(key);
    const week = txs.filter((t) => t.userId === w.userId && t.weekStart.getTime() === w.weekStart.getTime());
    const sum = (types: string[], sign = 1) =>
      week.filter((t) => types.includes(t.type)).reduce((s, t) => s + sign * t.amountCzk, 0);
    const expected = computeWeeklyPayout({
      earnedCzk: sum(["TASK_REWARD"]),
      screenTimeCzk: sum(["SCREEN_TIME"], -1),
      bonusCzk: sum(["MONTHLY_BONUS", "STREAK_MILESTONE", "WELCOME_BONUS"]),
    });
    if (w.totalPayoutCzk !== expected)
      p(`${w.user.name} payout ${w.weekStart.toISOString().slice(0, 10)} is ${w.totalPayoutCzk}, expected ${expected}`);
  }

  return problems;
}
