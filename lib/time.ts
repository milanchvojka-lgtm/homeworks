import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, startOfWeek, endOfWeek, addDays } from "date-fns";

export const PRAGUE_TZ = "Europe/Prague";

/** Hour (0–23) v Praze pro daný moment. */
export function hourInPrague(date: Date = new Date()): number {
  return Number(
    new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      hour12: false,
      timeZone: PRAGUE_TZ,
    }).format(date),
  );
}

/** Den v týdnu v Praze (0=neděle, 1=pondělí, …, 6=sobota). */
export function dayOfWeekInPrague(date: Date = new Date()): number {
  const wd = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    timeZone: PRAGUE_TZ,
  }).format(date);
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(wd);
}

/** "Now" in Prague timezone, returned as a Date in UTC. */
export function nowInPrague(): Date {
  return toZonedTime(new Date(), PRAGUE_TZ);
}

/** Start of the given day in Prague (00:00:00 Prague), returned as UTC Date. */
export function startOfDayPrague(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, PRAGUE_TZ);
  return fromZonedTime(startOfDay(zoned), PRAGUE_TZ);
}

/** Monday 00:00:00 of the week containing `date`, in Prague tz, as UTC Date. */
export function startOfWeekPrague(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, PRAGUE_TZ);
  const monday = startOfWeek(zoned, { weekStartsOn: 1 });
  return fromZonedTime(monday, PRAGUE_TZ);
}

/** Sunday 23:59:59.999 of the week containing `date`, in Prague tz, as UTC Date. */
export function endOfWeekPrague(date: Date = new Date()): Date {
  const zoned = toZonedTime(date, PRAGUE_TZ);
  const sunday = endOfWeek(zoned, { weekStartsOn: 1 });
  return fromZonedTime(sunday, PRAGUE_TZ);
}

/** Start of next week (next Monday 00:00 Prague), as UTC Date. */
export function startOfNextWeekPrague(date: Date = new Date()): Date {
  return addDays(startOfWeekPrague(date), 7);
}
