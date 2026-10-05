/**
 * Čisté výpočty pro kredit, screen time, payout. Žádný DB I/O.
 */

export type Transaction = {
  type:
    | "TASK_REWARD"
    | "SCREEN_TIME"
    | "MONTHLY_BONUS"
    | "PAYOUT"
    | "ADJUSTMENT"
    | "WELCOME_BONUS"
    | "STREAK_MILESTONE";
  amountCzk: number;
};

/**
 * Cena za screen time (D30: zapisuje se 15 nebo 60 min).
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
 * Sečte transakce do (earned, screenTime, balance).
 *   earned     = suma kladných TASK_REWARD a bonusů, které weekly-close vyplácí jako bonus
 *                (MONTHLY_BONUS, WELCOME_BONUS, STREAK_MILESTONE), takže netCzk sedí s výplatou
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
    if (
      t.type === "TASK_REWARD" ||
      t.type === "MONTHLY_BONUS" ||
      t.type === "WELCOME_BONUS" ||
      t.type === "STREAK_MILESTONE"
    ) {
      if (t.amountCzk > 0) earnedCzk += t.amountCzk;
    } else if (t.type === "SCREEN_TIME") {
      screenTimeCzk += Math.abs(t.amountCzk);
    }
  }
  return { earnedCzk, screenTimeCzk, balanceCzk };
}

/** D30: parent records only what iOS offers — 15 min or 1 h ("until end of day" is not supported). */
export const SCREEN_RECORD_MINUTES = [15, 60] as const;

export function isScreenRecordMinutes(minutes: number): boolean {
  return (SCREEN_RECORD_MINUTES as readonly number[]).includes(minutes);
}

type WeekNet = {
  earnedCzk: number;
  screenTimeCzk: number;
  bonusCzk: number;
  /** D30: debt carried in from the previous week (≤ 0). */
  debtInCzk?: number;
};

const weekNet = (a: WeekNet) => a.earnedCzk - a.screenTimeCzk + a.bonusCzk + (a.debtInCzk ?? 0);

/**
 * Spočítá týdenní výplatu z aggregátů. Výplata nikdy není záporná;
 * co nestačí, přejde jako dluh do dalšího týdne (D30, `computeDebtOut`).
 */
export function computeWeeklyPayout(args: WeekNet): number {
  return Math.max(0, weekNet(args));
}

/** D30: debt the week passes on to the next one (≤ 0); 0 when the payout covered everything. */
export function computeDebtOut(args: WeekNet): number {
  return Math.min(0, weekNet(args));
}
