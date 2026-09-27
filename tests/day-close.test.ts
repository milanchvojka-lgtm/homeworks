import { describe, it, expect } from "vitest";
import { daysToClose, monthRef, previousMonthEnd, previousWeekStart } from "@/lib/day-close-pure";
import { startOfDayPrague, startOfWeekPrague } from "@/lib/time";

const d = (iso: string) => new Date(iso);

describe("daysToClose", () => {
  const today = d("2026-09-26T22:00:00Z"); // 27. 9. in Prague
  const days = [
    d("2026-09-24T22:00:00Z"),
    d("2026-09-25T22:00:00Z"),
    d("2026-09-25T22:00:00Z"),
    d("2026-09-26T22:00:00Z"),
  ];
  it("never closes today, dedupes and sorts", () => {
    expect(daysToClose(days, null, today).map((x) => x.toISOString())).toEqual([
      "2026-09-24T22:00:00.000Z",
      "2026-09-25T22:00:00.000Z",
    ]);
  });
  it("skips days up to lastStreakDate", () => {
    expect(daysToClose(days, d("2026-09-24T22:00:00Z"), today).map((x) => x.toISOString())).toEqual([
      "2026-09-25T22:00:00.000Z",
    ]);
  });
});

describe("previousWeekStart", () => {
  it("Monday 00:15 closes the week that just ended", () => {
    // Mon 28. 9. 00:15 CEST
    expect(previousWeekStart(d("2026-09-27T22:15:00Z")).toISOString()).toBe(
      startOfWeekPrague(d("2026-09-23T10:00:00Z")).toISOString(),
    );
  });
  it("a delayed Sunday-night run still closes the previous week, never the running one", () => {
    // Sun 27. 9. 23:59 CEST → previous week is 14.–20. 9.
    expect(previousWeekStart(d("2026-09-27T21:59:00Z")).toISOString()).toBe(
      startOfWeekPrague(d("2026-09-16T10:00:00Z")).toISOString(),
    );
  });
});

describe("previousMonthEnd / monthRef", () => {
  it("1. 10. closes September", () => {
    const end = previousMonthEnd(d("2026-09-30T22:15:00Z")); // 1. 10. 00:15 CEST
    expect(monthRef(end)).toBe("2026-09");
    expect(startOfDayPrague(end).toISOString()).toBe("2026-09-29T22:00:00.000Z");
  });
  it("the last day of a month still closes the month before", () => {
    expect(monthRef(previousMonthEnd(d("2026-09-30T20:00:00Z")))).toBe("2026-08");
  });
});
