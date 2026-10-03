import "server-only";
import { db } from "./db";
import {
  aggregateTransactions,
  computeDebtOut,
  type Transaction,
} from "./credit-pure";
import { startOfWeekPrague, endOfWeekPrague } from "./time";

export {
  aggregateTransactions,
  computeScreenTimeCost,
  computeDebtOut,
  computeWeeklyPayout,
  isScreenRecordMinutes,
  SCREEN_RECORD_MINUTES,
} from "./credit-pure";

/** Vrátí AppSettings (singleton). Pokud chybí, vytvoří defaultní řádek. */
export async function getAppSettings() {
  const existing = await db.appSettings.findFirst();
  if (existing) return existing;
  return db.appSettings.create({ data: {} });
}

/** Suma transakcí v týdnu pro daného uživatele (earned/screenTime/balance). */
export async function getWeekTotals(userId: string, date: Date = new Date()) {
  const weekStart = startOfWeekPrague(date);
  const weekEnd = endOfWeekPrague(date);
  const txs = await db.creditTransaction.findMany({
    where: {
      userId,
      createdAt: { gte: weekStart, lte: weekEnd },
    },
    select: { type: true, amountCzk: true },
  });
  return aggregateTransactions(txs as Transaction[]);
}

type CreditReader = Pick<typeof db, "creditTransaction" | "weeklyPayout">;

/**
 * D23: credit that can be spent on screen time = balance minus unpaid weekly payouts.
 * Money of a closed week belongs to its payout. Pass `tx` to read inside a transaction.
 */
export async function getSpendableCredit(userId: string, tx: CreditReader = db): Promise<number> {
  const [sum, reserved] = await Promise.all([
    tx.creditTransaction.aggregate({ where: { userId }, _sum: { amountCzk: true } }),
    tx.weeklyPayout.aggregate({ where: { userId, paidOutAt: null }, _sum: { totalPayoutCzk: true } }),
  ]);
  return (sum._sum.amountCzk ?? 0) - (reserved._sum.totalPayoutCzk ?? 0);
}

/** Aktuální balanc = suma všech transakcí mínus všechny vyplacené WeeklyPayout-y. */
export async function getCurrentBalance(userId: string): Promise<number> {
  const sum = await db.creditTransaction.aggregate({
    where: { userId },
    _sum: { amountCzk: true },
  });
  return sum._sum.amountCzk ?? 0;
}

type PayoutReader = Pick<typeof db, "weeklyPayout">;

/**
 * D30: debt (≤ 0) the last closed week before `beforeWeekStart` passed on.
 * Without `beforeWeekStart` it's the debt carried into the running week.
 */
export async function getCarriedDebt(
  userId: string,
  beforeWeekStart: Date = startOfWeekPrague(),
  tx: PayoutReader = db,
): Promise<number> {
  const last = await tx.weeklyPayout.findFirst({
    where: { userId, weekStart: { lt: beforeWeekStart } },
    orderBy: { weekStart: "desc" },
  });
  if (!last) return 0;
  return computeDebtOut({
    earnedCzk: last.totalEarnedCzk,
    screenTimeCzk: last.totalScreenTimeCzk,
    bonusCzk: last.bonusCzk,
    debtInCzk: last.debtInCzk,
  });
}

/**
 * D30: what the running week comes to so far — earned minus screen time plus debt carried in.
 * May be negative (screen time recorded without credit); the payout itself is clamped at close.
 */
export async function getWeekBalance(userId: string) {
  const [week, debtInCzk] = await Promise.all([getWeekTotals(userId), getCarriedDebt(userId)]);
  return { ...week, debtInCzk, netCzk: week.earnedCzk - week.screenTimeCzk + debtInCzk };
}
