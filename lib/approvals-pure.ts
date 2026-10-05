/** D37: pure helpers for Schválit when the other parent cleared the queue. No DB I/O. */

export type Resolution = { reviewer: { id: string; name: string }; reviewedAt: Date };

/**
 * The batch the other parent resolved after the viewer's own last resolution today:
 * how many, by whom (the latest) and when. Null when there is none.
 */
export function clearedByOther(
  resolutions: Resolution[],
  viewerId: string,
): { count: number; name: string; at: Date } | null {
  const newestFirst = [...resolutions].sort((a, b) => b.reviewedAt.getTime() - a.reviewedAt.getTime());
  const mine = newestFirst.findIndex((r) => r.reviewer.id === viewerId);
  const batch = mine === -1 ? newestFirst : newestFirst.slice(0, mine);
  if (batch.length === 0) return null;
  return { count: batch.length, name: batch[0].reviewer.name, at: batch[0].reviewedAt };
}

/** "před chvílí", "před 10 min", then the clock time "v 09:05". */
export function formatAgo(date: Date, now: Date = new Date()): string {
  const minutes = Math.floor((now.getTime() - date.getTime()) / 60_000);
  if (minutes < 1) return "před chvílí";
  if (minutes < 60) return `před ${minutes} min`;
  const time = date.toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Prague" });
  return `v ${time}`;
}
