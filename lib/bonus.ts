import "server-only";
import { db } from "./db";
import { computeMonthlyBonus } from "./bonus-graduated";
import { countMissedDays, earliestMissDate } from "./bonus-pure";
import { getAppSettings } from "./credit";
import { endOfMonthPrague, startOfMonthPrague } from "./time";

export { type BonusCheck } from "./bonus-pure";

export type BonusStatus = {
  misses: number;
  currentBonusCzk: number;
  fullBonusCzk: number;
  stepCzk: number;
  /** Earliest day in the current month where a check was MISSED/REJECTED, if any. */
  lostOn: Date | null;
};

/**
 * Stav měsíčního bonusu pro daného uživatele v měsíci, který obsahuje `date`.
 * Vrací počet zaváhání + aktuální výši bonusu (gradient).
 */
export async function getBonusStatus(
  userId: string,
  date: Date = new Date(),
): Promise<BonusStatus> {
  const monthStart = startOfMonthPrague(date);
  const monthEnd = endOfMonthPrague(date);

  const [instances, settings, user] = await Promise.all([
    db.dailyCheckInstance.findMany({
      where: { userId, date: { gte: monthStart, lte: monthEnd } },
      select: { date: true, status: true },
    }),
    getAppSettings(),
    db.user.findUnique({ where: { id: userId }, select: { trialEndsOn: true } }),
  ]);

  // D25: failed days in the trial week do not cost bonus.
  const trial = user?.trialEndsOn ?? null;
  const misses = countMissedDays(instances, trial);
  const fullBonusCzk = settings.monthlyBonusCzk;
  const stepCzk = settings.monthlyBonusStepCzk;
  const currentBonusCzk = computeMonthlyBonus({ misses, fullCzk: fullBonusCzk, stepCzk });

  return {
    misses,
    currentBonusCzk,
    fullBonusCzk,
    stepCzk,
    lostOn: misses > 0 ? earliestMissDate(instances, trial) : null,
  };
}
