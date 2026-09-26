/** "1 h 30 min", "45 min", "2 h" — minutes shown to children. */
export function formatMinutes(total: number): string {
  const m = Math.max(0, Math.round(total));
  const h = Math.floor(m / 60);
  const rest = m % 60;
  if (h === 0) return `${rest} min`;
  if (rest === 0) return `${h} h`;
  return `${h} h ${rest} min`;
}

/** Screen-time minutes a credit amount buys, rounded down to the granularity. */
export function affordableMinutes(
  balanceCzk: number,
  hourCostCzk: number,
  granularity: number,
): number {
  if (hourCostCzk <= 0 || granularity <= 0) return 0;
  const raw = (Math.max(0, balanceCzk) / hourCostCzk) * 60;
  return Math.floor(raw / granularity) * granularity;
}

/** Minutes a screen-time amount in CZK represents. */
export function czkToMinutes(czk: number, hourCostCzk: number): number {
  return hourCostCzk > 0 ? (czk / hourCostCzk) * 60 : 0;
}

/** "18:20" in Europe/Prague. */
export function formatTimePrague(date: Date | string): string {
  return new Date(date).toLocaleTimeString("cs-CZ", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Prague",
  });
}
