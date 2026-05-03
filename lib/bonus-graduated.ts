export type BonusInput = {
  misses: number;
  fullCzk: number;
  stepCzk: number;
};

/**
 * Graduated monthly bonus. Each "miss" (calendar day in the month with at
 * least one MISSED or REJECTED check) reduces the full bonus by stepCzk.
 * Floor at 0.
 *
 * Examples (default 200/50):
 *   0 misses → 200, 1 → 150, 2 → 100, 3 → 50, 4+ → 0.
 */
export function computeMonthlyBonus({
  misses,
  fullCzk,
  stepCzk,
}: BonusInput): number {
  const reduced = fullCzk - misses * stepCzk;
  return Math.max(0, reduced);
}
