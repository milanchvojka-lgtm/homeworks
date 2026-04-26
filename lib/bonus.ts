import "server-only";
import { db } from "./db";
import { evaluateBonusStatus } from "./bonus-pure";
import { endOfMonthPrague, startOfMonthPrague } from "./time";

export { evaluateBonusStatus, type BonusStatus, type BonusCheck } from "./bonus-pure";

/**
 * Stav bonusu pro daného uživatele v měsíci, který obsahuje `date`.
 * Vrací `{ stillInGame: true }` nebo `{ stillInGame: false, lostOn: Date }`.
 */
export async function getBonusStatus(userId: string, date: Date = new Date()) {
  const monthStart = startOfMonthPrague(date);
  const monthEnd = endOfMonthPrague(date);

  const instances = await db.dailyCheckInstance.findMany({
    where: {
      userId,
      date: { gte: monthStart, lte: monthEnd },
    },
    select: { date: true, status: true },
  });

  return evaluateBonusStatus(instances);
}
