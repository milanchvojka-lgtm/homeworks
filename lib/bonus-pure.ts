/**
 * Čistá logika měsíčního bonusu — žádný DB I/O.
 *
 * Bonus se ztrácí v momentě, kdy je v měsíci alespoň jedna `DailyCheckInstance`
 * ve stavu MISSED nebo REJECTED. `lostOn` je datum nejstarší takové instance.
 *
 * Předpoklad: PENDING instance se před půlnocí převedou na MISSED přes daily-close
 * cron. PENDING v dnešním dni se nezapočítává (může být ještě splněno).
 */

export type BonusCheck = {
  date: Date;
  status: "PENDING" | "SUBMITTED" | "APPROVED" | "REJECTED" | "MISSED";
};

export type BonusStatus =
  | { stillInGame: true }
  | { stillInGame: false; lostOn: Date };

export function evaluateBonusStatus(instances: BonusCheck[]): BonusStatus {
  let earliest: Date | null = null;
  for (const i of instances) {
    if (i.status === "MISSED" || i.status === "REJECTED") {
      if (earliest === null || i.date.getTime() < earliest.getTime()) {
        earliest = i.date;
      }
    }
  }
  if (earliest) return { stillInGame: false, lostOn: earliest };
  return { stillInGame: true };
}
