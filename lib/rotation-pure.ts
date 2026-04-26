import { startOfWeekPrague } from "./time";

/** Pevný anchor — pondělí 2025-12-29 00:00 Prague (libovolné, fixní). */
export const ROTATION_EPOCH = startOfWeekPrague(
  new Date("2025-12-29T00:00:00+01:00"),
);

export function computeWeekIndex(weekStart: Date): number {
  // Math.round (ne floor): při DST přechodu má týden 167 nebo 169 hodin místo 168.
  // Vstupem je vždy week-aligned Date z startOfWeekPrague, takže se pohybujeme
  // ±1h kolem násobku 168h — round správně vrátí celé číslo týdnu.
  const ms = weekStart.getTime() - ROTATION_EPOCH.getTime();
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
}

/**
 * Čistá funkce: pro daný week index spočítá, které dítě dostane kterou kompetenci.
 * Rotace: 3 holky × 3 kompetence, posun každý týden.
 */
export function rotateAssignments<C>(
  children: { id: string }[],
  competencies: C[],
  weekIndex: number,
): { childId: string; competency: C }[] {
  if (children.length === 0 || competencies.length === 0) return [];
  const offset =
    ((weekIndex % competencies.length) + competencies.length) %
    competencies.length;
  return children.map((child, i) => ({
    childId: child.id,
    competency: competencies[(i + offset) % competencies.length],
  }));
}
