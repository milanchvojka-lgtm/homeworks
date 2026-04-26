/**
 * Čisté výpočty pro kredit, screen time, payout. Žádný DB I/O.
 */

export type Transaction = {
  type:
    | "TASK_REWARD"
    | "SCREEN_TIME"
    | "MONTHLY_BONUS"
    | "PAYOUT"
    | "ADJUSTMENT";
  amountCzk: number;
};

/**
 * Cena za screen time. Minutes musí být kladný násobek `granularityMin`.
 * Vrací zaokrouhlenou cenu v Kč; přesný vzorec `(minutes / 60) * hourCost`,
 * zaokrouhleno na celé Kč.
 */
export function computeScreenTimeCost(
  minutes: number,
  hourCostCzk: number,
): number {
  if (minutes <= 0 || hourCostCzk <= 0) return 0;
  return Math.round((minutes / 60) * hourCostCzk);
}

/**
 * Validuje, jestli je počet minut povolený (kladný násobek granularity).
 */
export function isValidScreenTimeMinutes(
  minutes: number,
  granularityMin: number,
): boolean {
  if (!Number.isInteger(minutes) || minutes <= 0) return false;
  if (granularityMin <= 0) return false;
  return minutes % granularityMin === 0;
}

/**
 * Sečte transakce do (earned, screenTime, balance).
 *   earned     = suma všech kladných TASK_REWARD a MONTHLY_BONUS
 *   screenTime = abs suma SCREEN_TIME (kladné číslo = kolik utratila)
 *   balance    = součet všech amountCzk (signed)
 */
export function aggregateTransactions(transactions: Transaction[]): {
  earnedCzk: number;
  screenTimeCzk: number;
  balanceCzk: number;
} {
  let earnedCzk = 0;
  let screenTimeCzk = 0;
  let balanceCzk = 0;
  for (const t of transactions) {
    balanceCzk += t.amountCzk;
    if (t.type === "TASK_REWARD" || t.type === "MONTHLY_BONUS") {
      if (t.amountCzk > 0) earnedCzk += t.amountCzk;
    } else if (t.type === "SCREEN_TIME") {
      screenTimeCzk += Math.abs(t.amountCzk);
    }
  }
  return { earnedCzk, screenTimeCzk, balanceCzk };
}

/**
 * Spočítá týdenní výplatu z aggregátů. Kredit nesmí být záporný (nemůže dlužit).
 */
export function computeWeeklyPayout(args: {
  earnedCzk: number;
  screenTimeCzk: number;
  bonusCzk: number;
}): number {
  const total = args.earnedCzk - args.screenTimeCzk + args.bonusCzk;
  return Math.max(0, total);
}
