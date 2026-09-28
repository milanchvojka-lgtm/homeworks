/**
 * Čistá logika měsíčního bonusu — žádný DB I/O.
 *
 * Bonus je graduovaný: každý kalendářní den s alespoň jednou MISSED/REJECTED
 * instancí sníží bonus o stepCzk. Více selhání ve stejný den = 1 miss.
 */

export type BonusCheck = {
  date: Date;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "MISSED";
};

/**
 * Counts distinct calendar days in the input where at least one check is
 * MISSED or REJECTED. Multiple failures the same day count as one miss.
 * D25: days up to `trialEndsOn` (the trial week) are not counted.
 */
export function countMissedDays(instances: BonusCheck[], trialEndsOn?: Date | null): number {
  const days = new Set<string>();
  for (const i of instances) {
    if (trialEndsOn && i.date <= trialEndsOn) continue;
    if (i.status === "MISSED" || i.status === "REJECTED") {
      days.add(i.date.toISOString().slice(0, 10)); // YYYY-MM-DD
    }
  }
  return days.size;
}

/**
 * Earliest miss date in the input (for "you slipped on…" messaging).
 * null if none.
 */
export function earliestMissDate(instances: BonusCheck[], trialEndsOn?: Date | null): Date | null {
  let earliest: Date | null = null;
  for (const i of instances) {
    if (trialEndsOn && i.date <= trialEndsOn) continue;
    if (i.status === "MISSED" || i.status === "REJECTED") {
      if (earliest === null || i.date.getTime() < earliest.getTime()) {
        earliest = i.date;
      }
    }
  }
  return earliest;
}
