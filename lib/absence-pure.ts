import { startOfDayPrague, startOfMonthPrague, startOfWeekPrague } from "./time";

export type AbsenceRangeError = "to_before_from" | "before_week" | "month_closed";

/**
 * D24: an absence may start at the earliest on Monday of the running week and in the running
 * month (closed weeks are paid out, closed months have their bonus); the end is unlimited.
 * `from`/`to` are Prague days (startOfDayPrague).
 */
export function checkAbsenceRange(from: Date, to: Date, now: Date): AbsenceRangeError | null {
  if (to < from) return "to_before_from";
  if (from < startOfWeekPrague(now)) return "before_week";
  if (from < startOfMonthPrague(now)) return "month_closed";
  return null;
}

/** Is `day` inside [from, to] (all Prague days)? */
export function coversDay(a: { fromDate: Date; toDate: Date }, day: Date): boolean {
  const d = startOfDayPrague(day).getTime();
  return a.fromDate.getTime() <= d && d <= a.toDate.getTime();
}
