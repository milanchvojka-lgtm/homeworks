import "server-only";
import { db } from "@/lib/db";
import { dayResult } from "@/lib/streak";
import { startOfDayPrague, startOfMonthPrague, startOfWeekPrague } from "@/lib/time";
import { formatTimePrague } from "@/app/child/_components/format";

export type ChipState = "done" | "waiting" | "returned" | "missed" | "open" | "none";

export type DayCheck = { id: string; name: string; meta: string; state: ChipState };

export type WeekDay = {
  iso: string;
  label: string;
  isToday: boolean;
  state: ChipState;
  openCount: number;
  checks: DayCheck[];
  /** D20: a failed closed day of the running week in the current month. */
  canExcuse: boolean;
};

const WEEKDAY = ["Ne", "Po", "Út", "St", "Čt", "Pá", "So"];

/** "St 23. 9." (Europe/Prague). */
function dayLabel(d: Date, isToday: boolean): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "numeric",
    weekday: "short",
    timeZone: "Europe/Prague",
  }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const dow = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(get("weekday"));
  return `${WEEKDAY[dow]} ${Number(get("day"))}. ${Number(get("month"))}.${isToday ? " · dnes" : ""}`;
}

function checkMeta(c: {
  status: string;
  submittedAt: Date | null;
  note: string | null;
  reviewer: { name: string } | null;
}): { meta: string; state: ChipState } {
  const at = c.submittedAt ? `nahlášeno ${formatTimePrague(c.submittedAt)}` : null;
  switch (c.status) {
    case "APPROVED":
      if (c.note === "Uznáno zpětně")
        return { meta: `uznáno zpětně${c.reviewer ? ` · ${c.reviewer.name}` : ""}`, state: "done" };
      return {
        meta: [at, c.reviewer ? `schváleno · ${c.reviewer.name}` : "schváleno"].filter(Boolean).join(" · "),
        state: "done",
      };
    case "SUBMITTED":
      return { meta: `${at ?? "nahlášeno"}, čeká na schválení`, state: "waiting" };
    case "REJECTED":
      return { meta: c.note ? `vráceno: „${c.note}“` : "vráceno", state: "returned" };
    case "MISSED":
      return { meta: "nenahlášeno do půlnoci", state: "missed" };
    default:
      return { meta: "zatím nenahlášeno", state: "open" };
  }
}

/** Days of the running week up to today with the state of the child's checks (pen `DayRow`). */
export async function getChildWeek(userId: string, now: Date = new Date()): Promise<WeekDay[]> {
  const weekStart = startOfWeekPrague(now);
  const today = startOfDayPrague(now);
  const thisMonth = startOfMonthPrague(now).getTime();

  const instances = await db.dailyCheckInstance.findMany({
    where: { userId, date: { gte: weekStart, lte: today } },
    include: {
      dailyCheck: { select: { name: true, order: true } },
      reviewer: { select: { name: true } },
    },
    orderBy: [{ date: "asc" }],
  });

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    // Noon offset keeps the day right across DST changes.
    const day = startOfDayPrague(new Date(weekStart.getTime() + i * 86_400_000 + 12 * 3600_000));
    if (day > today) break;
    const isToday = day.getTime() === today.getTime();
    const list = instances
      .filter((x) => x.date.getTime() === day.getTime())
      .sort((a, b) => a.dailyCheck.order - b.dailyCheck.order);
    const checks = list.map((c) => ({ id: c.id, name: c.dailyCheck.name, ...checkMeta(c) }));
    const statuses = list.map((c) => c.status);
    const openCount = statuses.filter((s) => s === "PENDING" || s === "REJECTED").length;

    let state: ChipState;
    if (list.length === 0) state = "none";
    else if (!isToday && dayResult(statuses) === "FAIL") state = "missed";
    else if (isToday && statuses.includes("REJECTED")) state = "returned";
    else if (isToday && openCount > 0) state = "open";
    else if (statuses.includes("SUBMITTED")) state = "waiting";
    else state = "done";

    days.push({
      iso: day.toISOString(),
      label: dayLabel(day, isToday),
      isToday,
      state,
      openCount,
      checks,
      canExcuse:
        !isToday && state === "missed" && startOfMonthPrague(day).getTime() === thisMonth,
    });
  }
  return days;
}
