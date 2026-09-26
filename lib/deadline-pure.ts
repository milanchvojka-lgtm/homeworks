import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { PRAGUE_TZ } from "./time";

/** Minutes below which a deadline counts as "soon" (card turns amber). */
export const SOON_MINUTES = 60;

/**
 * Today's deadline of a daily check in Europe/Prague (D18).
 * `dueTime` is "HH:mm"; missing or invalid falls back to 23:59 (end of the day, when checks are closed).
 */
export function dueDateToday(dueTime: string | null, now: Date = new Date()): Date {
  const match = dueTime ? /^([01]\d|2[0-3]):([0-5]\d)$/.exec(dueTime) : null;
  const hours = match ? Number(match[1]) : 23;
  const minutes = match ? Number(match[2]) : 59;
  const z = toZonedTime(now, PRAGUE_TZ);
  const local = new Date(z.getFullYear(), z.getMonth(), z.getDate(), hours, minutes, 0, 0);
  return fromZonedTime(local, PRAGUE_TZ);
}

/** Label shown on the card: "DO 17:00". */
export function dueLabel(dueTime: string | null): string {
  return `DO ${dueTime && /^([01]\d|2[0-3]):[0-5]\d$/.test(dueTime) ? dueTime : "23:59"}`;
}

export type Remaining = { text: string; soon: boolean; past: boolean };

/** "zbývá 3 h 12 min" / "zbývá 25 min" / "po termínu". */
export function remaining(deadline: Date, now: Date = new Date()): Remaining {
  const ms = deadline.getTime() - now.getTime();
  if (ms <= 0) return { text: "po termínu", soon: true, past: true };
  const totalMin = Math.ceil(ms / 60_000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const text = h > 0 ? `zbývá ${h} h ${m} min` : `zbývá ${m} min`;
  return { text, soon: totalMin <= SOON_MINUTES, past: false };
}
