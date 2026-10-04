import { startOfDayPrague } from "./time";

/** Pevný anchor — pondělí 2025-12-29 00:00 Prague (libovolné, fixní). */
export const ROTATION_EPOCH = startOfDayPrague(
  new Date("2025-12-29T00:00:00+01:00"),
);

/** Day index from the epoch for a day-aligned Date (`startOfDayPrague`), D32. */
export function computeDayIndex(day: Date): number {
  // Math.round (not floor): a DST day has 23 or 25 hours, so a day-aligned input sits ±1 h around a multiple of 24 h.
  const ms = day.getTime() - ROTATION_EPOCH.getTime();
  return Math.round(ms / (24 * 60 * 60 * 1000));
}

/**
 * Čistá funkce: pro daný index dne spočítá, které dítě dostane kterou kompetenci.
 * Rotace: 3 holky × 3 kompetence, posun každý den (D32).
 */
export function rotateAssignments<C>(
  children: { id: string }[],
  competencies: C[],
  dayIndex: number,
): { childId: string; competency: C }[] {
  if (children.length === 0 || competencies.length === 0) return [];
  const offset =
    ((dayIndex % competencies.length) + competencies.length) %
    competencies.length;
  return children.map((child, i) => ({
    childId: child.id,
    competency: competencies[(i + offset) % competencies.length],
  }));
}
