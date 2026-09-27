import { formatInTimeZone } from "date-fns-tz";
import { PRAGUE_TZ, endOfMonthPrague, startOfMonthPrague, startOfWeekPrague } from "./time";

const HALF_DAY = 12 * 3600_000;

/** D21: closed days to apply, oldest first — after `lastStreakDate`, strictly before today. */
export function daysToClose(dates: Date[], lastStreakDate: Date | null, today: Date): Date[] {
  const keys = new Set(
    dates
      .filter((x) => x < today && (!lastStreakDate || x > lastStreakDate))
      .map((x) => x.getTime()),
  );
  return [...keys].sort((a, b) => a - b).map((k) => new Date(k));
}

/** D21: the week that has already ended (never the running one). */
export function previousWeekStart(now: Date): Date {
  return startOfWeekPrague(new Date(startOfWeekPrague(now).getTime() - HALF_DAY));
}

/** D21: end of the month that has already ended (never the running one). */
export function previousMonthEnd(now: Date): Date {
  return endOfMonthPrague(new Date(startOfMonthPrague(now).getTime() - HALF_DAY));
}

/** "2026-09" — idempotency key of a monthly bonus. */
export function monthRef(date: Date): string {
  return formatInTimeZone(date, PRAGUE_TZ, "yyyy-MM");
}
