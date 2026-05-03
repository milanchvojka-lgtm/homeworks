import { describe, expect, it } from "vitest";
import { countMissedDays, earliestMissDate, type BonusCheck } from "@/lib/bonus-pure";
import {
  endOfMonthPrague,
  isLastDayOfMonthInPrague,
  startOfMonthPrague,
} from "@/lib/time";

describe("countMissedDays", () => {
  it("empty list → 0", () => {
    expect(countMissedDays([])).toBe(0);
  });

  it("only APPROVED/SUBMITTED/PENDING → 0", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-01"), status: "APPROVED" },
      { date: new Date("2026-04-02"), status: "SUBMITTED" },
      { date: new Date("2026-04-03"), status: "PENDING" },
    ];
    expect(countMissedDays(items)).toBe(0);
  });

  it("counts distinct miss days (MISSED + REJECTED merged per day)", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-05"), status: "MISSED" },
      { date: new Date("2026-04-05"), status: "REJECTED" }, // same day → still 1
      { date: new Date("2026-04-10"), status: "MISSED" },
      { date: new Date("2026-04-15"), status: "REJECTED" },
    ];
    expect(countMissedDays(items)).toBe(3);
  });
});

describe("earliestMissDate", () => {
  it("returns null when no misses", () => {
    expect(earliestMissDate([])).toBeNull();
    expect(earliestMissDate([{ date: new Date("2026-04-01"), status: "APPROVED" }])).toBeNull();
  });

  it("returns earliest among MISSED/REJECTED", () => {
    const items: BonusCheck[] = [
      { date: new Date("2026-04-15"), status: "MISSED" },
      { date: new Date("2026-04-10"), status: "REJECTED" },
      { date: new Date("2026-04-20"), status: "MISSED" },
    ];
    const r = earliestMissDate(items);
    expect(r?.toISOString()).toBe("2026-04-10T00:00:00.000Z");
  });
});

describe("month boundaries in Prague", () => {
  it("startOfMonthPrague returns 1st 00:00 Prague (CEST in April)", () => {
    const apr15 = new Date("2026-04-15T12:00:00Z");
    // 1.4.2026 00:00 Prague = 31.3.2026 22:00 UTC (CEST = UTC+2)
    expect(startOfMonthPrague(apr15).toISOString()).toBe(
      "2026-03-31T22:00:00.000Z",
    );
  });

  it("endOfMonthPrague returns last day 23:59:59.999 Prague", () => {
    const apr15 = new Date("2026-04-15T12:00:00Z");
    // 30.4.2026 23:59:59.999 Prague = 30.4.2026 21:59:59.999 UTC (CEST)
    expect(endOfMonthPrague(apr15).toISOString()).toBe(
      "2026-04-30T21:59:59.999Z",
    );
  });

  it("isLastDayOfMonthInPrague: late on the 30th April Prague", () => {
    // 30.4.2026 23:30 Prague = 21:30 UTC (CEST)
    expect(
      isLastDayOfMonthInPrague(new Date("2026-04-30T21:30:00Z")),
    ).toBe(true);
  });

  it("isLastDayOfMonthInPrague: 29th Apr Prague is NOT last", () => {
    expect(
      isLastDayOfMonthInPrague(new Date("2026-04-29T12:00:00Z")),
    ).toBe(false);
  });
});
