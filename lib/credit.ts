import "server-only";
import { db } from "./db";
import {
  aggregateTransactions,
  type Transaction,
} from "./credit-pure";
import { startOfWeekPrague, endOfWeekPrague } from "./time";

export {
  aggregateTransactions,
  computeScreenTimeCost,
  computeWeeklyPayout,
  isValidScreenTimeMinutes,
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
